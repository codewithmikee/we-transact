"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, ExternalLink } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
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
  ai_registery_project_id: z
    .string()
    .max(255, "Project ID cannot exceed 255 characters")
    .optional()
    .or(z.literal("")),
  ai_registery_project_api_key: z
    .string()
    .max(2048, "Project API key cannot exceed 2048 characters")
    .optional()
    .or(z.literal("")),
});

type OrgEditForm = z.infer<typeof schema>;

const optionalTextToNullable = (value?: string | null): string | null => {
  return value === undefined || value === null || value === "" ? null : value;
};

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
      ai_registery_project_id: "",
      ai_registery_project_api_key: "",
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
        ai_registery_project_id: currentOrg.ai_registery_project_id ?? "",
        ai_registery_project_api_key: currentOrg.ai_registery_project_api_key ?? "",
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
        ai_registery_project_id: optionalTextToNullable(values.ai_registery_project_id),
        ai_registery_project_api_key: optionalTextToNullable(values.ai_registery_project_api_key),
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

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>AI Registry</CardTitle>
                <CardDescription>
                  Link this organization to an AI Registry project. Only system administrators can view or edit this data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="AI Registery Project ID"
                  error={errors.ai_registery_project_id?.message}
                  {...register("ai_registery_project_id")}
                />
                <Textarea
                  label="AI Registery Project API Key"
                  error={errors.ai_registery_project_api_key?.message}
                  placeholder="Paste the API key or leave blank to clear"
                  {...register("ai_registery_project_api_key")}
                  rows={3}
                />
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
