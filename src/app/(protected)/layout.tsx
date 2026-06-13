import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getGuardSession } from "@/server/auth/guard";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getGuardSession();

  if (!session) {
    redirect("/");
  }

  return <WorkspaceShell>{children}</WorkspaceShell>;
}
