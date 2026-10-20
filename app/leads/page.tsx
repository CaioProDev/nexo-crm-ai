"use client";

import { cloneElement, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, Check, ChevronDown, Copy, Mail, MoreHorizontal, Phone, Plus, Search, SlidersHorizontal, Sparkles, Trash2, X } from "lucide-react";
import { useCRM } from "@/components/crm-provider";
import { DataError, LoadingPanel, ModeBadge, PageIntro, ScoreBadge } from "@/components/ui";
import { formatCurrency, formatDateTime, initials } from "@/lib/format";
import { leadStages, type AIAnalysis, type Lead, type LeadInput, type LeadStage } from "@/lib/types";

const emptyForm: LeadInput = { name: "", company: "", email: "", phone: "", value: 0, stage: "Novo", source: "Site", nextAction: "Fazer primeiro contato" };

export default function LeadsPage() {
  const { leads, loading, error, mutating, reload, addLead, updateLead, deleteLead } = useCRM();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<LeadStage | "Todos">("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadInput>(emptyForm);
  const [formError, setFormError] = useState("");
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const handledQuery = useRef(false);

  useEffect(() => {
    if (handledQuery.current || loading) return;
    handledQuery.current = true;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "1") setModalOpen(true);
      const lead = leads.find((item) => item.id === params.get("lead"));
      if (lead) setSelected(lead);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [leads, loading]);

  const filtered = useMemo(() => leads.filter((lead) => {
    const matchesQuery = `${lead.name} ${lead.company} ${lead.email}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (stage === "Todos" || lead.stage === stage);
  }), [leads, query, stage]);

  function openCreate() { setEditing(null); setForm(emptyForm); setFormError(""); setModalOpen(true); }
  function openEdit(lead: Lead) { setEditing(lead); setForm({ name: lead.name, company: lead.company, email: lead.email, phone: lead.phone, value: lead.value, stage: lead.stage, source: lead.source, nextAction: lead.nextAction, score: lead.score }); setFormError(""); setModalOpen(true); }
  function openDetails(lead: Lead) { setSelected(lead); setAnalysis(null); setAnalysisError(""); setMessageCopied(false); }
  function closeModal() { setModalOpen(false); setEditing(null); setFormError(""); }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (form.name.trim().length < 2 || form.company.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(form.email)) {
      setFormError("Preencha nome, empresa e um e-mail válido."); return;
    }
    try {
      if (editing) await updateLead(editing.id, form); else await addLead(form);
      closeModal();
    } catch (requestError) {
      setFormError(requestError instanceof Error ? requestError.message : "Não foi possível salvar o lead.");
    }
  }

  async function analyzeLead(lead: Lead) {
    setSelected(lead); setAnalysis(null); setAnalysisError(""); setMessageCopied(false); setAnalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze-lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: lead.id }) });
      const data = await response.json() as AIAnalysis & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Não foi possível analisar este lead.");
      setAnalysis(data);
    } catch (error) { setAnalysisError(error instanceof Error ? error.message : "Erro inesperado ao analisar."); }
    finally { setAnalyzing(false); }
  }

  async function copySuggestedMessage() {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(analysis.suggested_message);
      setMessageCopied(true);
    } catch {
      setAnalysisError("Não foi possível copiar a mensagem. Selecione o texto e copie manualmente.");
    }
  }

  async function removeSelected() {
    if (!selected || !window.confirm(`Excluir ${selected.name}?`)) return;
    try {
      await deleteLead(selected.id);
      setSelected(null);
    } catch {
      // The provider exposes the server error in the page-level feedback.
    }
  }

  const intro = <PageIntro eyebrow="Base comercial" title="Leads" description="Organize contatos, acompanhe prioridades e transforme contexto em próximas ações." action={<div className="flex items-center gap-2"><ModeBadge /><button onClick={openCreate} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[#176b4b] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(23,107,75,.16)] hover:bg-[#0f5a3e]"><Plus size={17} />Novo lead</button></div>} />;

  if (loading && leads.length === 0) return <>{intro}<LoadingPanel label="Carregando leads do Supabase…" /></>;

  return <>
    {intro}
    {error && <DataError message={error} retry={() => void reload()} />}

    <div className="card overflow-hidden rounded-2xl">
      <div className="flex flex-col gap-3 border-b border-[#e2e7e3] p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-[#dce3de] bg-white px-3 text-[#7a857f]"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, empresa ou e-mail" className="w-full bg-transparent text-sm text-[#26342d] outline-none placeholder:text-[#9ca59f]" /></label>
        <div className="flex gap-2"><label className="flex h-10 items-center gap-2 rounded-xl border border-[#dce3de] bg-white px-3 text-xs font-bold text-[#58655e]"><SlidersHorizontal size={14} /><select value={stage} onChange={(e) => setStage(e.target.value as LeadStage | "Todos")} className="bg-transparent outline-none"><option>Todos</option>{leadStages.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={12} /></label></div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead><tr className="border-b border-[#e7ebe8] bg-[#f7f9f6] text-[10px] font-extrabold uppercase tracking-[.1em] text-[#87918c]"><th className="px-5 py-3.5 sm:px-6">Contato</th><th className="px-4 py-3.5">Etapa</th><th className="px-4 py-3.5">Valor</th><th className="px-4 py-3.5">Score</th><th className="px-4 py-3.5">Próxima ação</th><th className="px-4 py-3.5">Ações</th></tr></thead>
          <tbody className="divide-y divide-[#e7ebe8]">{filtered.map((lead) => <tr key={lead.id} className="group bg-white/45 transition hover:bg-[#f8faf7]">
            <td className="px-5 py-4 sm:px-6"><button onClick={() => openDetails(lead)} className="flex items-center gap-3 text-left"><span className="grid size-10 place-items-center rounded-full bg-[#e5eee8] text-[11px] font-extrabold text-[#355746]">{initials(lead.name)}</span><span><span className="block text-sm font-bold">{lead.name}</span><span className="mt-0.5 block text-[11px] text-[#7e8983]">{lead.company}</span></span></button></td>
            <td className="px-4 py-4"><select disabled={mutating} aria-label={`Etapa de ${lead.name}`} value={lead.stage} onChange={(e) => { void updateLead(lead.id, { stage: e.target.value as LeadStage }).catch(() => undefined); }} className="focus-ring rounded-full border border-[#dce4df] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#526159] disabled:opacity-50">{leadStages.map((item) => <option key={item}>{item}</option>)}</select></td>
            <td className="px-4 py-4 text-xs font-bold">{formatCurrency(lead.value)}</td><td className="px-4 py-4"><ScoreBadge score={lead.score} /></td><td className="max-w-[220px] px-4 py-4"><p className="truncate text-xs font-semibold text-[#536058]">{lead.nextAction}</p><p className="mt-1 text-[10px] text-[#929b96]">{formatDateTime(lead.lastContact)}</p></td>
            <td className="px-4 py-4"><div className="flex items-center gap-1"><button onClick={() => analyzeLead(lead)} aria-label={`Analisar ${lead.name} com IA`} className="focus-ring grid size-8 place-items-center rounded-lg text-[#176b4b] hover:bg-[#eaf3ed]"><Sparkles size={15} /></button><button onClick={() => openEdit(lead)} aria-label={`Editar ${lead.name}`} className="focus-ring grid size-8 place-items-center rounded-lg text-[#78837d] hover:bg-[#edf1ee]"><MoreHorizontal size={16} /></button></div></td>
          </tr>)}</tbody>
        </table>
        {!filtered.length && <div className="py-16 text-center"><Search className="mx-auto mb-3 text-[#a9b2ad]" size={24} /><p className="text-sm font-bold">Nenhum lead encontrado</p><p className="mt-1 text-xs text-[#87918c]">Ajuste a busca ou o filtro de etapa.</p></div>}
      </div>
      <div className="border-t border-[#e2e7e3] px-5 py-3 text-[11px] text-[#7e8983] sm:px-6">Mostrando {filtered.length} de {leads.length} leads</div>
    </div>

    <AnimatePresence>{modalOpen && <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-[#0b1f17]/45 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}><motion.div initial={{ opacity: 0, scale: .97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .98 }} className="w-full max-w-xl rounded-3xl border border-white/50 bg-[#fbfcfa] shadow-2xl">
      <div className="flex items-start justify-between border-b border-[#e2e7e3] p-5 sm:p-6"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#176b4b]">Cadastro comercial</p><h3 className="font-display mt-1 text-xl font-extrabold tracking-[-.03em]">{editing ? "Editar lead" : "Adicionar novo lead"}</h3></div><button onClick={closeModal} aria-label="Fechar" className="focus-ring grid size-9 place-items-center rounded-xl text-[#6d7872] hover:bg-[#eef2ef]"><X size={18} /></button></div>
      <form onSubmit={submit} className="p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Ana Silva" /></Field><Field label="Empresa"><input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Ex.: Aurora Tech" /></Field>
        <Field label="E-mail"><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ana@empresa.com" /></Field><Field label="Telefone"><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" /></Field>
        <Field label="Valor estimado"><input required min="0" type="number" value={form.value || ""} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} placeholder="25000" /></Field><Field label="Etapa"><select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as LeadStage })}>{leadStages.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Origem"><input required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></Field><Field label="Próxima ação"><input required value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} /></Field>
      </div>{formError && <p role="alert" className="mt-4 rounded-xl bg-[#fbe8e4] px-3 py-2 text-xs font-semibold text-[#a54535]">{formError}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" disabled={mutating} onClick={closeModal} className="focus-ring rounded-xl border border-[#dbe3de] px-4 py-2.5 text-sm font-bold text-[#5f6b64] disabled:opacity-50">Cancelar</button><button disabled={mutating} className="focus-ring rounded-xl bg-[#176b4b] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0f5a3e] disabled:cursor-wait disabled:opacity-60">{mutating ? "Salvando…" : editing ? "Salvar alterações" : "Adicionar lead"}</button></div></form>
    </motion.div></div>}</AnimatePresence>

    <AnimatePresence>{selected && <div className="fixed inset-0 z-[60] bg-[#0b1f17]/30 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}><motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 280 }} className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-[#f8faf7] shadow-2xl">
      <div className="border-b border-[#e0e6e1] bg-white p-5 sm:p-6"><div className="flex justify-between"><div className="grid size-12 place-items-center rounded-2xl bg-[#dfeae3] text-sm font-extrabold text-[#315541]">{initials(selected.name)}</div><button onClick={() => setSelected(null)} aria-label="Fechar detalhes" className="focus-ring grid size-9 place-items-center rounded-xl text-[#69766e] hover:bg-[#f0f3f1]"><X size={18} /></button></div><h3 className="font-display mt-4 text-2xl font-extrabold tracking-[-.04em]">{selected.name}</h3><p className="text-sm text-[#7a867f]">{selected.company}</p><div className="mt-4 flex gap-2"><a href={`mailto:${selected.email}`} className="focus-ring flex items-center gap-2 rounded-xl border border-[#dce4df] px-3 py-2 text-xs font-bold"><Mail size={14} />E-mail</a><a href={`tel:${selected.phone}`} className="focus-ring flex items-center gap-2 rounded-xl border border-[#dce4df] px-3 py-2 text-xs font-bold"><Phone size={14} />Ligar</a></div></div>
      <div className="space-y-4 p-5 sm:p-6"><div className="card grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[#e3e9e5]">{[["Valor", formatCurrency(selected.value)], ["Score", `${selected.score}/100`], ["Etapa", selected.stage], ["Origem", selected.source]].map(([label, value]) => <div key={label} className="bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#929c96]">{label}</p><p className="mt-1 text-sm font-extrabold">{value}</p></div>)}</div>
        <div className="card rounded-2xl p-5"><div className="mb-4 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#e5f0e9] text-[#176b4b]"><Bot size={16} /></span><div><p className="text-sm font-extrabold">Assistente de IA</p><p className="text-[10px] text-[#89938e]">Análise real via OpenAI</p></div></div>
          {!analysis && !analysisError && !analyzing && <><p className="text-xs leading-relaxed text-[#68746d]">Analise o contexto comercial deste lead e receba próximos passos objetivos.</p><button onClick={() => analyzeLead(selected)} className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173f31] py-2.5 text-xs font-extrabold text-white"><Sparkles size={14} />Analisar com IA</button></>}
          {analyzing && <div className="py-6 text-center"><span className="mx-auto block size-6 animate-spin rounded-full border-2 border-[#cbd9d1] border-t-[#176b4b]" /><p className="mt-3 text-xs font-semibold text-[#6b7770]">Analisando contexto comercial…</p></div>}
          {analysisError && <div className="rounded-xl border border-[#ead9c6] bg-[#fff7eb] p-3"><p className="text-xs font-bold text-[#8b5a22]">Análise indisponível</p><p className="mt-1 text-xs leading-relaxed text-[#8b6e4d]">{analysisError}</p>{!analysis && <button onClick={() => analyzeLead(selected)} className="focus-ring mt-3 text-xs font-extrabold text-[#176b4b]">Tentar novamente</button>}</div>}
          {analysis && <div className="space-y-4">
            <div className="rounded-xl bg-[#edf4ef] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#176b4b]">Resumo da oportunidade</p><p className="mt-1 text-xs leading-relaxed text-[#4d5e55]">{analysis.summary}</p></div>
            <AnalysisSection title="Pontos de atenção e riscos" items={analysis.risks} empty="Nenhum risco específico pôde ser confirmado com os dados disponíveis." />
            <div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#7d8882]">Próxima ação recomendada</p><p className="mt-1 text-xs font-bold leading-relaxed text-[#35473d]">{analysis.recommended_action}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#7d8882]">Justificativa</p><p className="mt-1 text-xs leading-relaxed text-[#5d6962]">{analysis.reasoning}</p></div>
            <div className="rounded-xl border border-[#dce5df] bg-white p-3"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#7d8882]">Mensagem sugerida</p><button onClick={() => void copySuggestedMessage()} aria-label="Copiar mensagem sugerida" className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-extrabold text-[#176b4b] hover:bg-[#edf4ef]">{messageCopied ? <Check size={12} /> : <Copy size={12} />}{messageCopied ? "Copiada" : "Copiar"}</button></div><p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[#4d5e55]">{analysis.suggested_message}</p></div>
            <AnalysisSection title="Informações ausentes" items={analysis.missing_information} empty="Nenhuma limitação adicional indicada." />
          </div>}
        </div>
        <button disabled={mutating} onClick={() => void removeSelected()} className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl border border-[#efd8d3] py-2.5 text-xs font-bold text-[#b84f3d] hover:bg-[#fff4f1] disabled:cursor-wait disabled:opacity-50"><Trash2 size={14} />{mutating ? "Processando…" : "Excluir lead"}</button>
      </div>
    </motion.aside></div>}</AnimatePresence>
  </>;
}

function Field({ label, children }: { label: string; children: React.ReactElement<{ className?: string }> }) {
  return <label className="text-xs font-bold text-[#56635c]">{label}<span className="mt-1.5 block">{cloneElement(children, { className: `focus-ring h-10 w-full rounded-xl border border-[#d9e1dc] bg-white px-3 text-sm font-normal text-[#25342c] outline-none placeholder:text-[#a2aaa5] ${children.props.className ?? ""}` })}</span></label>;
}

function AnalysisSection({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#7d8882]">{title}</p>{items.length > 0 ? <ul className="mt-2 space-y-1.5">{items.map((item) => <li key={item} className="flex gap-2 text-xs leading-relaxed text-[#5d6962]"><span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#6e8b7b]" />{item}</li>)}</ul> : <p className="mt-1 text-xs leading-relaxed text-[#7b8780]">{empty}</p>}</div>;
}
