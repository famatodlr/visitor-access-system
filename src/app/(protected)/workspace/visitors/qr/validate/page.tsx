import { VisitorQrScanner } from "@/components/visitors/visitor-qr-scanner";

export default function VisitorQrValidationPage() {
  return (
    <section>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-[var(--primary)]">
          QR validation
        </p>
        <h2 className="mt-2 text-3xl font-bold">Validate QR Credential</h2>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Scan an existing visitor credential to register a repeat facility
          entry.
        </p>
      </div>

      <VisitorQrScanner />
    </section>
  );
}
