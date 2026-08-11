import postgres from "postgres";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set in environment.");
  process.exit(1);
}

async function runMigration() {
  const sql = postgres(databaseUrl as string, { max: 1 });
  try {
    console.log("[DB Migration] Connecting to Supabase PostgreSQL...");
    const migrationFilePath = path.resolve(__dirname, "../drizzle/0000_slippery_fallen_one.sql");
    const migrationSql = fs.readFileSync(migrationFilePath, "utf8");
    
    // Split by statement-breakpoint and execute
    const statements = migrationSql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await sql.unsafe(statement);
    }

    console.log(`[DB Migration] ✓ Successfully applied ${statements.length} migration statements!`);
  } catch (err: any) {
    console.error("[DB Migration] Migration error:", err.message);
  } finally {
    await sql.end();
  }
}

runMigration();
