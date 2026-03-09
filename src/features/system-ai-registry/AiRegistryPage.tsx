"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { ProvidersTab } from "./ProvidersTab";
import { ModelsTab } from "./ModelsTab";
import { CredentialsTab } from "./CredentialsTab";

export default function AiRegistryPage() {
  const [activeTab, setActiveTab] = useState("providers");

  const tabs: TabItem[] = [
    { id: "providers", label: "Providers" },
    { id: "models", label: "Models" },
    { id: "credentials", label: "Credentials" },
  ];

  return (
    <>
      <PageHeader
        title="AI Registry"
        description="Manage AI providers, models, and credentials for the platform."
        breadcrumbs={[
          { label: "System", href: "/system" },
          { label: "AI Registry", isCurrent: true },
        ]}
      />

      <div className="mt-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
          className="mb-6"
        />

        {activeTab === "providers" && <ProvidersTab />}
        {activeTab === "models" && <ModelsTab />}
        {activeTab === "credentials" && <CredentialsTab />}
      </div>
    </>
  );
}
