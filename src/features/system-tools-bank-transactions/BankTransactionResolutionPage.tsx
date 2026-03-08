"use client";

import React, { useState, useEffect } from "react";
import { 
  useBankToolBanks, 
  useExtractReference, 
  useParseSms, 
  useResolveBank, 
  useValidateSms, 
  useValidateBank,
  ExpectedTransaction
} from "@/hooks/api/useBankTools";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import AppBadge, { StatusType } from "@/components/ui/AppBadge";
import { Tabs } from "@/components/ui/Tabs";
import { 
  Wrench, 
  Search, 
  FileJson, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Clock,
  User,
  Hash,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  BankTransactionToolBankResource,
  BankTransactionData,
  ValidationCheckResultResource,
  BankTransactionConfirmationStatusValue
} from "@/types/api.types";

export default function BankTransactionResolutionPage() {
  const { data: banks, isLoading: isLoadingBanks } = useBankToolBanks();
  const [selectedBank, setSelectedBank] = useState<{ id: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (banks && banks.length > 0 && !selectedBank) {
      setSelectedBank({ id: banks[0].bank_code, name: banks[0].name });
    }
  }, [banks, selectedBank]);

  const bankOptions = banks?.map(b => ({ id: b.bank_code, name: b.name })) || [];

  if (isLoadingBanks) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { 
      id: "extract", 
      label: "Extract Reference", 
      content: <ExtractReferenceForm bankCode={selectedBank?.id || ""} /> 
    },
    { 
      id: "parse", 
      label: "Parse SMS", 
      content: <ParseSmsForm bankCode={selectedBank?.id || ""} /> 
    },
    { 
      id: "resolve", 
      label: "Resolve Bank", 
      content: <ResolveBankForm bankCode={selectedBank?.id || ""} /> 
    },
    { 
      id: "validate_sms", 
      label: "Validate SMS", 
      content: <ValidateSmsForm bankCode={selectedBank?.id || ""} /> 
    },
    { 
      id: "validate_bank", 
      label: "Validate Bank", 
      content: <ValidateBankForm bankCode={selectedBank?.id || ""} /> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bank Transaction Resolution</h1>
          <p className="text-muted-foreground">Standalone playground for bank transaction extraction and validation tools.</p>
        </div>
        <div className="w-64">
          <Select
            label="Select Bank"
            value={selectedBank || { id: "", name: "Select a bank" }}
            onChange={(val) => setSelectedBank({ id: String(val.id), name: val.name })}
            options={bankOptions}
          />
        </div>
      </div>

      {!selectedBank ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-2">
            <Search className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No Bank Selected</h3>
            <p className="text-muted-foreground">Please select a bank from the dropdown to start using the resolution tools.</p>
          </div>
        </Card>
      ) : (
        <Tabs 
          tabs={tabs} 
          onChange={setActiveTab}
          className="bg-transparent"
        />
      )}
    </div>
  );
}

// ── Shared Result Components ──────────────────────────────────────────────────

