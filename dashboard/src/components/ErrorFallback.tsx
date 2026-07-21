export function ErrorFallback() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-[family-name:var(--font-body)] text-foreground">
        Data couldn&apos;t load — see the full pipeline and results in the
        GitHub repo.
      </p>
      <a
        href="https://github.com/lalithyaraochavala/route-merge-optimizer"
        target="_blank"
        rel="noopener noreferrer"
        className="font-[family-name:var(--font-body)] text-accent-route underline underline-offset-2"
      >
        View on GitHub
      </a>
    </div>
  );
}
