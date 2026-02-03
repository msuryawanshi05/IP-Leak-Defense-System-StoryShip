export const ROUTES = {
  Home: "/",
  Dashboard: "/dashboard",
  Files: "/files",
  IPAssets: "/assets",
  Gallery: "/gallery",
  Analytics: "/analytics",
} as const

export const LANDING_ASSET_URL = "/mnt/data/Screen Recording 2025-11-24 221914.mp4"

export type RouteKey = keyof typeof ROUTES

