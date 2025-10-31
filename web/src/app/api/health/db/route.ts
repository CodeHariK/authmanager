import { pool } from "@/db";

export async function GET() {
	try {
		await pool.query("SELECT 1");
		return Response.json({ ok: true, service: "postgres" });
	} catch (error) {
		return Response.json(
			{ ok: false, service: "postgres", error: (error as Error).message },
			{ status: 500 }
		);
	}
}
