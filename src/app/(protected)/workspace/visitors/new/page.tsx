import { VisitorRegistrationForm } from "@/components/visitors/visitor-registration-form";

export default function NewVisitorPage() {
  return (
    <section>
      <div className="print-hidden max-w-3xl">
        <p className="text-sm font-semibold text-[var(--primary)]">
          Registro de visitante
        </p>
        <h2 className="mt-2 text-3xl font-bold">Registrar visitante</h2>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Cargue los datos del visitante y capture la foto para generar la
          credencial.
        </p>
      </div>

      <VisitorRegistrationForm />
    </section>
  );
}
