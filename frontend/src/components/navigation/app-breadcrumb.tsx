"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  dashboard: "Dashboard",
  upload: "Upload Documents",
  analysis: "Analysis in Progress",
  results: "Results",
  history: "Analysis History",
  settings: "Settings",
};

export function AppBreadcrumb() {
  const pathname = usePathname();
  
  // Don't show breadcrumbs on auth pages or home page
  if (pathname === "/" || pathname.startsWith("/sign-")) {
    return null;
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbItems: BreadcrumbItem[] = [];

  // Always start with dashboard
  breadcrumbItems.push({
    label: "Dashboard",
    href: "/dashboard",
  });

  // Build breadcrumb items based on path
  let currentPath = "";
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;
    
    // Skip dashboard as it's already added
    if (segment === "dashboard") continue;
    
    // Skip "results" segment - we'll handle it with the jobId
    if (segment === "results") continue;
    
    // Handle dynamic routes
    if (segment.startsWith("mock-job-") || segment.startsWith("demo-job-") || /^[a-zA-Z0-9-]+$/.test(segment)) {
      const parentSegment = pathSegments[i - 1];
      if (parentSegment === "analysis") {
        breadcrumbItems.push({
          label: "Analysis Progress",
        });
        break;
      } else if (parentSegment === "results") {
        // Add "Analysis Results" without intermediate "Results" link
        breadcrumbItems.push({
          label: "Analysis Results",
        });
        break;
      }
    }
    
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = i === pathSegments.length - 1;
    
    breadcrumbItems.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  }

  // Don't show breadcrumbs if we only have one item (dashboard)
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <div className="border-b bg-white px-6 py-3">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}

