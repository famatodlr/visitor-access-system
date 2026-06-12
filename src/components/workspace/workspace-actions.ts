export interface WorkspaceAction {
  title: string;
  description: string;
  status: "Coming next";
}

export const WORKSPACE_ACTIONS: WorkspaceAction[] = [
  {
    title: "Register visitor",
    description: "Create a visitor record, capture identification data, and prepare the access credential.",
    status: "Coming next",
  },
  {
    title: "Search visitor by DNI",
    description: "Find an existing visitor quickly before registering a repeat entry.",
    status: "Coming next",
  },
  {
    title: "Validate QR / repeat entry",
    description: "Scan a saved credential and record a new facility entry.",
    status: "Coming next",
  },
  {
    title: "Visitor entries/history",
    description: "Review recent access records for registered visitors.",
    status: "Coming next",
  },
];
