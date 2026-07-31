import axios from "axios";
import { tool } from "langchain";
import * as z from "zod"

export const listFiles = tool(
    async ({ sandboxId }) => {
        console.log("===================");
        console.log("Using list Files Tool");
        console.log("===================");
        try {
            const response = await axios.get(`http://sandbox-service-${sandboxId}:3000/list-files`);

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
    async ({ sandboxId, files }) => {

        console.log("===================");
        console.log("Using Read Files Tool");
        console.log("===================");

        try {
            const response = await axios.get(`http://sandbox-service-${sandboxId}:3000/read-files`, {
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
        sandboxId: z.string().describe("ID of the sandbox"),
        files: z.array(z.string()).describe("Array of file paths to read"),
    })
}
)


export const createFiles = tool(
    async ({ sandboxId, file }) => {

        console.log("===================");
        console.log("Using create Files Tool");
        console.log("===================");

        try {
            const response = await axios.post(`http://sandbox-service-${sandboxId}:3000/create-files`, {
                files: file,
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
        sandboxId: z.string().describe("ID of the sandbox"),
        file: z.array(z.object({
            file: z.string().describe("Path to the file to create"),
            content: z.string().describe("Content of the file"),
        })).describe("Array of files to create"),
    })
}
)


export const updateFiles = tool(
    async ({ sandboxId, updates }) => {

        console.log("===================");
        console.log("Using update Files Tool");
        console.log("===================");

        try {
            const response = await axios.patch(`http://sandbox-service-${sandboxId}:3000/update-files`, {
                updates: updates,
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
        sandboxId: z.string().describe("ID of the sandbox"),
        updates: z.array(z.object({
            file: z.string().describe("Path to the file to update"),
            content: z.string().describe("Content of the file"),
        })).describe("Array of files to update"),
    })
}
)


// import axios from 'axios';
// import { tool } from "langchain"
// import * as z from "zod";


// export const listFiles = tool(
//     async ({ }, config) => {

//         const writer = config.context?.writer ?? (() => { });

//         writer("Listing files in project directory...\n");

//         const response = await axios.get(`http://sandbox-service-${config.context.projectId}:3000/list-files`)

//         writer("Files listed successfully." + "Files: " + response.data.files.join(",") + "\n");

//         return JSON.stringify(response.data.files);
//     },
//     {
//         name: "list_files",
//         description: "List all the files in the project directory. This is useful for understanding what files are available to work with.",
//         schema: z.object({})
//     }
// )

// export const readFiles = tool(
//     async ({ files = [] }, config) => {

//         const writer = config.context?.writer ?? (() => { });

//         writer("Reading files..." + files.join(",") + "\n");

//         const response = await axios.get(`http://sandbox-service-${config.context.projectId}:3000/read-files?files=` + files.join(","))

//         writer("Files read successfully.\n");
//         return JSON.stringify(response.data);
//     },
//     {
//         name: "read_files",
//         description: "Read the contents of specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
//         schema: z.object({
//             files: z.array(z.string()).describe("The list of files absolute paths to read. These should be files that were listed using the list_files tool or created later")
//         })
//     }
// )

// export const updateFiles = tool(
//     async ({ files }, config) => {
//         const writer = config.context?.writer ?? (() => { });

//         writer("Updating files..." + files.map(f => f.file).join(",") + "\n");


//         const response = await axios.patch(`http://sandbox-service-${config.context.projectId}:3000/update-files`, {
//             updates: files
//         })

//         writer("Files updated successfully.\n");


//         return JSON.stringify(response.data.results);
//     },
//     {
//         name: "update_files",
//         description: "Update the contents of specified files. This is useful for making changes to files based on the requirements of the task at hand. this tool can also use to create new files by providing a new file name in the file field and the content to be added in the content field.",
//         schema: z.object({
//             files: z.array(z.object({
//                 file: z.string().describe("The absolute path of the file to update"),
//                 content: z.string().describe("The new content for the file, the content should support json format.")
//             })).describe("The list of files to update and their new contents")
//         })
//     }
// )