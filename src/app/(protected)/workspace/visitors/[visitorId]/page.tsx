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
          Visitor detail
        </p>
        <h2 className="mt-2 text-3xl font-bold">Visitor Record</h2>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Review the visitor identity, access credential and recorded entry
          history.
        </p>
      </div>

      <VisitorDetail visitorId={visitorId} />
    </section>
  );
}
