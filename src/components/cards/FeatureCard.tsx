import { Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface FeatureCardProps {
  title: string;
  description: string;
  status: string;
  icon?: React.ReactNode;
}

export function FeatureCard({ 
  title, 
  description, 
  status, 
  icon = <Zap className="w-6 h-6" /> 
}: FeatureCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <Badge variant="success">{status}</Badge>
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full" variant="secondary">View Dashboard</Button>
      </CardFooter>
    </Card>
  );
}
