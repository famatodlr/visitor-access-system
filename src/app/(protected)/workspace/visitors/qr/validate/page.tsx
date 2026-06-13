import { VisitorQrScanner } from "@/components/visitors/visitor-qr-scanner";

export default function VisitorQrValidationPage() {
  return (
    <section>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-[var(--primary)]">
          Validación QR
        </p>
        <h2 className="mt-2 text-3xl font-bold">Validar credencial QR</h2>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Escanee una credencial existente para registrar un nuevo ingreso.
        </p>
      </div>

      <VisitorQrScanner />
    </section>
  );
}
