import dotenv from "dotenv";

dotenv.config({ path: ".env" });

process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT ?? "5001";
process.env.DB_HOST = process.env.TEST_DB_HOST ?? process.env.DB_HOST ?? "localhost";
process.env.DB_PORT = process.env.TEST_DB_PORT ?? process.env.DB_PORT ?? "5432";
process.env.DB_NAME = process.env.TEST_DB_NAME ?? process.env.DB_NAME ?? "school_management";
process.env.DB_USER = process.env.TEST_DB_USER ?? process.env.DB_USER ?? "postgres";
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD ?? process.env.DB_PASSWORD ?? "123456";
process.env.DB_SCHEMA = process.env.TEST_DB_SCHEMA ?? process.env.DB_SCHEMA ?? "school_ms";
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? "test_access_secret_with_minimum_length_12345";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? "test_refresh_secret_with_minimum_length_12345";
process.env.JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ?? "12";
process.env.FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
process.env.UPLOAD_DIR = process.env.UPLOAD_DIR ?? "uploads";
process.env.BACKUP_DIR = process.env.BACKUP_DIR ?? "backups";
process.env.MAX_FILE_SIZE_MB = process.env.MAX_FILE_SIZE_MB ?? "5";
process.env.SCHOOL_TIMEZONE = process.env.SCHOOL_TIMEZONE ?? "Africa/Mogadishu";
process.env.PG_DUMP_PATH = process.env.PG_DUMP_PATH ?? "pg_dump";
