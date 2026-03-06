"use client";

import { SystemAdminLayout } from "@/components/layout/SystemAdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SystemAdminDashboard() {
  return (
    <SystemAdminLayout>
      <PageHeader 
        title="System Dashboard" 
        description="Comprehensive overview and management of the entire system."
        breadcrumbs={[{ label: "System", isCurrent: true }]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Total Organizations
              <Badge variant="secondary">Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-bold text-slate-900">42</p>
            <Link href="/system/organizations">
              <Button variant="outline" className="w-full">Manage Orgs</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-bold text-slate-900">1,284</p>
            <Link href="/system/users">
              <Button variant="outline" className="w-full">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-xl font-semibold text-slate-700">Operational</p>
            </div>
            <Button variant="primary" className="w-full">System Logs</Button>
          </CardContent>
        </Card>
      </div>
    </SystemAdminLayout>
  );
}
