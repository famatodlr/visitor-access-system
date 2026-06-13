import { VisitorSearch } from "@/components/visitors/visitor-search";

export default function VisitorSearchPage() {
  return (
    <section>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-[var(--primary)]">
          Búsqueda de visitante
        </p>
        <h2 className="mt-2 text-3xl font-bold">Buscar visitante</h2>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Busque por DNI para consultar datos e historial de ingresos.
        </p>
      </div>

      <VisitorSearch />
    </section>
  );
}
