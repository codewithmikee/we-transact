"use client";

import { OrgAdminLayout } from "@/components/layout/OrgAdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function OrganizationSystemView() {
  return (
    <OrgAdminLayout isNestedInSystem={true}>
      <div className="mb-6">
        <Link href="/system/organizations" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to System Dashboard
        </Link>
      </div>

      <PageHeader 
        title="Organization Overview" 
        description="Viewing organization details from a system administration context."
        breadcrumbs={[
          { label: "System", href: "/system" },
          { label: "Organizations", href: "/system/organizations" },
          { label: "Overview", isCurrent: true }
        ]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Usage Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-bold text-slate-900">84%</p>
            <p className="text-sm text-slate-500 font-medium tracking-wide">Subscription Limit Reached</p>
            <Badge variant="success" className="w-full text-center">Plan: Enterprise</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">New Agent Created</span>
                <span className="text-slate-400">1h ago</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Payment Processed</span>
                <span className="text-slate-400">3h ago</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Admin Login</span>
                <span className="text-slate-400">5h ago</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">View Logs</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-indigo-100 bg-indigo-50/20">
          <CardHeader>
            <CardTitle className="text-indigo-900">System Admin Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-indigo-700 font-medium">Manage this organization's global settings.</p>
            <div className="space-y-2">
              <Button variant="danger" className="w-full">Suspend Organization</Button>
              <Button variant="outline" className="w-full">Reset Organization Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgAdminLayout>
  );
}
