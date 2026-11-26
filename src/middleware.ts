import { NextResponse, type NextRequest } from "next/server";

/**
 * First gate only: bounces requests with no session cookie. The cookie is NOT trusted here
 * (Edge cannot run the Admin SDK); real verification happens in the protected layout and in every API route.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  const preview = process.env.NODE_ENV !== "production" && process.env.ADMIN_UI_PREVIEW === "true";
  if (!preview && !req.cookies.get("gpl_session")?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
export const config = { matcher: ["/admin/:path*"] };
