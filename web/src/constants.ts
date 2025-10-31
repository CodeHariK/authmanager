import { env } from "@/env";

export const DATABASE_URL = env.GOOSE_DBSTRING
export const BASE_URL = env.NEXT_PUBLIC_BASE_URL;

export const ROUTE_PATH = {
	HEALTH_DB: "/health/db",
	HEALTH_REDIS: "/health/redis",
} as const;

export const ROUTE_URL = {
	HEALTH_DB: `${BASE_URL}/api/${ROUTE_PATH.HEALTH_DB}`,
	HEALTH_REDIS: `${BASE_URL}/api/${ROUTE_PATH.HEALTH_REDIS}`,
} as const;
