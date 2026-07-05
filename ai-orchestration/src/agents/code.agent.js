// import { ChatMistralAI } from "@langchain/mistralai";
// import { listFiles, readFiles, updateFiles, createFiles } from "./tools.js";
// import { createAgent, } from "langchain";

// const model = new ChatMistralAI({
//     model: "mistral-medium-latest",
//     apiKey: process.env.MISTRAL_API_KEY
// })

// const agent = createAgent({
//     model,
//     tools: [listFiles, readFiles, updateFiles, createFiles],

// })

// await agent.invoke({
//     messages: [
//         {
//             role: "user",
//             content: "Chnage light to black"
//         }
//     ]
// })


import { ChatMistralAI } from "@langchain/mistralai";
import { listFiles, readFiles, updateFiles, createFiles } from "./tools.js";
import { createAgent, } from "langchain";
const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: "zFze0nuJANueTHhi797UjSCwkKPS35aW"
})
const agent = createAgent({
    model,
    tools: [listFiles, readFiles, updateFiles, createFiles],
})
const result = await agent.invoke({
    messages: [
        {
            role: "user",
            content: "build snake game in home page app.jsx"
        }
    ]
});
const finalMessage = result.messages[result.messages.length - 1];
console.log("\nAgent Output:\n" + finalMessage.content);