function ErrorList({ errors }: { errors: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <div className="space-y-2">
      {errors.map((err, i) => (
        <div key={i} className="flex items-center gap-2 text-destructive text-sm font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{err}</span>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: BankTransactionConfirmationStatusValue }) {
  const configs: Record<BankTransactionConfirmationStatusValue, { status: StatusType; icon: any }> = {
    valid: { status: "success", icon: CheckCircle2 },
    invalid: { status: "error", icon: XCircle },
    unresponsive: { status: "warning", icon: Clock },
    mismatch: { status: "warning", icon: AlertCircle },
  };

  const config = configs[status];

  return (
    <AppBadge status={config.status} className="gap-1.5 px-3 py-1 text-sm font-semibold capitalize">
      {status}
    </AppBadge>
  );
}

function TransactionDataCard({ data, title = "Parsed Transaction Data" }: { data: BankTransactionData | null, title?: string }) {
  if (!data) return null;

  const Row = ({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: any }) => (
    <div className="flex items-start justify-between py-2 border-b last:border-0 border-border/50">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-right max-w-[60%] truncate">
        {value || <span className="text-muted-foreground/50">N/A</span>}
      </div>
    </div>
  );

  return (
    <Card className="overflow-hidden border-border/50">
      <div className="px-4 py-3 bg-muted/50 border-b border-border/50 flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-wider">{title}</h4>
        {data.external_transaction_reference && (
          <AppBadge status="default" className="font-mono text-xs">
            {data.external_transaction_reference}
          </AppBadge>
        )}
      </div>
      <div className="p-4 space-y-1">
        <div className="flex flex-col items-center justify-center py-4 bg-accent/30 rounded-lg mb-4 border border-border/30">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Amount</span>
          <span className="text-3xl font-black">
            {data.amount !== null ? `${data.amount.toLocaleString()} ETB` : "N/A"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div className="space-y-2">
            <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">Participants</h5>
            <Row 
              label="Sender Name" 
              value={data.sender?.name} 
              icon={User} 
            />
            <Row 
              label="Sender Account" 
              value={data.sender?.account_number} 
              icon={Hash} 
            />
            <Row 
              label="Receiver Name" 
              value={data.receiver?.name} 
              icon={User} 
            />
            <Row 
              label="Receiver Account" 
              value={data.receiver?.account_number} 
              icon={Hash} 
            />
          </div>

          <div className="space-y-2">
            <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">Details</h5>
            <Row 
              label="Occurred At" 
              value={data.occurred_at ? new Date(data.occurred_at).toLocaleString() : null} 
              icon={Clock} 
            />
            <Row 
              label="Service Fee" 
              value={data.service_fee !== null ? `${data.service_fee} ETB` : null} 
            />
            <Row 
              label="VAT Fee" 
              value={data.vat_fee !== null ? `${data.vat_fee} ETB` : null} 
            />
            <Row 
              label="Balance" 
              value={data.balance !== null ? `${data.balance} ETB` : null} 
            />
            <Row 
              label="Status" 
              value={data.status} 
            />
          </div>
        </div>

        {data.receipt_url && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <a href={data.receipt_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                View Bank Receipt
              </Button>
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}

function ValidationChecks({ checks }: { checks: any }) {
  if (!checks) return null;

  const Row = ({ label, check }: { label: string, check: ValidationCheckResultResource }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        {check.matched ? (
          <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center text-success">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        ) : (
          <div className="h-6 w-6 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
            <XCircle className="h-4 w-4" />
          </div>
        )}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase font-bold text-muted-foreground">Expected</span>
          <span className="font-medium">{String(check.expected ?? "N/A")}</span>
        </div>
        <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase font-bold text-muted-foreground">Actual</span>
          <span className={cn("font-bold", check.matched ? "text-success" : "text-destructive")}>
            {String(check.actual ?? "N/A")}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="overflow-hidden border-border/50 mt-6">
      <div className="px-4 py-3 bg-muted/50 border-b border-border/50">
        <h4 className="text-sm font-bold uppercase tracking-wider">Validation Checks</h4>
      </div>
      <div className="p-4 space-y-1">
        <Row label="Amount" check={checks.amount} />
        <Row label="Sender Name" check={checks.sender_name} />
        <Row label="Sender Account" check={checks.sender_account_number} />
        <Row label="Receiver Name" check={checks.receiver_name} />
        <Row label="Receiver Account" check={checks.receiver_account_number} />
        <Row label="Direction" check={checks.direction} />
      </div>
    </Card>
  );
}

// ── Feature Forms ─────────────────────────────────────────────────────────────

function ExtractReferenceForm({ bankCode }: { bankCode: string }) {
  const [reference, setReference] = useState("");
  const mutation = useExtractReference();

  const handleExtract = () => {
    if (!reference) return;
    mutation.mutate({ bank_code: bankCode, reference });
  };

  const result = mutation.data;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <Textarea
            label="Raw Reference Input"
            placeholder="Paste raw SMS body, receipt URL, or direct reference code (e.g., DBP779U4BB)"
            rows={5}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
          <Button 
            className="w-full" 
            onClick={handleExtract} 
            disabled={mutation.isPending || !reference}
          >
            {mutation.isPending ? <Spinner size="sm" className="mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Extract Reference
          </Button>
        </div>
      </Card>

      {mutation.isSuccess && mutation.data && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 flex flex-col items-center justify-center text-center gap-2 border-border/50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</span>
              <AppBadge status={mutation.data.is_valid ? "success" : "error"}>
                {mutation.data.is_valid ? "Valid" : "Invalid"}
              </AppBadge>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center text-center gap-2 border-border/50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pattern</span>
              <div className="flex items-center gap-2 font-mono text-sm capitalize">
                {mutation.data.pattern || "N/A"}
              </div>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center text-center gap-2 border-border/50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reference Code</span>
              <div className="font-bold text-lg">
                {mutation.data.external_transaction_reference || "N/A"}
              </div>
            </Card>
          </div>

          <ErrorList errors={mutation.data.errors} />

          {mutation.data.bank_link && (
            <Card className="p-4 flex items-center justify-between border-border/50 bg-muted/20">
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-primary" />
                <span className="font-medium">Direct Bank Link Extracted</span>
              </div>
              <a href={mutation.data.bank_link} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline">Open Receipt</Button>
              </a>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function ParseSmsForm({ bankCode }: { bankCode: string }) {
  const [reference, setReference] = useState("");
  const mutation = useParseSms();

  const handleParse = () => {
    if (!reference) return;
    mutation.mutate({ bank_code: bankCode, reference });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <Textarea
            label="SMS Body"
            placeholder="Paste the full SMS message body here..."
            rows={5}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
          <Button 
            className="w-full" 
            onClick={handleParse} 
            disabled={mutation.isPending || !reference}
          >
            {mutation.isPending ? <Spinner size="sm" className="mr-2" /> : <FileJson className="h-4 w-4 mr-2" />}
            Parse SMS Body
          </Button>
        </div>
      </Card>

      {mutation.isSuccess && mutation.data && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <Card className={cn(
            "p-4 flex items-center gap-3 border-l-4",
            mutation.data.is_valid ? "border-l-success bg-success/5" : "border-l-destructive bg-destructive/5"
          )}>
            {mutation.data.is_valid ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
            <div>
              <p className="font-bold text-sm">{mutation.data.is_valid ? "Successfully Parsed" : "Parsing Failed"}</p>
              <p className="text-xs text-muted-foreground">
                {mutation.data.is_valid ? "All required fields extracted from SMS body." : "Could not find required minimum fields in the provided text."}
              </p>
            </div>
          </Card>

          <ErrorList errors={mutation.data.errors} />
          
          <TransactionDataCard data={mutation.data.data} />
        </div>
      )}
    </div>
  );
}

function ResolveBankForm({ bankCode }: { bankCode: string }) {
  const [reference, setReference] = useState("");
  const mutation = useResolveBank();

  const handleResolve = () => {
    if (!reference) return;
    mutation.mutate({ bank_code: bankCode, reference });
  };

  const result = mutation.data;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <Textarea
            label="Reference Input"
            placeholder="Paste SMS body, receipt URL, or reference code..."
            rows={5}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
          <Button 
            className="w-full" 
            onClick={handleResolve} 
            disabled={mutation.isPending || !reference}
          >
            {mutation.isPending ? <Spinner size="sm" className="mr-2" /> : <Wrench className="h-4 w-4 mr-2" />}
            Resolve from Bank
          </Button>
        </div>
      </Card>

      {mutation.isSuccess && mutation.data && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StatusBadge status={mutation.data.bank_confirmation_status} />
              {mutation.data.http_status && (
                <AppBadge status="default" className="text-xs">
                  HTTP {mutation.data.http_status}
                </AppBadge>
              )}
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              Mode: {mutation.data.reference.pattern}
            </div>
          </div>

          <ErrorList errors={mutation.data.errors} />

          <TransactionDataCard data={mutation.data.data} title="Resolved Bank Data" />

          {mutation.data.raw_excerpt && (
            <Card className="overflow-hidden border-border/50">
              <div className="px-4 py-2 bg-muted/50 border-b border-border/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Raw Receipt Excerpt (Debug)
              </div>
              <pre className="p-4 text-[10px] overflow-auto max-h-32 bg-background font-mono leading-relaxed whitespace-pre-wrap">
                {mutation.data.raw_excerpt}
              </pre>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ── Validation Forms ──────────────────────────────────────────────────────────

function ExpectedValuesForm({ values, onChange }: { values: ExpectedTransaction, onChange: (values: ExpectedTransaction) => void }) {
  const handleChange = (field: string, val: any) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      onChange({ ...values, [field]: val });
    } else {
      const parent = keys[0] as keyof ExpectedTransaction;
      const child = keys[1];
      onChange({
        ...values,
        [parent]: {
          ...(values[parent] as any),
          [child]: val
        }
      });
    }
  };

  const directionOptions = [
    { id: 'sender_to_receiver', name: 'Sender to Receiver' },
  ];

  return (
    <Card className="p-4 border-border/50 bg-muted/10">
      <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Expected Transaction Values</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Amount (Numeric)" 
          type="number" 
          value={values.amount} 
          onChange={(e) => handleChange('amount', Number(e.target.value))} 
        />
        <Select
          label="Direction"
          value={directionOptions.find(opt => opt.id === values.direction) || directionOptions[0]}
          onChange={(opt) => handleChange('direction', opt.id)}
          options={directionOptions}
        />
        <Input 
          label="Sender Name" 
          value={values.sender.name || ""} 
          onChange={(e) => handleChange('sender.name', e.target.value)} 
        />
        <Input 
          label="Sender Account" 
          value={values.sender.account_number || ""} 
          onChange={(e) => handleChange('sender.account_number', e.target.value)} 
        />
        <Input 
          label="Receiver Name" 
          value={values.receiver.name || ""} 
          onChange={(e) => handleChange('receiver.name', e.target.value)} 
        />
        <Input 
          label="Receiver Account" 
          value={values.receiver.account_number || ""} 
          onChange={(e) => handleChange('receiver.account_number', e.target.value)} 
        />
      </div>
    </Card>
  );
}

function ValidateSmsForm({ bankCode }: { bankCode: string }) {
  const [reference, setReference] = useState("");
  const [expected, setExpected] = useState<ExpectedTransaction>({
    amount: 0,
    direction: "sender_to_receiver",
    sender: { name: "", account_number: "" },
    receiver: { name: "", account_number: "" }
  });

  const mutation = useValidateSms();

  const handleValidate = () => {
    if (!reference || !expected.amount) return;
    mutation.mutate({ bank_code: bankCode, reference, expected });
  };

  const result = mutation.data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            <Textarea
              label="SMS Body to Validate"
              placeholder="Paste the full SMS message..."
              rows={5}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <ExpectedValuesForm values={expected} onChange={setExpected} />
            <Button 
              className="w-full" 
              onClick={handleValidate} 
              disabled={mutation.isPending || !reference || !expected.amount}
            >
              {mutation.isPending ? <Spinner size="sm" className="mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Validate SMS Data
            </Button>
          </div>
        </Card>
      </div>

      <div>
        {mutation.isSuccess && mutation.data && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4">
              <StatusBadge status={mutation.data.bank_confirmation_status} />
              <div className="text-xs text-muted-foreground font-medium">
                Validation Result
              </div>
            </div>

            <ErrorList errors={mutation.data.errors} />

            <ValidationChecks checks={mutation.data.checks} />

            <div className="mt-6">
              <TransactionDataCard data={mutation.data.parsed_sms} title="Raw Parsed Data" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ValidateBankForm({ bankCode }: { bankCode: string }) {
  const [reference, setReference] = useState("");
  const [expected, setExpected] = useState<ExpectedTransaction>({
    amount: 0,
    direction: "sender_to_receiver",
    sender: { name: "", account_number: "" },
    receiver: { name: "", account_number: "" }
  });

  const mutation = useValidateBank();

  const handleValidate = () => {
    if (!reference || !expected.amount) return;
    mutation.mutate({ bank_code: bankCode, reference, expected });
  };

  const result = mutation.data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            <Textarea
              label="Reference Input to Validate"
              placeholder="Paste SMS body, URL, or reference code..."
              rows={5}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <ExpectedValuesForm values={expected} onChange={setExpected} />
            <Button 
              className="w-full" 
              onClick={handleValidate} 
              disabled={mutation.isPending || !reference || !expected.amount}
            >
              {mutation.isPending ? <Spinner size="sm" className="mr-2" /> : <Wrench className="h-4 w-4 mr-2" />}
              Validate against Bank
            </Button>
          </div>
        </Card>
      </div>

      <div>
        {mutation.isSuccess && mutation.data && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4">
              <StatusBadge status={mutation.data.bank_confirmation_status} />
              <div className="text-xs text-muted-foreground font-medium">
                Bank-Verified Result
              </div>
            </div>

            <ErrorList errors={mutation.data.errors} />

            <ValidationChecks checks={mutation.data.checks} />

            <div className="mt-6">
              <TransactionDataCard data={mutation.data.resolved_bank_transaction} title="Bank Data" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
