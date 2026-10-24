import { spawn } from "child_process";

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

console.log("\x1b[36m%s\x1b[0m", "=================================================");
console.log("\x1b[36m%s\x1b[0m", " Starting ThreadCraft Full-Stack Application... ");
console.log("\x1b[36m%s\x1b[0m", "   • Backend API:  http://localhost:5000");
console.log("\x1b[36m%s\x1b[0m", "   • Frontend UI:  http://localhost:5173");
console.log("\x1b[36m%s\x1b[0m", "=================================================\n");

const backend = spawn(npmCmd, ["run", "dev"], {
    cwd: "./backend",
    stdio: "inherit",
    shell: true
});

const frontend = spawn(npmCmd, ["run", "dev"], {
    cwd: "./frontend",
    stdio: "inherit",
    shell: true
});

const handleExit = () => {
    try { backend.kill(); } catch {}
    try { frontend.kill(); } catch {}
    process.exit();
};

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
process.on("exit", handleExit);
