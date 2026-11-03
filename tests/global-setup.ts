import { execSync } from "node:child_process";

export default async function globalSetup() {
  // factory-reset the demo DB before the suite so the flow is deterministic
  execSync("./node_modules/.bin/tsx db/seed.ts", { stdio: "inherit" });
}
