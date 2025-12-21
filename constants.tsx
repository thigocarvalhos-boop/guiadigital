
import { Module, Lesson } from './types';

const generateQuizzes = (topic: string) => [
  {
    question: `Qual o pilar fundamental para garantir o sucesso em ${topic}?`,
    options: ['Intuição e sorte', 'Método técnico e análise de dados', 'Apenas criatividade visual', 'Seguir tendências sem critério'],
    correctIndex: 1,
    explanation: 'O marketing profissional baseia-se em processos repetíveis e validação por dados.'
  }
];

const createLesson = (
  id: string, 
  title: string, 
  challenge: string, 
  delTitle: string, 
  delObjective: string, 
  checklist: string[],
  rubric: any
): Lesson => ({
  id,
  title,
  duration: '45-60m',
  minReadSeconds: 40,
  minWordsPractice: 150,
  theory: `Nesta lição de ${title}, focamos na aplicação prática de conceitos de mercado. O domínio técnico exige que você compreenda não apenas o "como", mas o "porquê". A profundidade estratégica é o que separa o amador do profissional de elite. Estude os fundamentos de ${delObjective} para prosseguir para a auditoria.`,
  challenge,
  deliverablePrompt: `${delTitle}: ${delObjective}`,
  deliverableChecklist: checklist,
  quizzes: generateQuizzes(title),
  gradingRubric: JSON.stringify(rubric),
  xpValue: 500
});

