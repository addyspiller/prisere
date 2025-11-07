"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, HelpCircle, Settings } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      title: "New Comparison",
      description: "Upload policies to compare",
      icon: Plus,
      href: "/upload",
      variant: "default" as const,
      className: "bg-prisere-maroon hover:bg-prisere-maroon/90"
    },
    {
      title: "View All Results",
      description: "Browse your analysis history",
      icon: FileText,
      href: "/dashboard",
      variant: "outline" as const
    },
    {
      title: "Help & Support",
      description: "Learn how to use the tool",
      icon: HelpCircle,
      href: "#help",
      variant: "outline" as const
    },
    {
      title: "Settings",
      description: "Manage your preferences",
      icon: Settings,
      href: "/settings",
      variant: "outline" as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              asChild
              variant={action.variant}
              className={`justify-start h-auto p-4 ${action.className || ""}`}
            >
              <Link href={action.href}>
                <div className="flex items-center w-full">
                  <action.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm opacity-70">{action.description}</div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}