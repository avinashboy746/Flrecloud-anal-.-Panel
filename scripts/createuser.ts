import "dotenv/config";
import bcrypt from "bcryptjs";
import readline from "readline";
import path from "path";
import fs from "fs-extra";

const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

fs.ensureDirSync(DATA_DIR);
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");

console.log("=== FireCloud Panel Admin User Creation ===");

async function saveAdminUser(username: string, pass: string) {
  if (!username || !pass) {
    console.error("Username and password are required.");
    process.exit(1);
  }
  const users = await fs.readJson(USERS_FILE);
  const existingIndex = users.findIndex((u: any) => u.username === username);
  const hashedPassword = await bcrypt.hash(pass, 10);

  if (existingIndex !== -1) {
    users[existingIndex].password = hashedPassword;
    users[existingIndex].role = "admin";
    await fs.writeJson(USERS_FILE, users, { spaces: 2 });
    console.log(`✅ Admin user '${username}' updated successfully.`);
  } else {
    users.push({
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date().toISOString()
    });
    await fs.writeJson(USERS_FILE, users, { spaces: 2 });
    console.log(`✅ Admin user '${username}' created successfully.`);
  }
  process.exit(0);
}

// Check if provided via CLI arguments: npx tsx scripts/createuser.ts <username> <password>
const cliUser = process.argv[2];
const cliPass = process.argv[3];

if (cliUser && cliPass) {
  saveAdminUser(cliUser, cliPass);
} else {
  rl.question("Username: ", (username) => {
    rl.question("Password: ", (password) => {
      rl.close();
      saveAdminUser(username, password);
    });
  });
}
