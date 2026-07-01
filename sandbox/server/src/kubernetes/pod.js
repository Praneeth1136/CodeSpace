import {k8sCoreV1Api} from "./config.js" 
import { v4 as uuidv4 } from "uuid";

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
                    }
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