export const MODULES: Module[] = [
  {
    id: 'm1',
    title: '1. Fundamentos e Mentalidade',
    technicalSkill: 'Analista de Negócios',
    description: 'A base real: valor, oferta, demanda e o ecossistema de mercado.',
    icon: 'fa-brain',
    xpValue: 3000,
    lessons: [
      createLesson('m1l1', 'Marketing de verdade: valor, oferta e demanda', 'Explique a diferença entre divulgar e criar valor. Identifique dor, promessa e prova para um produto real.', 'Mapa Problema–Solução', 'Transformar produto em proposta de valor objetiva.', ['Definiu público', 'Listou dores', 'Promessa clara', 'Incluiu prova', 'Objeções/CTA'], { execution: 3, technical: 3, strategy: 2, professionalism: 2 }),
      createLesson('m1l2', 'Funil, jornada e intenção', 'Desenhe a jornada TOFU/MOFU/BOFU. O que a pessoa pensa e qual conteúdo resolve?', 'Funil simples com peças', 'Planejar funil mínimo viável.', ['Oferta/Persona', 'TOFU/MOFU/BOFU', '2 peças por etapa', 'KPIs/Justificativa'], {}),
      createLesson('m1l3', 'Público-alvo vs Persona', 'Crie público macro e duas personas micro para a mesma oferta.', 'Doc: Público + 2 Personas', 'Domínio da segmentação utilizável em copy.', ['Público macro', 'Personas realistas', 'Dores/Desejos', 'Copy por persona'], {}),
      createLesson('m1l4', 'Concorrência e diferenciação', 'Escolha 3 concorrentes e compare promessa, prova e CTA.', 'Tabela de concorrência', 'Leitura de mercado baseada em evidência.', ['3 players com links', 'Tabela comparativa', '10 insights', 'Hipótese diferencial'], {}),
      createLesson('m1l5', 'Oferta: promessa, prova e CTA', 'Escreva oferta em 1 parágrafo + 3 bullets + prova + garantia.', 'One-pager de oferta (PDF)', 'Produzir oferta enxuta e vendável.', ['Promessa clara', '3 bullets benefícios', 'Redução de risco', 'CTA concreto'], {}),
      createLesson('m1l6', 'Ética e responsabilidade', 'Reescreva 5 promessas enganosas de forma ética.', 'Checklist ético', 'Padrão de comunicação responsável.', ['10 promessas arriscadas', 'Versões éticas', 'Checklist pré-pub'], {})
    ]
  },
  {
    id: 'm2',
    title: '2. Branding e Posicionamento',
    technicalSkill: 'Estrategista de Marca',
    description: 'Construção de percepção, tom de voz e manuais práticos.',
    icon: 'fa-chess-king',
    xpValue: 3000,
    lessons: [
      createLesson('m2l1', 'Marca como ativo: percepção', 'Explique por que marca não é logo usando exemplo real.', 'Brand audit (perfil real)', 'Diagnóstico de marca por sinais públicos.', ['Análise Bio/Destaques', '5 incoerências', '10 melhorias'], {}),
      createLesson('m2l2', 'Posicionamento: tom e categoria', 'Escreva declaração de posicionamento + 3 mensagens chave.', 'Doc: Posicionamento + Mensagens', 'Fixar posicionamento como estrutura.', ['Declaração completa', 'Mensagens proibidas', 'Regras Tom de Voz'], {}),
      createLesson('m2l3', 'Arquitetura de marca', 'Defina arquitetura: marca-mãe e subprodutos.', 'Mapa de arquitetura', 'Organizar oferta para reduzir ruído.', ['Marca-mãe + 3 ofertas', 'Regra de nomenclatura', 'Exemplo jornada'], {}),
      createLesson('m2l4', 'Storytelling aplicado', 'Roteiro: Contexto → Conflito → Virada → Prova → CTA.', 'Roteiro + execução teste', 'Storytelling funcional para marketing.', ['Roteiro 45s Hook forte', 'Inclui método/prova', 'CTA alinhado'], {}),
      createLesson('m2l5', 'Identidade visual e linguagem', 'Defina 3 pilares, 3 regras visuais e 3 de linguagem.', 'Manual de marca MV (PDF)', 'Guia prático para consistência.', ['3 Pilares conteúdo', 'Paleta/Tipografia', 'Tom de Voz rules'], {}),
      createLesson('m2l6', 'Consistência: audit e plano', 'Plano de 7 dias para corrigir inconsistências de perfil.', 'Plano de ajuste (7 dias)', 'Transformar diagnóstico em execução.', ['Bio nova/Link', '3 Destaques reestruturados', 'Calendário 7 dias'], {})
    ]
  },
  {
    id: 'm3',
    title: '3. Conteúdo e Copywriting',
    technicalSkill: 'Copywriter Sênior',
    description: 'Sistemas de escrita persuasiva e frameworks de conversão.',
    icon: 'fa-pen-nib',
    xpValue: 3000,
    lessons: [
      createLesson('m3l1', 'Conteúdo como sistema', 'Proponha 3 pilares + 3 formatos + objetivo por formato.', 'Mapa de sistema de conteúdo', 'Criar base operacional para consistência.', ['3 Pilares definidos', 'Ritmo semanal', 'Bloco produção lote'], {}),
      createLesson('m3l2', 'Copy: dor, desejo, prova', 'Legenda: Hook → Dor → Mecanismo → Prova → CTA.', '3 variações de copy', 'Adaptação de mensagem por contexto.', ['Curta/Média/Longa', 'Gatilhagem ética', 'CTA coerente'], {}),
      createLesson('m3l3', 'Gatilhos sem manipulação', 'Escreva exemplos éticos e antiéticos de 3 gatilhos.', 'Tabela gatilho: Ético vs Antiético', 'Persuasão sem perda de credibilidade.', ['3 Gatilhos escolhidos', 'Justificativa técnica', 'Prova necessária'], {}),
      createLesson('m3l4', 'Roteiros de Reels e Carrossel', 'Roteiro Reels (hook/payoff) + Outline Carrossel.', 'Reels + Carrossel (Outline)', 'Transformar ideia em dois formatos.', ['Roteiro 30s', 'Variações Hook', 'Páginas Carrossel'], {}),
      createLesson('m3l5', 'Calendário editorial', 'Monte calendário de 14 dias com temas e KPIs.', 'Planilha calendário (14 dias)', 'Mistura de atração, prova e conversão.', ['14 Linhas tema/KPI', '2 posts conversão', '2 posts prova'], {}),
      createLesson('m3l6', 'Revisão técnica de copy', 'Pegue copy ruim, liste 5 erros e reescreva.', 'Antes/Depois de copy', 'Treinar edição profissional.', ['Copy original', '5 Problemas objetivos', 'Versão final + Justificativa'], {})
    ]
  },
  {
    id: 'm4',
    title: '4. Social Media de Negócio',
    technicalSkill: 'Community Manager',
    description: 'Gestão de algoritmos, comunidades e fluxos de agência.',
    icon: 'fa-hashtag',
    xpValue: 3000,
    lessons: [
      createLesson('m4l1', 'Algoritmo e Retenção', 'Explique sinais de retenção e crie post para maximizar.', 'Post/Protótipo retenção', 'Aplicar teoria de sinais sociais.', ['Formato/Hook', 'Estrutura retenção', 'CTA salvar/enviar'], {}),
      createLesson('m4l2', 'KPIs por formato', 'Tabela: formato x objetivo x KPI x meta.', 'Tabela KPIs + Hipóteses', 'Medir com lógica, não vaidade.', ['4 Formatos', 'Métricas aux', 'Plan de ajuste'], {}),
      createLesson('m4l3', 'Comunidade: DMs e Comentários', 'Crie 12 respostas modelo para diversos cenários.', 'Playbook de respostas', 'Padronizar sem perder humanidade.', ['12 Modelos', 'Foco conversão', 'Regra escalonamento'], {}),
      createLesson('m4l4', 'Rotina operacional SM', 'Workflow: briefing → roteiro → arte → revisão.', 'Workflow + Checklist Qualidade', 'Operar como agência profissional.', ['Etapas/SLA', 'Checklist aprovação', 'Print Quadro Trello/Notion'], {}),
      createLesson('m4l5', 'Briefing e Aprovação', 'Crie template de briefing e preencha caso fictício.', 'Template + Briefing preenchido', 'Extração de requisitos técnicos.', ['Objetivo/KPI', 'Mensagem-chave', 'Restrições éticas'], {}),
      createLesson('m4l6', 'Relatório mensal', 'Monte relatório: top conteúdos, queda e decisões.', 'Relatório mensal + Decisões', 'Transformar métricas em plano de ação.', ['Visão Geral', 'Top 3 e porquê', '5 Decisões próximas'], {})
    ]
  },
  {
    id: 'm5',
    title: '5. Tráfego Pago Essencial',
    technicalSkill: 'Media Buyer',
    description: 'Estruturas de campanha, criativos e otimização de verba.',
    icon: 'fa-bullseye',
    xpValue: 3000,
    lessons: [
      createLesson('m5l1', 'Mídia paga e Alavanca', 'Explique quando usar tráfego pago e o que esperar.', 'Plano de campanha (1 página)', 'Traduzir negócio em estrutura Ads.', ['Objetivo lead/venda', 'Público/Segmentação', 'Plano otimização'], {}),
      createLesson('m5l2', 'Estrutura Objetivo/Público', 'Crie 2 conjuntos e 2 ângulos criativos.', 'Matriz 2x2 + Creatives', 'Planejar variações testáveis.', ['2 Públicos', '2 Ângulos', 'Copies/Mockups'], {}),
      createLesson('m5l3', 'Pixel e Eventos', 'Explique eventos mínimos para lead e compra.', 'Checklist de rastreio', 'Garantir mensuração pré-investimento.', ['Eventos lead/compra', 'Plano validação', 'Erros comuns'], {}),
      createLesson('m5l4', 'Criativos que vendem', '2 criativos: dor vs benefício. Escreva copies.', '2 Criativos + 2 Copies', 'Alinhamento público-mensagem.', ['Imagem/Roteiro', 'Justificativa público', 'Checklist qualidade'], {}),
      createLesson('m5l5', 'KPIs: CTR, CPC, ROAS', 'Mini-caso: CTR baixo. Liste 5 hipóteses e ações.', 'Diagnóstico KPI', 'Troubleshooting estruturado.', ['5 Hipóteses', '5 Ações priorizadas', 'Plano teste 7 dias'], {}),
      createLesson('m5l6', 'Orçamento e Alocação', 'Planos R$300 e R$3000. Justifique fases.', 'Plano de verba + Critérios escala', 'Alocar verba com disciplina.', ['2 Cenários', 'Fase teste/escala', 'Ponto de corte'], {})
    ]
  },
  {
    id: 'm6',
    title: '6. Mídia Programática',
    technicalSkill: 'Programmatic Trader',
    description: 'O ecossistema DSP, SSP e compra via leilão RTB.',
    icon: 'fa-robot',
    xpValue: 3000,
    lessons: [
      createLesson('m6l1', 'Ecossistema Programático', 'Explique fluxo de impressão entre SSP e DSP.', 'Diagrama Programático', 'Representar fluxo de compra/venda.', ['Diagrama completo', 'Explicação fluxo', 'Glossário 5 termos'], {}),
      createLesson('m6l2', 'DSP, SSP e Ad Server', 'Quadro comparativo: função, quem usa e KPIs.', 'Quadro DSP/SSP/AdServer', 'Fixar responsabilidades técnicas.', ['Função de cada', 'KPIs associados', 'Exemplo uso'], {}),
      createLesson('m6l3', 'RTB: Lógica do Leilão', 'Mini-caso: 3 anunciantes disputam impressão.', 'Caso RTB + Explicação', 'Entender RTB como sistema decisão.', ['Cenário 3 lances', 'Critério qualidade', 'Justificativa vencedor'], {}),
      createLesson('m6l4', 'Segmentação: Contexto/Intenção', '3 planos: contextual, audiência e intenção.', 'Plano 3 estratégias', 'Treinar planejamento sem achismo.', ['Segmentação técnica', 'Trade-offs', 'Plano teste'], {}),
      createLesson('m6l5', 'Brand Safety e Fraude', 'Liste riscos e crie checklist de prevenção.', 'Checklist Anti-fraude', 'Proteção de marca e eficiência.', ['Lista de exclusões', 'Sinais de fraude', 'Plano monitoramento'], {}),
      createLesson('m6l6', 'Quando usar Programática', '3 cenários SIM e 3 NÃO. Explique lógica.', 'Matriz de decisão', 'Evitar uso por hype.', ['Cenários justificados', 'Critérios escala/verba', 'Alternativas'], {})
    ]
  },
  {
    id: 'm7',
    title: '7. Métricas e Analytics',
    technicalSkill: 'Data Strategist',
    description: 'UTMs, dashboards e diagnóstico de conversão.',
    icon: 'fa-chart-line',
    xpValue: 3000,
    lessons: [
      createLesson('m7l1', 'KPI vs Métrica', 'Escolha objetivo e defina KPIs principal e aux.', 'Tabela Obj → KPI', 'Medir com foco em resultado.', ['KPI Principal', '3 KPIs Auxiliares', 'Ação se falhar'], {}),
      createLesson('m7l2', 'UTM e Rastreio', 'Crie padrão UTM e gere 5 exemplos de links.', 'Padrão UTM + 5 links', 'Disciplina de rastreio básico.', ['Convenção nomes', '5 Links reais', 'Tabela ref equipe'], {}),
      createLesson('m7l3', 'Leitura de Painel', 'Crie mini-dashboard e defina 3 alertas.', 'Planilha Dashboard + Alertas', 'Transformar números em rotina.', ['Planilha funcional', '3 Alertas limiar', 'Guia leitura rápida'], {}),
      createLesson('m7l4', 'Diagnóstico de Queda', 'Simule queda conversão: 5 hipóteses e testes.', 'Plano diagnóstico', 'Pensamento investigativo estruturado.', ['Prioridade Imp x Esf', 'Testes variável única', 'Decisão prevista'], {}),
      createLesson('m7l5', 'Teste A/B Metódico', 'Plano A/B: hipótese, amostra e métrica sucesso.', 'Plano A/B Completo', 'Teste sem tentativa e erro.', ['Variável única', 'Tempo do teste', 'Decisão por cenário'], {}),
      createLesson('m7l6', 'Relatório Executivo', 'Relatório de 1 pág: o que houve e recomendação.', 'Relatório Executivo (PDF)', 'Comunicar para tomada de decisão.', ['Resumo 3 linhas', '3 Insights principais', 'Plano ação 3-5 itens'], {})
    ]
  },
  {
    id: 'm8',
    title: '8. Projetos e Operação',
    technicalSkill: 'Project Manager',
    description: 'Escopo, propostas comerciais e gestão de cliente.',
    icon: 'fa-list-check',
    xpValue: 3000,
    lessons: [
      createLesson('m8l1', 'Briefing Profissional', 'Crie template e preencha caso real.', 'Template + Briefing preenchido', 'Padronizar descoberta técnica.', ['Objetivo/KPI/Público', 'Assets/Restrições', 'Checklist alinhamento'], {}),
      createLesson('m8l2', 'Escopo e Prazos', 'Defina escopo para 30 dias de SM + Tráfego.', 'Escopo + Cronograma', 'Proteger execução com limites.', ['Lista entregas/semana', 'Revisões incluídas', 'Fora do escopo'], {}),
      createLesson('m8l3', 'Proposta Comercial', 'Escreva proposta: problema, solução, valor.', 'Proposta Comercial (PDF)', 'Vender com clareza e segurança.', ['Metodologia resumida', 'Investimento/Pagto', 'Condições/SLA'], {}),
      createLesson('m8l4', 'Gestão de Expectativa', '10 mensagens prontas para situações críticas.', 'Playbook 10 mensagens', 'Reduzir caos e ruído atendimento.', ['Casos: atraso/urgência', 'Limite + Próxima ação', 'Tom firme/educado'], {}),
      createLesson('m8l5', 'Checklist de Qualidade', 'Checklist pré-pub aplicado em post real.', 'Checklist + Aplicação', 'Disciplina de qualidade final.', ['15 itens verificação', 'Antes/Depois post', 'LGPD/Copyright check'], {}),
      createLesson('m8l6', 'Pós-projeto e Retenção', 'Plano de 30 dias pós entrega + continuidade.', 'Plano retenção + Proposta', 'Sustentar receita com valor real.', ['Check-ins 30 dias', 'Roteiro reunião res', 'Upsell ético rules'], {})
    ]
  },
  {
    id: 'm9',
    title: '9. Carreira e Portfólio',
    technicalSkill: 'Profissional de Elite',
    description: 'Posicionamento, precificação e vitrine de casos.',
    icon: 'fa-address-card',
    xpValue: 3000,
    lessons: [
      createLesson('m9l1', 'Trilhas e Competências', 'Compare Freela, Agência e CLT.', 'Mapa de carreira', 'Escolha consciente de caminho.', ['10 Competências/trilha', 'Entregas típicas', 'Plano 30 dias'], {}),
      createLesson('m9l2', 'Portfólio que contrata', 'Crie portfólio com 3 projetos simulados/reais.', 'Página Portfólio (Notion)', 'Vitrine prática de competência.', ['Link página pública', '3 Projetos Processo/Res', 'Minha função/Tools'], {}),
      createLesson('m9l3', 'Precificação e Pacotes', '3 pacotes (B/I/P) para social media.', 'Tabela pacotes + Revisão', 'Precificar com escopo definido.', ['Entregas por pacote', 'Preço/Justificativa', 'One-pager proposta'], {}),
      createLesson('m9l4', 'Contratos e Risco', '10 cláusulas essenciais sem juridiquês.', 'Modelo acordo + Checklist risco', 'Reduzir risco com alinhamento.', ['Cláusulas Proteção', 'SLA Comunicação', 'Política Cancelamento'], {}),
      createLesson('m9l5', 'Pitch e Entrevista', '10 Q&A técnicos + Pitch de 60s.', 'Simulação Q&A + Pitch (Video)', 'Comunicação segura e técnica.', ['10 Respostas Prova', 'Pitch 60s', 'Autoavaliação'], {}),
      createLesson('m9l6', 'Rotina e Produtividade', 'Crie rotina semanal em blocos reais.', 'Agenda + Métricas pessoais', 'Consistência sem burnout.', ['Blocos Prod/Estudo', '3-5 Indicadores pessoais', 'Plano contingência'], {})
    ]
  },
  {
    id: 'm10',
    title: '10. Formalização e Vida Real',
    technicalSkill: 'Empreendedor Digital',
    description: 'LGPD, Copyright, MEI e Projeto Capstone final.',
    icon: 'fa-scale-balanced',
    xpValue: 3000,
    lessons: [
      createLesson('m10l1', 'MEI/ME e Fisco', 'Explique quando MEI faz sentido e riscos.', 'Checklist MEI (Riscos)', 'Base para atuação profissional.', ['3 Casos Sim/Não', 'Checklist abertura', 'Organização NF'], {}),
      createLesson('m10l2', 'Previdência e Proteção', 'Plano mínimo: reserva e separação contas.', 'Plano proteção (1 pág)', 'Sustentabilidade profissional.', ['Regras PJ/Pessoal', 'Reserva conceito', 'Rotina mensal org'], {}),
      createLesson('m10l3', 'LGPD Prática', 'Mapeie dados de landing e defina retenção.', 'Mapa LGPD + Checklist', 'Reduzir risco legal coleta.', ['Finalidade por dado', 'Consentimento simples', 'Procedimento remoção'], {}),
      createLesson('m10l4', 'Direito Autoral', 'Riscos de uso sem permissão e checklist.', 'Checklist Copyright + Exemplos', 'Proteção de marca e legal.', ['5 Riscos explicados', '10 Itens verificação', 'Modelo autorização'], {}),
      createLesson('m10l5', 'Política de Privacidade', 'Escreva política curta para landing.', 'Modelo Política Privacidade', 'Conformidade para páginas leads.', ['Coleta/Finalidade', 'Direitos titular', 'Linguagem clara'], {}),
      createLesson('m10l6', 'Capstone: Projeto Final', 'Plano marketing completo 30 dias.', 'Projeto Final + Banca IA', 'Demonstrar competência integrada.', ['Diagnóstico/Estratégia', 'Plano Conteúdo/Ads', 'Apresentação Final'], {})
    ]
  }
];
