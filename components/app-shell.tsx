"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, ChevronsUp, KanbanSquare, Sparkles, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const navItems = [
  { href: "/", label: "Visão geral", icon: BarChart3 },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/funil", label: "Funil", icon: KanbanSquare },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = navItems.find((item) => item.href === pathname)?.label ?? "Visão geral";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="noise fixed inset-y-0 left-0 z-40 hidden w-[248px] overflow-hidden bg-[#123d2d] text-white lg:flex lg:flex-col">
        <div className="relative flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="grid size-9 place-items-center rounded-xl bg-[#d7f06f] text-[#123d2d] shadow-[0_8px_24px_rgba(215,240,111,.16)]"><ChevronsUp size={19} strokeWidth={2.7} /></div>
          <div><p className="font-display text-lg font-extrabold leading-none tracking-[-.04em]">nexo</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-white/45">smart crm</p></div>
        </div>
        <nav className="relative flex-1 space-y-1 p-4" aria-label="Navegação principal">
          <p className="mb-3 px-3 pt-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/35">Workspace</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return <Link key={href} href={href} className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-white/10 text-white" : "text-white/58 hover:bg-white/5 hover:text-white"}`}>
              <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />{label}
              {active && <motion.span layoutId="nav-dot" className="ml-auto size-1.5 rounded-full bg-[#d7f06f]" />}
            </Link>;
          })}
          <div className="my-5 border-t border-white/10" />
          <div className="rounded-2xl border border-white/10 bg-white/[.06] p-4">
            <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-[#d7f06f]/15 text-[#d7f06f]"><Bot size={17} /></div>
            <p className="font-display text-sm font-bold">Copiloto comercial</p>
            <p className="mt-1 text-xs leading-relaxed text-white/50">Análises com IA disponíveis ao configurar sua chave.</p>
          </div>
        </nav>
        <div className="relative border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="grid size-9 place-items-center rounded-full bg-[#f07962] text-xs font-bold">MS</div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold">Marina Sales</p><p className="truncate text-xs text-white/45">Workspace Demo</p></div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dde4df]/80 bg-[#f3f6f2]/85 px-4 backdrop-blur-xl sm:px-7 lg:h-20 lg:px-9">
          <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#8a958f] lg:hidden">Nexo CRM</p><h1 className="font-display text-lg font-extrabold tracking-[-.03em] lg:text-xl">{title}</h1></div>
          <span className="hidden items-center gap-2 rounded-full border border-[#d9e1dc] bg-white/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-[#647168] sm:flex"><span className="size-1.5 rounded-full bg-[#d0ad2d]" />Workspace demo</span>
        </header>
        <AnimatePresence mode="wait"><motion.main key={pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} className="px-4 pb-24 pt-6 sm:px-7 lg:px-9 lg:pb-10 lg:pt-8">{children}</motion.main></AnimatePresence>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl border border-white/20 bg-[#123d2d]/95 p-1.5 text-white shadow-2xl backdrop-blur-xl lg:hidden" aria-label="Navegação móvel">
        {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`focus-ring flex min-w-20 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold ${pathname === href ? "bg-white/10 text-[#d7f06f]" : "text-white/55"}`}><Icon size={18} /><span>{label}</span></Link>)}
        <Link href="/leads?new=1" className="focus-ring flex min-w-20 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold text-white/55"><Sparkles size={18} /><span>Novo</span></Link>
      </nav>
    </div>
  );
}
