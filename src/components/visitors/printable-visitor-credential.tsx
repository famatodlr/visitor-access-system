"use client";

import { QRCodeSVG } from "qrcode.react";

export interface PrintableVisitorCredentialData {
  name: string;
  dni: string;
  company: string;
  sector: string;
  photoDataUrl: string;
  qrToken: string;
  createdAt: string;
}

interface PrintableVisitorCredentialProps {
  visitor: PrintableVisitorCredentialData;
  onRegisterAnother: () => void;
  statusLabel?: string;
  title?: string;
  secondaryActionLabel?: string;
}

const issuedAtFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

function formatIssuedAt(value: string) {
  const issuedAt = new Date(value);

  if (Number.isNaN(issuedAt.getTime())) {
    return value;
  }

  return issuedAtFormatter.format(issuedAt);
}

export function PrintableVisitorCredential({
  visitor,
  onRegisterAnother,
  statusLabel = "Visitor registered",
  title = `Credential ready for ${visitor.name}`,
  secondaryActionLabel = "Register another visitor",
}: PrintableVisitorCredentialProps) {
  const issuedAt = formatIssuedAt(visitor.createdAt);

  function handlePrint() {
    window.print();
  }

  return (
    <section className="printable-credential-root mt-8">
      <div className="print-hidden mb-6 flex flex-col gap-4 rounded-xl border border-[var(--success)]/40 bg-[var(--success)]/10 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--success)]">
            {statusLabel}
          </p>
          <h3 className="mt-2 text-xl font-bold">{title}</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            className="rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            onClick={handlePrint}
            type="button"
          >
            Print credential
          </button>
          <button
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary-hover)] hover:text-[var(--primary-hover)]"
            onClick={onRegisterAnother}
            type="button"
          >
            {secondaryActionLabel}
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-slate-300 bg-white text-slate-950 shadow-sm">
        <div className="flex flex-col gap-4 bg-[var(--primary)] px-6 py-5 text-white sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase">
              Plant Access Control
            </p>
            <h3 className="mt-2 text-2xl font-bold">Visitor Credential</h3>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm font-semibold text-blue-100">Issued</p>
            <p className="mt-1 text-base font-bold">{issuedAt}</p>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
          <div className="overflow-hidden rounded-lg border border-slate-300 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`Visitor photo for ${visitor.name}`}
              className="aspect-[3/4] h-full w-full object-cover"
              src={visitor.photoDataUrl}
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase text-slate-500">
              Visitor
            </p>
            <h4 className="mt-2 break-words text-3xl font-bold">
              {visitor.name}
            </h4>

            <dl className="mt-6 grid gap-4 text-base sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold text-slate-500">
                  DNI
                </dt>
                <dd className="mt-1 font-bold">{visitor.dni}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-slate-500">
                  Company
                </dt>
                <dd className="mt-1 font-bold">{visitor.company}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-semibold text-slate-500">
                  Sector
                </dt>
                <dd className="mt-1 font-bold">{visitor.sector}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-300 bg-white p-4">
            <QRCodeSVG
              className="h-[240px] w-[240px]"
              level="M"
              marginSize={4}
              title={`QR credential for ${visitor.name}`}
              value={visitor.qrToken}
            />
            <p className="mt-4 text-center text-sm font-semibold text-slate-500">
              Scan credential
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
