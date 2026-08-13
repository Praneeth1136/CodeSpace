import { Router } from "express";
import { createPod, waitForPodReady } from '../kubernetes/pod.js';
import { createService } from '../kubernetes/service.js';
import { createSandboxkey } from '../config/redis.js';
import { v7 as uuidv7 } from "uuid"
import { authMiddleware } from "../middlewares/auth.middleware.js";
import Project from "../models/project.model.js";


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

    try {
        const pod = await createPod(sandboxId, projectId);
        const service = await createService(sandboxId);
        const key = await createSandboxkey(sandboxId);

        // Wait for the pod to be fully Running before returning
        await waitForPodReady(sandboxId);

        res.status(200).json({
            message: "   Container Created successfully",
            sandboxId,
            // service,
            previewUrl: `http://${sandboxId}.preview.localhost`
        })
    }
    catch (error) {
        console.error("Error creating sandbox:", error);
        res.status(500).json({ message: "Internal server error" })
    }
})


router.get("/project", authMiddleware, async (req, res) => {
    const projects = await Project.find({ user: req.user.id || req.user.userId });

    return res.status(200).json({
        message: 'Projects retrieved successfully',
        projects
    })
})


export default router;