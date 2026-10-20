-- Dados inteiramente fictícios para demonstração local do portfólio.
-- Os endereços usam o TLD reservado .demo e não representam pessoas ou empresas reais.
with seed_leads (name, company, email, phone, value, stage, score, source, next_action) as (
values
  ('Marina Costa', 'Lumina Solar', 'marina@luminasolar.demo', '(11) 98821-3042', 48000, 'Negociação', 92, 'Indicação', 'Revisar condições da proposta'),
  ('Rafael Nunes', 'Vértice Log', 'rafael@verticelog.demo', '(41) 99714-1120', 32500, 'Proposta', 86, 'LinkedIn', 'Enviar estudo de ROI'),
  ('Bianca Lopes', 'Aflora Saúde', 'bianca@aflorasaude.demo', '(21) 99105-8813', 21000, 'Qualificado', 78, 'Evento', 'Agendar diagnóstico técnico'),
  ('André Martins', 'Orbe Finance', 'andre@orbefinance.demo', '(31) 98752-4560', 67000, 'Novo', 71, 'Site', 'Fazer primeiro contato'),
  ('Caio Salles', 'Nortea Foods', 'caio@nortea.demo', '(51) 99810-4482', 54000, 'Ganho', 96, 'Outbound', 'Preparar onboarding')
)
insert into public.leads (name, company, email, phone, value, stage, score, source, next_action)
select seed.name, seed.company, seed.email, seed.phone, seed.value, seed.stage, seed.score, seed.source, seed.next_action
from seed_leads as seed
where not exists (
  select 1 from public.leads as existing where lower(existing.email) = lower(seed.email)
);
