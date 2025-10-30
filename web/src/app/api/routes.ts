
export const ROUTE_PATH = {
	HEALTH_DB: "/health/db",
} as const;

const BASE = process.env.API_URL.replace(/\/+$/, "");

export const ROUTE_URL = {
	HEALTH_DB: `${BASE}${ROUTE_PATH.HEALTH_DB}`,
} as const;
