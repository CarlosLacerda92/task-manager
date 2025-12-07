import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

console.log(fileURLToPath(import.meta.url));
console.log(import.meta.url);

type Task = {
    id: number;
    description: string;
    done: boolean;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const file       = path.join(__dirname, "..", "tasks.json");

function loadTasks(): Task[] {

    if (!fs.existsSync(file)) {
        return [];
    }

    const data = fs.readFileSync(file, 'utf-8');

    try {
        return JSON.parse(data) as Task[];
    }
    catch (error) {
        console.log("⚠️ tasks.json is corrupted. Starting with an empty list.");
        return [];
    }
}

function saveTasks(tasks: Task[]): void {
    fs.writeFileSync(file, JSON.stringify(tasks, null, 2))
}

function addTask(description: string): void {

    if (typeof description !== "string" || description.trim() === "") {
        throw new Error("Task description must be a non-empty string");
    }

    const tasks = loadTasks();

    const newTask: Task = {
        id: Date.now(),
        description: description.trim(),
        done: false,
    };

    tasks.push(newTask);

    saveTasks(tasks);

    console.log(`✅ Task added: "${description}"`);
}

function listTasks(): void {

    const tasks = loadTasks();

    if (tasks.length === 0) {
        console.log(`📭 No tasks yet.`);
        return;
    }

    tasks.forEach((task) => {
        console.log(`${task.done ? '✔️' : '❌'} [${task.id}] ${task.description}`);
    });
}

function getSpecificTask(id: number): Task|null {

    const tasks = loadTasks();

    return tasks.find(task => task.id === id) ?? null;
}

function deleteTask(id: number): void {

    const foundTask = getSpecificTask(id);

    if (!foundTask) {
        console.log('⚠️ No task found with the provided ID.')
        return;
    }

    const tasks = loadTasks();

    const filteredTasks = tasks.filter(task => task.id !== id);

    saveTasks(filteredTasks);

    console.log(`✅ Task ${id} removed successfully.`);
}

const command = process.argv[2];
const arg     = process.argv[3];

switch (command) {

    case 'add':

        if (!arg) {
            console.log('⚠️ Please provide a task description.');
            break;
        }

        try {
            addTask(arg!.trim());
        }
        catch (error) {
            console.log(`An unexpected error occurred: ${error}`)
        }

        break;

    case 'list':
        listTasks();
        break;
    
    case 'delete':

        if (!arg) {
            console.log('⚠️ Please provide the ID of the task that should be deleted.');
            break;
        }

        const taskId = +(arg!.trim());

        if (isNaN(taskId)) {
            console.log('⚠️ Please provide a valid task ID.');
            break;
        }

        deleteTask(taskId);

        break;
    
    default:
        console.log("Usage: ts-node src/index.ts [add <task> | list | delete <id>]");
        
}