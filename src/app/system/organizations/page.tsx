"use client";

import { SystemAdminLayout } from "@/components/layout/SystemAdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const organizations = [
  { id: 1, name: "Acme Corp", slug: "acme-corp", status: "Active" },
  { id: 2, name: "Stark Industries", slug: "stark-industries", status: "Active" },
  { id: 3, name: "Globex Corporation", slug: "globex", status: "Inactive" },
  { id: 4, name: "Initech", slug: "initech", status: "Active" },
];

export default function OrganizationsPage() {
  return (
    <SystemAdminLayout>
      <PageHeader 
        title="Organizations" 
        description="Manage and view individual organization details."
        breadcrumbs={[
          { label: "System", href: "/system" },
          { label: "Organizations", isCurrent: true }
        ]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <Card key={org.id} className="hover:shadow-md transition-shadow group">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {org.name}
                <Badge variant={org.status === "Active" ? "success" : "destructive"}>
                  {org.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">Slug: {org.slug}</p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <Link href={`/system/organizations/${org.slug}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    System View
                  </Button>
                </Link>
                <Link href={`/org/${org.slug}`}>
                  <Button variant="primary" size="sm" className="w-full">
                    Direct View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SystemAdminLayout>
  );
}
