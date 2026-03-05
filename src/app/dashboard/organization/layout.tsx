"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Highlight the active link based on the current URL path
  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: "Hierarchy", href: "/dashboard/organization/hierarchy" },
    { name: "Members", href: "/dashboard/organization/members" },
    { name: "Teams", href: "/dashboard/organization/teamlead" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navigation Bar */}
      <nav style={{
        backgroundColor: "#FFFFFF",
        padding: "0 40px",
        height: "70px",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #E0D7C7",
        gap: "40px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
      }}>
        <div style={{ fontWeight: 900, color: "#7A402D", fontSize: "1.1rem", letterSpacing: "1px" }}>
          ORGANIZATION
        </div>
        
        <div style={{ display: "flex", gap: "25px", height: "100%" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: isActive(link.href) ? "#7A402D" : "#A39281",
                display: "flex",
                alignItems: "center",
                borderBottom: isActive(link.href) ? "3px solid #7A402D" : "3px solid transparent",
                transition: "all 0.3s ease",
                textTransform: "uppercase"
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}