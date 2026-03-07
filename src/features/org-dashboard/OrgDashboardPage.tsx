"use client";

import Link from "next/link";
import { Users, Key, CreditCard, UserCog, ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/data/StatusBadge";
import { useApiKeys, useOrg, useOrgAdmins, usePaymentAgents, useTransactions } from "./api";

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

export default function OrgDashboardPage() {
  const { data: org, isLoading: orgLoading } = useOrg();
  const { data: admins, isLoading: adminsLoading } = useOrgAdmins({ per_page: 1 });
  const { data: agents, isLoading: agentsLoading } = usePaymentAgents({ per_page: 1 });
  const { data: keys, isLoading: keysLoading } = useApiKeys({ per_page: 1 });
  const { data: transactions, isLoading: txLoading } = useTransactions({ per_page: 1 });

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your organization."
        breadcrumbs={[{ label: "Dashboard", isCurrent: true }]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Admins"
          value={admins?.meta.total}
          icon={UserCog}
          href="/org/admins"
          isLoading={adminsLoading}
        />
        <StatCard
          title="Agents"
          value={agents?.meta.total}
          icon={Users}
          href="/org/agents"
          isLoading={agentsLoading}
        />
        <StatCard
          title="API Keys"
          value={keys?.meta.total}
          icon={Key}
          href="/org/integrations"
          isLoading={keysLoading}
        />
        <StatCard
          title="Payment Settings"
          value="View"
          icon={CreditCard}
          href="/org/payment-setting"
          isLoading={false}
        />
        <StatCard
          title="Transactions"
          value={transactions?.meta.total}
          icon={ArrowLeftRight}
          href="/org/transactions"
          isLoading={txLoading}
        />
      </div>

      {/* Org Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent>
          {orgLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-3/4" />
              ))}
            </div>
          ) : org ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Name</dt>
                <dd className="mt-0.5 font-semibold text-foreground">{org.name}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Slug</dt>
                <dd className="mt-0.5 font-mono text-foreground">{org.slug}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Status</dt>
                <dd className="mt-0.5">
                  <StatusBadge active={org.is_active} />
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Callback URL</dt>
                <dd className="mt-0.5 break-all text-foreground">
                  {org.callback_url ?? <span className="text-muted-foreground">Not set</span>}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Created</dt>
                <dd className="mt-0.5 text-foreground">
                  {new Date(org.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Failed to load organization details.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
