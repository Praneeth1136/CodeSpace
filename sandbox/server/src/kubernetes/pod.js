import {k8sCoreV1Api} from "./config.js" 
// import { v4 as uuidv4 } from "uuid";

export async function createPod(sandboxId,projectId,agentToken){
    const podManifest = {
        metadata:{
            name:`sandbox-pod-${sandboxId}`,
            labels:{
                app:`sandbox`,
                sandboxId:sandboxId
            }
        },
        spec:{
            securityContext: {
                fsGroup: 1000
            },
            volumes:[
                {
                    name:"workspace-volume",
                    emptyDir:{}
                }
            ],
            initContainers: [
                {
                    name: 'init-container',
                    image: process.env.TEMPLATE_IMAGE || "052717075754.dkr.ecr.ap-south-1.amazonaws.com/template:latest",
                    imagePullPolicy: "Always",
                    command: [ 'sh', '-c', 'cp -r /workspace/. /seed/' ],
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/seed'
                        }
                    ],
                    resources: {
                        limits: { cpu: "250m", memory: "128Mi" },
                        requests: { cpu: "50m", memory: "64Mi" }
                    }
                }
            ],
            containers:[
                {
                    image: process.env.TEMPLATE_IMAGE || "052717075754.dkr.ecr.ap-south-1.amazonaws.com/template:latest",
                    imagePullPolicy: "Always",
                    name: 'sandbox-container',
                    securityContext: {
                        runAsNonRoot: true,
                        runAsUser: 1000
                    },
                    ports:[
                        {
                            containerPort:5173,
                            name:"web"
                        }
                    ],
                    resources:  {
                        limits:{
                            cpu:"500m",
                            memory:"256Mi"
                        },
                        requests:{
                            cpu:"50m",
                            memory:"128Mi"
                        }
                    },
                    volumeMounts:[
                        {
                            name:"workspace-volume",
                            mountPath:"/workspace"
                        }
                    ],
                },
                {
                    image: process.env.AGENT_IMAGE || "052717075754.dkr.ecr.ap-south-1.amazonaws.com/agent:latest",
                    imagePullPolicy: "Always",
                    name: 'agent-container',
                    securityContext: {
                        runAsNonRoot: true,
                        runAsUser: 1000
                    },
                    ports:[
                        {
                            containerPort:3000,
                            name:"web"
                        }
                    ],
                    resources:  {
                        limits:{
                            cpu:"500m",
                            memory:"256Mi"
                        },
                        requests:{
                            cpu:"50m",
                            memory:"128Mi"
                        }
                    },
                    volumeMounts:[
                        {
                            name:"workspace-volume",
                            mountPath:"/workspace"
                        }
                    ],
                    livenessProbe: {
                        httpGet: { path: '/health', port: 3000 },
                        initialDelaySeconds: 10,
                        periodSeconds: 15
                    },
                    readinessProbe: {
                        httpGet: { path: '/health', port: 3000 },
                        initialDelaySeconds: 5,
                        periodSeconds: 5
                    },
                    env: [
                        {
                            name: "AGENT_TOKEN",
                            value: agentToken
                        }
                    ]
                },
               {
                    image: process.env.SYNC_AGENT_IMAGE || "052717075754.dkr.ecr.ap-south-1.amazonaws.com/sync-agent:latest",
                    imagePullPolicy: "Always",
                    name: 'sync-agent-container',
                    securityContext: {
                        runAsNonRoot: true,
                        runAsUser: 1000
                    },
                    ports: [ { containerPort: 4000, name: "http" } ],
                    resources: {
                        limits: { cpu: "500m", memory: "256Mi" },
                        requests: { cpu: "50m", memory: "128Mi" }
                    },
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/workspace'
                        }
                    ],
                    livenessProbe: {
                        httpGet: { path: '/health', port: 4000 },
                        initialDelaySeconds: 10,
                        periodSeconds: 15
                    },
                    readinessProbe: {
                        httpGet: { path: '/health', port: 4000 },
                        initialDelaySeconds: 5,
                        periodSeconds: 5
                    },
                    env: [
                        {
                            name: "PROJECT_ID",
                            value: projectId
                        },
                        {
                            name: "AWS_ACCESS_KEY_ID",
                            valueFrom: {
                                secretKeyRef: {
                                    name: "aws",
                                    key: "AWS_ACCESS_KEY_ID"
                                }
                            }
                        },
                        {
                            name: "AWS_SECRET_ACCESS_KEY",
                            valueFrom: {
                                secretKeyRef: {
                                    name: "aws",
                                    key: "AWS_SECRET_ACCESS_KEY"
                                }
                            }

                        },
                        {
                            name: "AWS_REGION",
                            valueFrom: {
                                secretKeyRef: {
                                    name: "aws",
                                    key: "AWS_REGION"
                                }
                            }
                        }
                    ]
                }
            ]
        }
    }


    const response = await k8sCoreV1Api.createNamespacedPod({
        namespace:"default",
        body:podManifest
    });

    return response
}


//This is just for tajing time like if we click preview url it is hsowing error after
// refresh it is loading beacuse kubernetes still downloading the image thatswhy not working in first go
// actually we are calling the service before the pod is ready
//
export async function waitForPodReady(sandboxId, timeoutMs = 300000) {
    const podName = `sandbox-pod-${sandboxId}`;
    const startTime = Date.now();
    let isReady = false;
    
    while (!isReady) {
        if (Date.now() - startTime > timeoutMs) {
            throw new Error(`Timeout waiting for pod ${podName} to become ready`);
        }

        try {
            const response = await k8sCoreV1Api.readNamespacedPod({
                name: podName,
                namespace: "default"
            });
            
            const status = response.status;
            
            if (status && status.phase === 'Running') {
                const readyCondition = status.conditions?.find(c => c.type === 'Ready');
                if (readyCondition?.status === 'True') {
                    isReady = true;
                    // Add an extra 1 second delay to give Vite time to fully bind the port
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return;
                }
            }
        } catch (error) {
            console.error(`Error checking pod status:`, error.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}


export async function deletePod(sandboxId){
    const response = await k8sCoreV1Api.deleteNamespacedPod({
        name:`sandbox-pod-${sandboxId}`,
        namespace:"default"
    },{
        gracePeriodsScene:0
    })
    return response;
}