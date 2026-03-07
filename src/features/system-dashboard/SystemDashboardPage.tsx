"use client";

import Link from "next/link";
import { Building2, Users, Banknote, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAllBanks, useOrgs, useSystemAdmins } from "./api";

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  isLoading,
}: {
  title: string;
  value?: number | string;
  icon: React.ElementType;
  href: string;
  isLoading?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className="group cursor-pointer transition-all hover:border-border/80 hover:shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="mt-1 text-3xl font-bold text-foreground">{value ?? "—"}</p>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-accent">
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function SystemDashboard() {
  const { data: orgs, isLoading: orgsLoading } = useOrgs({ per_page: 1 });
  const { data: admins, isLoading: adminsLoading } = useSystemAdmins({ per_page: 1 });
  const { data: banks, isLoading: banksLoading } = useAllBanks({ per_page: 1 });

  return (
    <>
      <PageHeader
        title="System Dashboard"
        description="Overview of the entire platform."
        breadcrumbs={[{ label: "System", isCurrent: true }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard
          title="Organizations"
          value={orgs?.meta.total}
          icon={Building2}
          href="/system/organizations"
          isLoading={orgsLoading}
        />
        <StatCard
          title="System Admins"
          value={admins?.meta.total}
          icon={Users}
          href="/system/users"
          isLoading={adminsLoading}
        />
        <StatCard
          title="Banks"
          value={banks?.meta.total}
          icon={Banknote}
          href="/system/banks"
          isLoading={banksLoading}
        />
      </div>

      <div className="flex w-fit items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <CheckCircle className="h-4 w-4" />
        <span className="font-medium">System Operational</span>
      </div>
    </>
  );
}
