import { NextResponse } from "next/server";


function getSessionCookieName() {
  return process.env.AUTH_SESSION_COOKIE_NAME || "es_session";
}

function isProtectedPath(pathname) {
  const protectedPathPrefixes = ["/private-page", "/app-area"];
  return protectedPathPrefixes.some(
    (protectedPrefix) =>
      pathname === protectedPrefix || pathname.startsWith(`${protectedPrefix}/`)
  );
}

function isAuthPage(pathname) {
  const authPages = ["/login", "/register"];
  return authPages.includes(pathname);
}

export function middleware(nextRequest) {
  const currentPathname = nextRequest.nextUrl.pathname;

  const sessionCookieName = getSessionCookieName();
  const sessionCookieValue = nextRequest.cookies.get(sessionCookieName)?.value;
  const hasSessionCookie = Boolean(sessionCookieValue);

  if (isProtectedPath(currentPathname) && !hasSessionCookie) {
    const loginRedirectUrl = nextRequest.nextUrl.clone();
    loginRedirectUrl.pathname = "/login";
    loginRedirectUrl.searchParams.set("redirectTo", currentPathname);

    return NextResponse.redirect(loginRedirectUrl);
  }

  if (isAuthPage(currentPathname) && hasSessionCookie) {
    const appHomeUrl = nextRequest.nextUrl.clone();
    appHomeUrl.pathname = "/app-area/my-project";
    return NextResponse.redirect(appHomeUrl);
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/private-page/:path*", "/app-area/:path*", "/login", "/register"]
};
