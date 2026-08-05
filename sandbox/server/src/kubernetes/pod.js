import {k8sCoreV1Api} from "./config.js" 
// import { v4 as uuidv4 } from "uuid";

export async function createPod(sandboxId){
    const podManifest = {
        metadata:{
            name:`sandbox-pod-${sandboxId}`,
            labels:{
                app:`sandbox`,
                sandboxId:sandboxId
            }
        },
        spec:{
            volumes:[
                {
                    name:"workspace-volume",
                    emptyDir:{}
                }
            ],
            initContainers: [
                {
                    name: 'init-container',
                    image: "template:latest",
                    imagePullPolicy: "IfNotPresent",
                    command: [ 'sh', '-c', 'cp -r /workspace/. /seed/' ],
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/seed'
                        }
                    ]
                }
            ],
            containers:[
                {
                    image: "template:latest",
                    imagePullPolicy: "IfNotPresent",
                    name: 'sandbox-container',
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
                            cpu:"250m",
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
                    image: "agent:latest",
                    imagePullPolicy: "IfNotPresent",
                    name: 'agent-container',
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
                            cpu:"250m",
                            memory:"128Mi"
                        }
                    },
                    volumeMounts:[
                        {
                            name:"workspace-volume",
                            mountPath:"/workspace"
                        }
                    ],

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
export async function waitForPodReady(sandboxId) {
    const podName = `sandbox-pod-${sandboxId}`;
    let isReady = false;
    
    while (!isReady) {
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