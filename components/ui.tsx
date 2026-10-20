import { AlertCircle, ArrowDownRight, ArrowUpRight, LoaderCircle, RotateCw } from "lucide-react";

export function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#176b4b]">{eyebrow}</p><h2 className="font-display text-3xl font-extrabold tracking-[-.045em] text-[#17251f] sm:text-[2.15rem]">{title}</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-[#69756f]">{description}</p></div>{action}
  </div>;
}

export function Trend({ value, positive = true }: { value: string; positive?: boolean }) {
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return <span className={`inline-flex items-center gap-1 text-xs font-bold ${positive ? "text-[#176b4b]" : "text-[#d85d48]"}`}><Icon size={13} />{value}</span>;
}

export function ScoreBadge({ score }: { score: number }) {
  const classes = score >= 85 ? "bg-[#e3f3a5] text-[#365218]" : score >= 70 ? "bg-[#dff0e8] text-[#176b4b]" : "bg-[#edf0ed] text-[#66726c]";
  return <span className={`inline-flex min-w-11 justify-center rounded-full px-2 py-1 text-[11px] font-extrabold ${classes}`}>{score}</span>;
}

export function ModeBadge() {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe1d6] bg-[#edf6f0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-[#176b4b]"><span className="size-1.5 rounded-full bg-[#176b4b]" />Dados Supabase</span>;
}

export function LoadingPanel({ label = "Carregando dados do CRM…" }: { label?: string }) {
  return <div className="card grid min-h-56 place-items-center rounded-2xl"><div className="text-center"><LoaderCircle className="mx-auto animate-spin text-[#176b4b]" size={24} /><p className="mt-3 text-xs font-bold text-[#69756f]">{label}</p></div></div>;
}

export function DataError({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#ead9c6] bg-[#fff8ee] p-4 text-[#785331] sm:flex-row sm:items-center"><AlertCircle size={18} className="shrink-0" /><p className="flex-1 text-xs font-semibold leading-relaxed">{message}</p><button onClick={retry} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfc6aa] bg-white/60 px-3 py-2 text-xs font-bold"><RotateCw size={13} />Tentar novamente</button></div>;
}
