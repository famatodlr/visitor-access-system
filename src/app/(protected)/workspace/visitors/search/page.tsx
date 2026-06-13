import { VisitorSearch } from "@/components/visitors/visitor-search";

export default function VisitorSearchPage() {
  return (
    <section>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-[var(--primary)]">
          Visitor search
        </p>
        <h2 className="mt-2 text-3xl font-bold">Search Visitor</h2>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Find a registered visitor by DNI and review their identification
          details before handling access.
        </p>
      </div>

      <VisitorSearch />
    </section>
  );
}
