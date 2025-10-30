import { describe, it, expect } from "bun:test";
import { ROUTE_PATH,ROUTE_URL } from "../../routes";

async function tryFetch(url: string) {
	const res = await fetch(url, { method: "GET" }).catch(() => null);
	return res;
}

describe("[integration] GET /api/health/db", () => {
	it("returns ok: true when server and DB are healthy", async () => {
		const res = await tryFetch(ROUTE_URL.HEALTH_DB);
		if (!res) {
			throw new Error(
				`Could not connect to ${ROUTE_URL.HEALTH_DB}. Start the dev server: bun run dev`
			);
		}

		expect(res.status).toBe(200);
		const body = (await res.json()) as { ok: boolean } | { ok: false; error: string };
		expect(body).toEqual({ ok: true });
	});
});
