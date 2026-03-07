import { PageHeader } from "@/components/layout/PageHeader";
import { ChangePasswordCard } from "@/features/auth/ChangePasswordCard";

export const metadata = {
  title: "Change Password",
};

export default function ChangePasswordPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Password"
        description="Account security lives here once the password update endpoint is wired."
        breadcrumbs={[{ label: "Change Password", isCurrent: true }]}
      />
      <ChangePasswordCard />
    </div>
  );
}
