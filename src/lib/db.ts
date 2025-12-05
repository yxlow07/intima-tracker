import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "intima-tracker.db");
const db = new Database(dbPath);

// Initialize database schema
const schemaPath = path.join(process.cwd(), "src/lib/schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");
db.exec(schema);

export default db;
