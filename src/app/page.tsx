export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-8 text-[var(--text)]">
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1200px] items-center">
        <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="mb-2 text-sm font-semibold text-[var(--primary)]">
            Scaffold ready
          </p>
          <h1 className="text-3xl font-bold">Plant Access Control</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
            The project foundation is ready for the visitor registration and
            access tracking workflow.
          </p>
        </div>
      </section>
    </main>
  );
}
