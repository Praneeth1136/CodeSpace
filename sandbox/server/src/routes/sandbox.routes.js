import { Router } from "express";
import { createPod, waitForPodReady, deletePod } from '../kubernetes/pod.js';
import { createService, deleteService } from '../kubernetes/service.js';
import { createSandboxkey, deleteSandboxKeys } from '../config/redis.js';
import { v7 as uuidv7 } from "uuid"

import { authMiddleware } from "../middlewares/auth.middleware.js";
import Project from "../models/project.model.js";
import { k8sCoreV1Api } from "../kubernetes/config.js";


const router = Router();



router.post('/project', authMiddleware, async (req, res) => {
    if (!req.body || !req.body.title) {
        return res.status(400).json({ message: 'Title is required in the request body.' });
    }
    const { title } = req.body;

    const newProject = new Project({
        user: req.user.id || req.user.userId,
        title
    });

    await newProject.save();

    return res.status(201).json({
        message: 'Project created successfully',
        project: newProject
    });
})

router.post("/start", authMiddleware, async (req, res) => {

    if (!req.body || !req.body.projectId) {
        return res.status(400).json({ message: 'projectId is required in the request body. Make sure you are sending JSON with Content-Type: application/json' });
    }
    const projectId = req.body.projectId;

    // Verify that the project belongs to the authenticated user
    const project = await Project.findOne({ _id: projectId, user: req.user.id || req.user.userId });

    if (!project) {
        return res.status(404).json({ message: 'Project not found or access denied' });
    }

    const sandboxId = uuidv7();
    const agentToken = uuidv7() + uuidv7();

    try {
        const pod = await createPod(sandboxId, projectId, agentToken);
        const service = await createService(sandboxId);
        const key = await createSandboxkey(sandboxId);

        // Save sandboxId to the project so we can track its pod status later
        project.lastSandboxId = sandboxId;
        await project.save();

        // Wait for the pod to be fully Running before returning
        await waitForPodReady(sandboxId);

        res.status(200).json({
            message: "   Container Created successfully",
            sandboxId,
            agentToken,
            // service,
            previewUrl: `https://${sandboxId}.preview.praneethkilaparthi.dev`
        })
    }
    catch (error) {
        console.error("Error creating sandbox:", error);
        res.status(500).json({ message: "Internal server error" })
    }
})


router.get("/project", authMiddleware, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user.id || req.user.userId }).sort({ updatedAt: -1 });

        // Check pod status for each project that has a lastSandboxId
        const projectsWithStatus = await Promise.all(projects.map(async (project) => {
            const projectObj = project.toObject();
            projectObj.status = 'stopped'; // default

            if (project.lastSandboxId) {
                try {
                    const podResponse = await k8sCoreV1Api.readNamespacedPod({
                        name: `sandbox-pod-${project.lastSandboxId}`,
                        namespace: "default"
                    });

                    const phase = podResponse.status?.phase;
                    const readyCondition = podResponse.status?.conditions?.find(c => c.type === 'Ready');

                    if (phase === 'Running' && readyCondition?.status === 'True') {
                        projectObj.status = 'running';
                    } else if (phase === 'Pending') {
                        projectObj.status = 'waking';
                    }
                } catch (err) {
                    // Pod not found (404) means it's stopped/expired
                    projectObj.status = 'stopped';
                }
            }

            return projectObj;
        }));

        return res.status(200).json({
            message: 'Projects retrieved successfully',
            projects: projectsWithStatus
        });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})


router.delete("/project/:id", authMiddleware, async (req, res) => {
    try {
        const projectId = req.params.id;

        // Verify that the project belongs to the authenticated user
        const project = await Project.findOne({ _id: projectId, user: req.user.id || req.user.userId });

        if (!project) {
            return res.status(404).json({ message: 'Project not found or access denied' });
        }

        // If there's an active sandbox, clean up all K8s and Redis resources
        if (project.lastSandboxId) {
            const sandboxId = project.lastSandboxId;

            try {
                await deletePod(sandboxId);
            } catch (err) {
                if (err.response?.statusCode !== 404) {
                    console.error(`Error deleting pod for sandbox ${sandboxId}:`, err.message);
                }
            }

            try {
                await deleteService(sandboxId);
            } catch (err) {
                if (err.response?.statusCode !== 404) {
                    console.error(`Error deleting service for sandbox ${sandboxId}:`, err.message);
                }
            }

            // Clean up Redis keys
            try {
                await deleteSandboxKeys(sandboxId);
            } catch (err) {
                console.error(`Error cleaning Redis for sandbox ${sandboxId}:`, err.message);
            }
        }

        // Delete the project document from MongoDB
        await Project.deleteOne({ _id: projectId });

        return res.status(200).json({ message: 'Project deleted successfully' });

    } catch (error) {
        console.error("Error deleting project:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})


export default router;