import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./src/constants";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/*.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: DATABASE_URL!,
	},
});
