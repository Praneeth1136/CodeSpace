import axios from "axios";
import { tool } from "langchain";
import * as z from "zod"

export const listFiles = tool(
    async ({ }) => {
        console.log("===================");
        console.log("Using list Files Tool");
        console.log("===================");
        try {
            const response = await axios.get("http://127.0.0.1/list-files", {
                headers: {
                    'Host': '019f2f12-af8f-750e-b4d3-54c36f208053.agent.localhost'
                }
            });

            console.log("===================");
            console.log("Response from list files tool:", response.data.files);
            console.log("===================");
            return response.data.files;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }, {
    name: "list_files",
    description: "List all files in the sandbox",
    schema: z.object({
        sandboxId: z.string().describe("ID of the sandbox"),
    })
}
)

export const readFiles = tool(
    async ({ files }) => {

        console.log("===================");
        console.log("Using Read Files Tool");
        console.log("===================");

        try {
            const response = await axios.get("http://127.0.0.1/read-files", {
                headers: {
                    'Host': '019f2f12-af8f-750e-b4d3-54c36f208053.agent.localhost'
                },
                params: {
                    files: files.join(","),
                }
            });

            console.log("==================");
            console.log("Response from read files tool:", response.data.files);
            console.log("==================");
            return JSON.stringify(response.data);
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }, {
    name: "read_files",
    description: "Read files from the sandbox",
    schema: z.object({
        files: z.array(z.string()).describe("Array of file paths to read"),
    })
}
)


export const createFiles = tool(
    async ({ file }) => {

        console.log("===================");
        console.log("Using create Files Tool");
        console.log("===================");

        try {
            const response = await axios.post("http://127.0.0.1/create-files", {
                files: file,
            }, {
                headers: {
                    'Host': '019f2f12-af8f-750e-b4d3-54c36f208053.agent.localhost'
                }
            });

            console.log("===================");
            console.log("Response from create files tool:", response.data);
            console.log("===================");

            return JSON.stringify(response.data);
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }, {
    name: "create_files",
    description: "Create files in the sandbox",
    schema: z.object({
        file: z.array(z.object({
            file: z.string().describe("Path to the file to create"),
            content: z.string().describe("Content of the file"),
        })).describe("Array of files to create"),
    })
}
)


export const updateFiles = tool(
    async ({ updates }) => {

        console.log("===================");
        console.log("Using update Files Tool");
        console.log("===================");

        try {
            const response = await axios.patch("http://127.0.0.1/update-files", {
                updates: updates,
            }, {
                headers: {
                    'Host': '019f2f12-af8f-750e-b4d3-54c36f208053.agent.localhost'
                }
            });

            console.log("===================");
            console.log("Response from update files tool:", response.data);
            console.log("===================");

            return JSON.stringify(response.data);
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }, {
    name: "update_files",
    description: "Update files in the sandbox",
    schema: z.object({
        updates: z.array(z.object({
            file: z.string().describe("Path to the file to update"),
            content: z.string().describe("Content of the file"),
        })).describe("Array of files to update"),
    })
}
)