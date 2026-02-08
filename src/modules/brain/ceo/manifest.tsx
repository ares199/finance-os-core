import { BrainCircuit } from "lucide-react";
import type { ModuleManifest } from "@/core/plugin/types";
import CeoAiWidget from "@/modules/brain/ceo/widgets/CeoAiWidget";
import CeoReportsPage from "@/modules/brain/ceo/pages/CeoReportsPage";

export const ceoBrainModule: ModuleManifest = {
  id: "brain.ceo",
  name: "CEO Brain (AI)",
  version: "0.1.0",
  risk: "low",
  description: "AI-generated CEO review of Binance holdings snapshot.",
  requestedPermissions: ["read", "suggest"],
  capabilities: ["WIDGETS", "ROUTES"],
  widgets: [
    {
      id: "brain.ceo.review",
      title: "CEO Brain Review",
      description: "AI-generated CEO summary for Binance holdings.",
      component: <CeoAiWidget />,
      defaultSize: { w: 2, h: 2 },
    },
  ],
  routes: [
    {
      path: "/ceo",
      label: "CEO Brain",
      icon: BrainCircuit,
      element: <CeoReportsPage />,
    },
  ],
};
