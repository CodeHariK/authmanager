import { createClient } from "redis";
import { env } from "@/env";

export async function GET() {
	const client = createClient({
		username: env.REDIS_USERNAME,
		password: env.REDIS_PASSWORD,
		socket: {
			host: env.REDIS_HOST,
			port: env.REDIS_PORT,
		},
	});
	
	try {
		if (!client.isOpen) {
			await client.connect();
		}
		await client.ping();
		return Response.json({ ok: true, service: "redis" });
	} catch (error) {
		return Response.json(
			{ ok: false, service: "redis", error: (error as Error).message },
			{ status: 500 }
		);
	} finally {
		if (client.isOpen) {
			await client.quit();
		}
	}
}
