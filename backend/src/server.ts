import fs from "node:fs";
import path from "node:path";
import { app } from "./app";
import { closePool } from "./config/database";
import { env } from "./config/env";

const ensureDirectory = (directoryPath: string): void => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

const bootstrapDirectories = (): void => {
  const directories = [
    path.resolve(process.cwd(), env.UPLOAD_DIR),
    path.resolve(process.cwd(), env.UPLOAD_DIR, "students"),
    path.resolve(process.cwd(), env.UPLOAD_DIR, "staff"),
    path.resolve(process.cwd(), env.UPLOAD_DIR, "assignments"),
    path.resolve(process.cwd(), env.UPLOAD_DIR, "school"),
    path.resolve(process.cwd(), env.UPLOAD_DIR, "temporary"),
    path.resolve(process.cwd(), env.BACKUP_DIR),
    path.resolve(process.cwd(), "logs")
  ];

  for (const directory of directories) {
    ensureDirectory(directory);
  }
};

bootstrapDirectories();

const server = app.listen(env.PORT, () => {
  console.log(`School management backend listening on port ${env.PORT}`);
});

const shutdown = async (): Promise<void> => {
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
