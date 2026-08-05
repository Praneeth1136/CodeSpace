import { k8sCoreV1Api } from "./config.js";

export async function createService(sandboxId){
    const serviceManifest = {
        metadata:{
            name:`sandbox-service-${sandboxId}`,
            labels:{
                app:`sandbox`,
                sandboxId:sandboxId
            }
        },
        spec:{
            selector:{
                app:`sandbox`,
                sandboxId:sandboxId
            },
            type:"ClusterIP",
            ports:[
                {   
                    name:'http',
                    port:80,
                    targetPort:5173,
                    protocol:"TCP"
                },
                {
                    name:'agent-http',
                    port:3000,
                    targetPort:3000,
                    protocol:'TCP'
                }
            ]
        }
    }

    const response = await k8sCoreV1Api.createNamespacedService({
        namespace:"default",
        body:serviceManifest
    });

    return response
}

export async function deleteService(sandboxId){
    const response = await k8sCoreV1Api.deleteNamespacedService({
        name:`sandbox-service-${sandboxId}`,
        namespace:"default"
    },{
        gracePeriodsScene:0
    })
    return response
}