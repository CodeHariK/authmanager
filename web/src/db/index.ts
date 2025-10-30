import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { DATABASE_URL } from "@/constants";

const connectionString = DATABASE_URL;
if (!connectionString) {
	throw new Error("GOOSE_DBSTRING is not set");
}

export const pool = new Pool({
	connectionString,
	ssl: { rejectUnauthorized: false },
});

export const db = drizzle({ client: pool, schema });
