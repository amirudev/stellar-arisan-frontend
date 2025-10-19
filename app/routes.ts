import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("freighter-test", "routes/freighter-test.tsx"),
  route("create-arisan", "routes/create-arisan.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("arisans", "routes/arisans.tsx"),
  route("arisan/:id", "routes/arisan.$id.tsx"),
] satisfies RouteConfig;
