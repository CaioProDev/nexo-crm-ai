"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleDollarSign, GripVertical, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useCRM } from "@/components/crm-provider";
import { DataError, LoadingPanel, ModeBadge, PageIntro, ScoreBadge } from "@/components/ui";
import { formatCurrency, initials } from "@/lib/format";
import { leadStages, type LeadStage } from "@/lib/types";

const stageMeta: Record<LeadStage, { dot: string; line: string }> = {
  Novo: { dot: "bg-[#91a49a]", line: "bg-[#91a49a]" },
  Qualificado: { dot: "bg-[#5f9d7c]", line: "bg-[#5f9d7c]" },
  Proposta: { dot: "bg-[#d4b94f]", line: "bg-[#d4b94f]" },
  Negociação: { dot: "bg-[#e17b63]", line: "bg-[#e17b63]" },
  Ganho: { dot: "bg-[#176b4b]", line: "bg-[#176b4b]" },
};

export default function FunnelPage() {
  const { leads, loading, error, mutating, reload, moveLead } = useCRM();
  const [dragging, setDragging] = useState<string | null>(null);
  const pipeline = leads.filter((lead) => lead.stage !== "Ganho").reduce((sum, lead) => sum + lead.value, 0);

  async function dropLead(stage: LeadStage) {
    const leadId = dragging;
    setDragging(null);
    if (!leadId) return;
    try { await moveLead(leadId, stage); } catch { /* Provider exposes the error. */ }
  }

  const intro = <PageIntro eyebrow="Operação comercial" title="Funil de vendas" description="Visualize o avanço das oportunidades e mova os cards entre etapas." action={<div className="flex items-center gap-2"><ModeBadge /><Link href="/leads?new=1" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[#176b4b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0f5a3e]"><Plus size={17} />Novo lead</Link></div>} />;

  if (loading && leads.length === 0) return <>{intro}<LoadingPanel label="Carregando o funil do Supabase…" /></>;

  return <>
    {intro}
    {error && <DataError message={error} retry={() => void reload()} />}

    <div className="mb-4 flex flex-wrap gap-2">
      <div className="card flex items-center gap-3 rounded-xl px-4 py-3"><CircleDollarSign size={17} className="text-[#176b4b]" /><div><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#8a958f]">Pipeline aberto</p><p className="font-display text-sm font-extrabold">{formatCurrency(pipeline)}</p></div></div>
      <div className="card flex items-center gap-3 rounded-xl px-4 py-3"><div className="grid size-5 place-items-center rounded-full bg-[#dff0e8] text-[10px] font-extrabold text-[#176b4b]">{leads.length}</div><div><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#8a958f]">Oportunidades</p><p className="font-display text-sm font-extrabold">Em 5 etapas</p></div></div>
    </div>

    <div className="-mx-4 overflow-x-auto px-4 pb-5 sm:-mx-7 sm:px-7 lg:-mx-9 lg:px-9">
      <div className="grid min-w-[1220px] grid-cols-5 gap-3">
        {leadStages.map((stage) => {
          const items = leads.filter((lead) => lead.stage === stage);
          const total = items.reduce((sum, lead) => sum + lead.value, 0);
          return <section key={stage} onDragOver={(event) => event.preventDefault()} onDrop={() => void dropLead(stage)} className={`min-h-[520px] rounded-2xl border p-2 transition ${dragging ? "border-dashed border-[#aabbb2] bg-[#edf3ef]/70" : "border-[#dfe5e1] bg-[#e9eeea]/55"}`}>
            <div className="mb-2 rounded-xl bg-white/65 p-3"><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${stageMeta[stage].dot}`} /><h3 className="font-display text-sm font-extrabold">{stage}</h3><span className="ml-auto grid size-5 place-items-center rounded-full bg-[#edf1ee] text-[10px] font-bold text-[#68756e]">{items.length}</span></div><p className="mt-2 text-[10px] font-semibold text-[#8b9690]">{formatCurrency(total)}</p><div className="mt-2 h-0.5 overflow-hidden rounded-full bg-[#e4e9e5]"><div className={`h-full ${stageMeta[stage].line}`} style={{ width: `${Math.min(100, 30 + items.length * 20)}%` }} /></div></div>
            <div className="space-y-2">{items.map((lead, index) => <motion.article layout key={lead.id} draggable={!mutating} onDragStart={() => setDragging(lead.id)} onDragEnd={() => setDragging(null)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: dragging === lead.id ? .45 : 1, y: 0 }} transition={{ delay: index * .03 }} className="card group cursor-grab rounded-xl p-3.5 active:cursor-grabbing">
              <div className="flex items-start justify-between"><span className="rounded-md bg-[#edf2ee] px-2 py-1 text-[9px] font-bold uppercase tracking-[.08em] text-[#69766f]">{lead.source}</span><GripVertical size={15} className="text-[#bac2bd] opacity-0 transition group-hover:opacity-100" /></div>
              <div className="mt-3 flex items-center gap-2.5"><div className="grid size-8 place-items-center rounded-full bg-[#e3ece6] text-[9px] font-extrabold text-[#3f5c4d]">{initials(lead.name)}</div><div className="min-w-0"><p className="truncate text-xs font-extrabold">{lead.company}</p><p className="truncate text-[10px] text-[#808b85]">{lead.name}</p></div></div>
              <p className="mt-3 line-clamp-2 min-h-8 text-[11px] leading-relaxed text-[#6c7871]">{lead.nextAction}</p>
              <div className="mt-3 flex items-end justify-between border-t border-[#e7ebe8] pt-3"><div><p className="text-[9px] font-bold uppercase text-[#9aa39e]">Valor</p><p className="mt-0.5 text-xs font-extrabold">{formatCurrency(lead.value)}</p></div><ScoreBadge score={lead.score} /></div>
            </motion.article>)}</div>
            {!items.length && <div className="grid h-28 place-items-center rounded-xl border border-dashed border-[#cfd8d2] text-center"><p className="text-[11px] font-semibold text-[#8c9791]">Arraste uma oportunidade<br />para esta etapa</p></div>}
          </section>;
        })}
      </div>
    </div>
    <div className="flex items-center gap-2 text-[11px] text-[#7d8982]"><ArrowRight size={13} /><span>Arraste os cards horizontalmente para atualizar a etapa do lead.</span></div>
  </>;
}
