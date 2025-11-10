"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisJob } from "@/types/api";
import { FileText, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  analyses: AnalysisJob[];
}

export function DashboardStats({ analyses }: DashboardStatsProps) {
  const totalAnalyses = analyses.length;
  const completedAnalyses = analyses.filter(a => a.status === "completed").length;
  const processingAnalyses = analyses.filter(a => a.status === "processing").length;
  const thisMonthAnalyses = analyses.filter(a => {
    const created = new Date(a.created_at);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    {
      title: "Total Analyses",
      value: totalAnalyses,
      icon: FileText,
      description: "All time comparisons"
    },
    {
      title: "Completed",
      value: completedAnalyses,
      icon: CheckCircle,
      description: "Successfully processed"
    },
    {
      title: "In Progress",
      value: processingAnalyses,
      icon: Clock,
      description: "Currently processing"
    },
    {
      title: "This Month",
      value: thisMonthAnalyses,
      icon: TrendingUp,
      description: "Recent activity"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}