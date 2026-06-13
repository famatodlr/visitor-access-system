export interface WorkspaceAction {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}

export const WORKSPACE_ACTIONS: WorkspaceAction[] = [
  {
    title: "Registrar visitante",
    description: "Alta rápida con foto y credencial.",
    href: "/workspace/visitors/new",
    ctaLabel: "Registrar",
  },
  {
    title: "Buscar por DNI",
    description: "Consultar datos e historial.",
    href: "/workspace/visitors/search",
    ctaLabel: "Buscar",
  },
  {
    title: "Validar QR",
    description: "Registrar un nuevo ingreso.",
    href: "/workspace/visitors/qr/validate",
    ctaLabel: "Validar QR",
  },
];
