import { pool } from "../../../../db";

export async function GET() {
	try {
		await pool.query("select 1");
		return Response.json({ ok: true });
	} catch (error) {
		return new Response(
			JSON.stringify({ ok: false, error: (error as Error).message }),
			{ status: 500, headers: { "content-type": "application/json" } }
		);
	}
}
