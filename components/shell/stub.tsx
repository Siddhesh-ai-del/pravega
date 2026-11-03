import Link from "next/link";

export function Stub({ title, detail, slice }: { title: string; detail: string; slice: string }) {
  return (
    <div className="min-h-[60vh] grid place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">slice {slice}</p>
        <h1 className="mt-2 text-xl font-semibold">{title}</h1>
        <p className="mt-1 text-[13px] text-muted max-w-[42ch]">{detail}</p>
        <Link href="/" className="mt-3 inline-block text-[13px] text-probe underline underline-offset-2">
          ← back
        </Link>
      </div>
    </div>
  );
}
