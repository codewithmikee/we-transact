"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePaymentSettings, useUpdatePaymentSettings } from "./api";

const schema = z.object({
  min_withdraw_allowed: z.coerce.number().min(0, "Must be ≥ 0"),
  max_withdraw_per_day: z.coerce.number().min(0, "Must be ≥ 0"),
  max_withdraw_per_transaction: z.coerce.number().min(0, "Must be ≥ 0"),
  min_deposit_allowed: z.coerce.number().min(0, "Must be ≥ 0"),
  max_deposit_per_day: z.coerce.number().min(0, "Must be ≥ 0"),
  max_deposit_per_transaction: z.coerce.number().min(0, "Must be ≥ 0"),
});

type SettingsForm = z.infer<typeof schema>;

export default function PaymentSettingPage() {
  const { data: settings, isLoading } = usePaymentSettings();
  const updateMutation = useUpdatePaymentSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      min_withdraw_allowed: 0,
      max_withdraw_per_day: 0,
      max_withdraw_per_transaction: 0,
      min_deposit_allowed: 0,
      max_deposit_per_day: 0,
      max_deposit_per_transaction: 0,
    },
  });

  // Populate form once data is loaded
  useEffect(() => {
    if (settings) {
      reset({
        min_withdraw_allowed: settings.min_withdraw_allowed,
        max_withdraw_per_day: settings.max_withdraw_per_day,
        max_withdraw_per_transaction: settings.max_withdraw_per_transaction,
        min_deposit_allowed: settings.min_deposit_allowed,
        max_deposit_per_day: settings.max_deposit_per_day,
        max_deposit_per_transaction: settings.max_deposit_per_transaction,
      });
    }
  }, [settings, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await updateMutation.mutateAsync(values);
    reset(values); // clear dirty state
  });

  const fieldSkeleton = <Skeleton className="h-10 w-full rounded-md" />;

  return (
    <>
      <PageHeader
        title="Payment Settings"
        description="Configure withdraw and deposit limits for this organization."
        breadcrumbs={[
          { label: "Dashboard", href: ".." },
          { label: "Payment Settings", isCurrent: true },
        ]}
      />

      <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
        {/* Withdraw Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Withdraw Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                {fieldSkeleton}
                {fieldSkeleton}
                {fieldSkeleton}
              </>
            ) : (
              <>
                <Input
                  label="Minimum Withdraw Amount"
                  type="number"
                  min={0}
                  step="0.01"
                  error={errors.min_withdraw_allowed?.message}
                  {...register("min_withdraw_allowed")}
                />
                <Input
                  label="Maximum Withdraw Per Day"
                  type="number"
                  min={0}
                  step="0.01"
                  error={errors.max_withdraw_per_day?.message}
                  {...register("max_withdraw_per_day")}
                />
                <Input
                  label="Maximum Withdraw Per Transaction"
                  type="number"
                  min={0}
                  step="0.01"
                  error={errors.max_withdraw_per_transaction?.message}
                  {...register("max_withdraw_per_transaction")}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Deposit Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                {fieldSkeleton}
                {fieldSkeleton}
                {fieldSkeleton}
              </>
            ) : (
              <>
                <Input
                  label="Minimum Deposit Amount"
                  type="number"
                  min={0}
                  step="0.01"
                  error={errors.min_deposit_allowed?.message}
                  {...register("min_deposit_allowed")}
                />
                <Input
                  label="Maximum Deposit Per Day"
                  type="number"
                  min={0}
                  step="0.01"
                  error={errors.max_deposit_per_day?.message}
                  {...register("max_deposit_per_day")}
                />
                <Input
                  label="Maximum Deposit Per Transaction"
                  type="number"
                  min={0}
                  step="0.01"
                  error={errors.max_deposit_per_transaction?.message}
                  {...register("max_deposit_per_transaction")}
                />
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={!isDirty || updateMutation.isPending || isLoading}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </form>
    </>
  );
}
