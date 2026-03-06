"use client";

import { OrgAdminLayout } from "@/components/layout/OrgAdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DirectOrgAdminView() {
  return (
    <OrgAdminLayout>
      <PageHeader 
        title="Admin Dashboard" 
        description="Manage your organization, integrations, and payment settings."
        breadcrumbs={[
          { label: "Dashboard", isCurrent: true }
        ]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Recent Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-bold text-slate-900">12</p>
            <p className="text-sm text-slate-500 font-medium tracking-wide">Connected external services</p>
            <Button variant="outline" className="w-full">Manage Integrations</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Agents Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
              <p className="text-xl font-semibold text-slate-700">9 Active Agents</p>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500 font-medium">
              <span>Performance Score</span>
              <span className="text-slate-900">98.4%</span>
            </div>
            <Button variant="primary" className="w-full">Analyze Agents</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-emerald-100 bg-emerald-50/20">
          <CardHeader>
            <CardTitle className="text-emerald-900">Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-emerald-700 font-medium">Your current billing period ends in 12 days.</p>
            <div className="space-y-2">
              <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 w-full">Update Payment</Button>
              <Button variant="outline" className="w-full">View Invoices</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgAdminLayout>
  );
}
