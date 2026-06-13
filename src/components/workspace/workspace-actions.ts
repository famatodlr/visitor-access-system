export interface WorkspaceAction {
  title: string;
  description: string;
  status: "Available" | "Coming next";
  href?: string;
  ctaLabel?: string;
}

export const WORKSPACE_ACTIONS: WorkspaceAction[] = [
  {
    title: "Register visitor",
    description: "Create a visitor record, capture identification data, and prepare the access credential.",
    status: "Available",
    href: "/workspace/visitors/new",
    ctaLabel: "Register visitor",
  },
  {
    title: "Search visitor by DNI",
    description: "Find an existing visitor quickly before registering a repeat entry.",
    status: "Available",
    href: "/workspace/visitors/search",
    ctaLabel: "Search visitor",
  },
  {
    title: "Validate QR / repeat entry",
    description: "Scan a saved credential and record a new facility entry.",
    status: "Available",
    href: "/workspace/visitors/qr/validate",
    ctaLabel: "Validate QR",
  },
  {
    title: "Visitor entries/history",
    description: "Review recent access records for registered visitors.",
    status: "Coming next",
  },
];
