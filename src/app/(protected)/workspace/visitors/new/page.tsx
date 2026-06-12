import { VisitorRegistrationForm } from "@/components/visitors/visitor-registration-form";

export default function NewVisitorPage() {
  return (
    <section>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-[var(--primary)]">
          Visitor registration
        </p>
        <h2 className="mt-2 text-3xl font-bold">Register Visitor</h2>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Capture the visitor information and photograph required to create a
          facility access record.
        </p>
      </div>

      <VisitorRegistrationForm />
    </section>
  );
}
