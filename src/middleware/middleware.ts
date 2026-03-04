import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { roleHomeRoute, routeAccessMap } from "@/lib/rbac";
import { Role } from "@/types/auth.types";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    const role = payload.role as Role;
    const tenantId = payload.tenantId as number | null;

    if (!role) {
      return NextResponse.rewrite(new URL("/401", request.url));
    }

    // 🔥 Redirect /dashboard → role default dashboard
    if (pathname === "/dashboard") {
      return NextResponse.redirect(
        new URL(roleHomeRoute[role], request.url)
      );
    }

    // 🔥 Check route access
    const allowedRoles = routeAccessMap[pathname];

    if (allowedRoles && !allowedRoles.includes(role)) {
      return NextResponse.rewrite(new URL("/401", request.url));
    }

    // 🔥 Tenant restriction
    if (role !== "SUPER_ADMIN" && !tenantId) {
      return NextResponse.rewrite(new URL("/401", request.url));
    }

    return NextResponse.next();

  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};