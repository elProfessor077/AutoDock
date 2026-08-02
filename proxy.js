export { auth as proxy } from "@/auth";

export const config = {
  // Apply auth to all routes except static assets, _next internals, and favicon
  matcher: ["/((?!_next/static|_next/image|favicon.ico|devlaunch-icon.png).*)"],
};
