import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ProfileCardProps {
  name: string;
  role: string;
  initials: string;
  isOnline?: boolean;
}

export function ProfileCard({ name, role, initials, isOnline }: ProfileCardProps) {
  return (
    <Card className="text-center">
      <CardContent className="pt-8">
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm mx-auto">
            <span className="text-2xl font-bold text-indigo-700">{initials}</span>
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <CardTitle>{name}</CardTitle>
        <CardDescription className="mb-6">{role}</CardDescription>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1">Message</Button>
          <Button variant="secondary" className="flex-1">Follow</Button>
        </div>
      </CardContent>
    </Card>
  );
}
