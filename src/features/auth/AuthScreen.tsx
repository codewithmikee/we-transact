import { AppLogo } from "@/components/layout/AppLogo";
import { LoginDialog } from "@/components/auth/LoginDialog";

interface AuthScreenProps {
  redirectTo?: string;
}

export function AuthScreen({ redirectTo }: AuthScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <AppLogo />
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Organization and payment management dashboard
          </p>
        </div>
      </div>

      <LoginDialog required redirectTo={redirectTo} />
    </div>
  );
}
