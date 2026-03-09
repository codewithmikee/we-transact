import AiRegistryPage from "@/features/system-ai-registry/AiRegistryPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Registry | System Admin",
  description: "Manage AI providers, models, and credentials.",
};

export default function Page() {
  return <AiRegistryPage />;
}
