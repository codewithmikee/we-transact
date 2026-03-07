"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, ExternalLink } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSessionStore } from "@/stores/session.store";
import { useOrgById, useOrgs, useUpdateOrgById } from "./api";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  is_active: z.boolean(),
  callback_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type OrgEditForm = z.infer<typeof schema>;

// We look up the org from the list data by slug — the API detail endpoint uses UUID.
// Since this page uses slug from the URL, we first need to find the org's UUID.
export default function OrgEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const setActiveOrg = useSessionStore((s) => s.setActiveOrg);

  // Find org UUID from the slug by querying the list
  const { data: orgsData, isLoading: searchLoading } = useOrgs({ search: slug, per_page: 5 });
  const org = orgsData?.data.find((o) => o.slug === slug);

  const { data: orgDetail, isLoading: detailLoading } = useOrgById(org?.id ?? "", !!org?.id);
  const updateMutation = useUpdateOrgById();

  const isLoading = searchLoading || detailLoading;
  const currentOrg = orgDetail ?? org;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<OrgEditForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      is_active: true,
      callback_url: "",
    },
  });
  const isActive = useWatch({ control, name: "is_active" });

  useEffect(() => {
    if (currentOrg) {
      reset({
        name: currentOrg.name,
        slug: currentOrg.slug,
        is_active: currentOrg.is_active,
        callback_url: currentOrg.callback_url ?? "",
      });
    }
  }, [currentOrg, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!currentOrg) return;
    await updateMutation.mutateAsync({
      uuid: currentOrg.id,
      data: {
        name: values.name,
        slug: values.slug,
        is_active: values.is_active,
        callback_url: values.callback_url || null,
      },
    });
    // If slug changed, navigate to new slug
    if (values.slug !== slug) {
      router.push(`/system/organizations/${values.slug}`);
    } else {
      reset(values);
    }
  });

  const handleManage = () => {
    if (!currentOrg) return;
    setActiveOrg(currentOrg.id, currentOrg.name);
    router.push('/org');
  };

  return (
    <>
      <div className="mb-6">
        <Link
          href="/system/organizations"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Organizations
        </Link>
      </div>

      <PageHeader
        title={isLoading ? "Loading…" : (currentOrg?.name ?? "Organization")}
        description="Edit organization details at system level."
        breadcrumbs={[
          { label: "System", href: "/system" },
          { label: "Organizations", href: "/system/organizations" },
          { label: currentOrg?.name ?? slug, isCurrent: true },
        ]}
      />

      {isLoading ? (
        <div className="space-y-4 max-w-xl">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !currentOrg ? (
        <p className="text-muted-foreground">Organization not found.</p>
      ) : (
        <div className="space-y-6 max-w-xl">
          <form onSubmit={onSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Organization Name"
                  error={errors.name?.message}
                  {...register("name")}
                />
                <Input
                  label="Slug"
                  error={errors.slug?.message}
                  {...register("slug")}
                />
                <Input
                  label="Callback URL (optional)"
                  type="url"
                  placeholder="https://example.com/callback"
                  error={errors.callback_url?.message}
                  {...register("callback_url")}
                />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground/80">Active</p>
                    <p className="text-xs text-muted-foreground">Inactive orgs cannot log in</p>
                  </div>
                  <Toggle
                    checked={isActive}
                    onChange={(v) => setValue("is_active", v, { shouldDirty: true })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleManage}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage as Org Admin
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!isDirty || updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
