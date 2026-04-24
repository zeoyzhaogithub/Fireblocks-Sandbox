import { execSync } from "node:child_process";

const cliPorts = process.argv
  .slice(2)
  .map((item) => Number(item))
  .filter((port) => Number.isFinite(port));

const defaultPorts = [3100, 4100, 5100];
const ports = cliPorts.length > 0 ? cliPorts : defaultPorts;

function killPort(port) {
  try {
    const output = execSync(`lsof -ti :${port}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    if (!output) {
      return;
    }

    const pids = output
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    for (const pid of pids) {
      try {
        process.kill(Number(pid), "SIGKILL");
        console.log(`[ports] killed pid ${pid} on :${port}`);
      } catch {
        // Ignore race condition if process already exited.
      }
    }
  } catch {
    // Ignore when no process is listening on this port.
  }
}

for (const port of ports) {
  killPort(port);
}
