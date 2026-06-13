import Link from "next/link";

import { VisitorDetail } from "@/components/visitors/visitor-detail";

export default async function VisitorDetailPage({
  params,
}: {
  params: Promise<{ visitorId: string }>;
}) {
  const { visitorId } = await params;

  return (
    <section>
      <div className="print-hidden max-w-3xl">
        <p className="text-sm font-semibold text-[var(--primary)]">
          Detalle del visitante
        </p>
        <h2 className="mt-2 text-3xl font-bold">Registro del visitante</h2>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Consulte la identidad, credencial e historial de ingresos.
        </p>
        <Link
          className="mt-6 inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary-hover)] hover:text-[var(--primary-hover)]"
          href="/workspace/visitors/search"
        >
          Volver a la búsqueda
        </Link>
      </div>

      <VisitorDetail visitorId={visitorId} />
    </section>
  );
}
