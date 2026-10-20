"use client";

import Link from "next/link";
import { ArrowRight, Bot, CalendarClock, CircleDollarSign, Plus, Target, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import { useCRM } from "@/components/crm-provider";
import { DataError, LoadingPanel, ModeBadge, PageIntro, ScoreBadge } from "@/components/ui";
import { formatCompactCurrency, formatCurrency, formatDateTime, initials } from "@/lib/format";

export default function DashboardPage() {
  const { leads, loading, error, reload } = useCRM();
  const pipeline = leads.filter((lead) => lead.stage !== "Ganho").reduce((sum, lead) => sum + lead.value, 0);
  const won = leads.filter((lead) => lead.stage === "Ganho").reduce((sum, lead) => sum + lead.value, 0);
  const conversion = leads.length ? Math.round((leads.filter((lead) => lead.stage === "Ganho").length / leads.length) * 100) : 0;
  const hotLeads = [...leads].sort((a, b) => b.score - a.score).slice(0, 4);
  const focusLeads = [...leads].filter((lead) => lead.stage !== "Ganho").sort((a, b) => b.score - a.score).slice(0, 3);
  const chartMonths = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (11 - index));
    const value = leads.filter((lead) => {
      const createdAt = new Date(lead.createdAt);
      return createdAt.getFullYear() === date.getFullYear() && createdAt.getMonth() === date.getMonth();
    }).reduce((sum, lead) => sum + lead.value, 0);
    return { label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", ""), value };
  });
  const chartMax = Math.max(...chartMonths.map((month) => month.value), 0);

  const metrics = [
    { label: "Pipeline aberto", value: formatCurrency(pipeline), note: `${leads.filter((lead) => lead.stage !== "Ganho").length} oportunidades abertas`, icon: CircleDollarSign, tone: "bg-[#dff0e8] text-[#176b4b]" },
    { label: "Leads ativos", value: String(leads.filter((lead) => lead.stage !== "Ganho").length), note: `${leads.filter((lead) => lead.stage === "Novo").length} na etapa Novo`, icon: Users, tone: "bg-[#e9edcf] text-[#65751f]" },
    { label: "Taxa de conversão", value: `${conversion}%`, note: `${leads.filter((lead) => lead.stage === "Ganho").length} negócios ganhos`, icon: Target, tone: "bg-[#f8e3de] text-[#b64d3b]" },
    { label: "Receita ganha", value: formatCurrency(won), note: "Total dos leads ganhos", icon: TrendingUp, tone: "bg-[#e1e8f4] text-[#45628b]" },
  ];

  const intro = <PageIntro eyebrow="Terça-feira, 20 de outubro" title="Bom dia, Marina." description="Seu pipeline ganhou tração. Há oportunidades que merecem atenção hoje." action={<div className="flex items-center gap-2"><ModeBadge /><Link href="/leads?new=1" className="focus-ring hidden items-center gap-2 rounded-xl bg-[#176b4b] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(23,107,75,.18)] hover:bg-[#0f5a3e] sm:flex"><Plus size={17} />Novo lead</Link></div>} />;

  if (loading && leads.length === 0) return <>{intro}<LoadingPanel /></>;

  return <>
    {intro}
    {error && <DataError message={error} retry={() => void reload()} />}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores comerciais">
      {metrics.map(({ label, value, note, icon: Icon, tone }, index) => <motion.article key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} className="card rounded-2xl p-5">
        <div className="mb-5 flex items-start justify-between"><div className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></div><span className="rounded-full bg-[#edf3ef] px-2 py-1 text-[9px] font-bold uppercase tracking-[.08em] text-[#627169]">Atual</span></div>
        <p className="text-xs font-semibold text-[#77827c]">{label}</p><p className="font-display mt-1 text-[1.7rem] font-extrabold tracking-[-.045em]">{value}</p><p className="mt-2 text-[11px] text-[#909a95]">{note}</p>
      </motion.article>)}
    </section>

    <section className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
      <article className="card overflow-hidden rounded-2xl p-5 sm:p-6">
        <div className="mb-7 flex items-start justify-between"><div><h3 className="font-display font-extrabold tracking-[-.02em]">Evolução do pipeline</h3><p className="mt-1 text-xs text-[#7d8982]">Valor acumulado nos últimos 12 meses</p></div><select aria-label="Período do gráfico" className="focus-ring rounded-lg border border-[#dde4df] bg-white px-2.5 py-2 text-xs font-semibold text-[#526059]"><option>12 meses</option><option>6 meses</option></select></div>
        <div className="relative h-56">
          <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-[#a0aaa4]">{[1, .75, .5, .25, 0].map((ratio) => <div key={ratio} className="flex items-center gap-2"><span className="w-12">{formatCompactCurrency(chartMax * ratio)}</span><span className="h-px flex-1 bg-[#e7ece8]" /></div>)}</div>
          <div className="absolute bottom-5 left-14 right-1 top-2 flex items-end gap-2 sm:gap-3">{chartMonths.map((month, i) => <div key={`${month.label}-${i}`} title={`${month.label}: ${formatCurrency(month.value)}`} className="group relative flex h-full flex-1 items-end"><motion.div initial={{ height: 0 }} animate={{ height: `${(month.value / (chartMax || 1)) * 100}%` }} transition={{ duration: .55, delay: .15 + i * .03 }} className={`w-full rounded-t-md transition ${i === chartMonths.length - 1 ? "bg-[#176b4b]" : "bg-[#cfe0d6] group-hover:bg-[#a9c9b8]"}`} /></div>)}</div>
          <div className="absolute bottom-0 left-14 right-1 flex justify-between text-[9px] font-semibold uppercase text-[#9aa49f]">{chartMonths.map((month, index) => <span key={`${month.label}-${index}`} className={index % 2 === 0 || index === chartMonths.length - 1 ? "" : "hidden sm:inline"}>{month.label}</span>)}</div>
        </div>
      </article>

      <article className="card rounded-2xl p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between"><div><h3 className="font-display font-extrabold tracking-[-.02em]">Foco comercial</h3><p className="mt-1 text-xs text-[#7d8982]">Ações dos leads com maior score</p></div><span className="rounded-lg bg-[#edf5f0] px-2 py-1 text-[10px] font-bold text-[#176b4b]">{focusLeads.length} pendentes</span></div>
        <div className="space-y-3">
          {focusLeads.map((lead, index) => <div key={lead.id} className="flex items-center gap-3 rounded-xl border border-[#e4e9e5] bg-white/60 p-3"><div className={`grid size-9 shrink-0 place-items-center rounded-lg ${index === 0 ? "bg-[#fbe5e0] text-[#c95743]" : "bg-[#edf3ef] text-[#567166]"}`}><CalendarClock size={16} /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{lead.company}</p><p className="mt-0.5 truncate text-[11px] text-[#828d87]">{lead.nextAction}</p></div><span className="text-[10px] font-bold text-[#657169]">{formatDateTime(lead.lastContact)}</span></div>)}
        </div>
        <Link href="/leads" className="focus-ring mt-4 flex items-center justify-center gap-2 rounded-xl border border-[#dce4df] py-2.5 text-xs font-bold text-[#176b4b] hover:bg-[#f1f6f3]">Abrir lista de leads <ArrowRight size={14} /></Link>
      </article>
    </section>

    <section className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
      <article className="card overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#e2e7e3] px-5 py-4 sm:px-6"><div><h3 className="font-display font-extrabold tracking-[-.02em]">Leads em destaque</h3><p className="mt-1 text-xs text-[#7d8982]">Priorizados por potencial de conversão</p></div><Link href="/leads" className="text-xs font-bold text-[#176b4b] hover:underline">Ver todos</Link></div>
        <div className="divide-y divide-[#e7ebe8]">{hotLeads.map((lead) => <Link href={`/leads?lead=${lead.id}`} key={lead.id} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-[#f6f8f5] sm:px-6"><div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e7eee9] text-[10px] font-extrabold text-[#3e5b4c]">{initials(lead.name)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{lead.name}</p><p className="truncate text-[11px] text-[#838d88]">{lead.company} · {lead.nextAction}</p></div><div className="hidden text-right sm:block"><p className="text-xs font-bold">{formatCurrency(lead.value)}</p><p className="mt-0.5 text-[10px] text-[#8b9690]">{lead.stage}</p></div><ScoreBadge score={lead.score} /></Link>)}</div>
      </article>

      <article className="noise relative overflow-hidden rounded-2xl bg-[#173f31] p-6 text-white shadow-[0_16px_50px_rgba(18,61,45,.12)]">
        <div className="relative z-10"><div className="mb-8 flex items-center justify-between"><div className="grid size-10 place-items-center rounded-xl bg-[#d7f06f] text-[#173f31]"><Bot size={19} /></div><span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#d7f06f]"><span className="size-1.5 rounded-full bg-[#d7f06f]" /> Servidor preparado</span></div><p className="text-xs font-bold uppercase tracking-[.14em] text-white/45">Assistente comercial</p><h3 className="font-display mt-3 text-xl font-extrabold leading-snug tracking-[-.035em]">Transforme contexto em próximos passos comerciais.</h3><p className="mt-3 text-xs leading-relaxed text-white/55">Configure a OpenAI para gerar análises reais e contextualizadas para cada lead.</p><Link href="/leads" className="focus-ring mt-7 inline-flex items-center gap-2 rounded-xl bg-[#d7f06f] px-4 py-2.5 text-xs font-extrabold text-[#173f31] hover:bg-[#e2f68b]">Selecionar um lead <ArrowRight size={14} /></Link></div>
        <div className="absolute -bottom-24 -right-20 size-64 rounded-full border-[42px] border-white/[.035]" />
      </article>
    </section>
  </>;
}
