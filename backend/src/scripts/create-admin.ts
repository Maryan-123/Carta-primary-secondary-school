import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { query } from "../config/database";
import { ConflictError, NotFoundError } from "../utils/errors";
import { hashPassword } from "../utils/password";

const createAdmin = async (): Promise<void> => {
  const rl = readline.createInterface({ input, output });
  const username = (await rl.question("Username: ")).trim();
  const password = (await rl.question("Password: ")).trim();
  const firstName = (await rl.question("First name: ")).trim();
  const lastName = (await rl.question("Last name: ")).trim();
  rl.close();

  const roleRows = await query<{ id: number }>(`SELECT id FROM roles WHERE name = 'ADMINISTRATOR' LIMIT 1`);
  const role = roleRows[0];
  if (!role) {
    throw new NotFoundError("Administrator role was not found");
  }

  const existing = await query<{ id: number }>(`SELECT id FROM users WHERE username = $1 LIMIT 1`, [username]);
  if (existing[0]) {
    throw new ConflictError("Username already exists");
  }

  const passwordHash = await hashPassword(password);

  await query(
    `INSERT INTO users (role_id, username, password_hash, first_name, last_name, is_active, must_change_password)
     VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)`,
    [role.id, username, passwordHash, firstName, lastName]
  );

  console.log(`Administrator '${username}' created successfully.`);
};

void createAdmin();
