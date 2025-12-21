
import { Module, Opportunity, IATool } from './types';

export const IA_TOOLS: IATool[] = [
  {
    id: 'copy-writer',
    name: 'Copywriter Ann Handley',
    description: 'Cria textos úteis e empáticos baseados no livro "Everybody Writes".',
    icon: 'fa-pen-nib',
    minLevel: 1,
    promptTemplate: 'Aja como Ann Handley. Crie um post para o Instagram de um pequeno negócio de {business_type} no bairro {neighborhood}. O texto deve ser útil, focar no cliente e evitar jargões técnicos.'
  },
  {
    id: 'smart-planner',
    name: 'Mentor de Metas SMART',
    description: 'Transforma seus objetivos em planos de ação com prazos reais.',
    icon: 'fa-bullseye',
    minLevel: 2,
    promptTemplate: 'Analise este objetivo: {input}. Transforme-o em uma meta SMART (Específica, Mensurável, Alcançável, Relevante e com Prazo) para um jovem micro-consultor digital.'
  },
  {
    id: 'seo-optimizer',
    name: 'Analista de SEO Local',
    description: 'Sugere palavras-chave para negócios do bairro aparecerem no Google Maps.',
    icon: 'fa-location-crosshairs',
    minLevel: 3,
    promptTemplate: 'Sugira 5 palavras-chave estratégicas para um negócio de {input} ser encontrado no Google Maps por moradores do bairro {neighborhood}.'
  }
];

export const MODULES: Module[] = [
  { 
    id: '1', 
    title: 'Cidadania e Sociedade', 
    progress: 0, 
    status: 'current',
    technicalSkill: 'Ética Social',
    description: 'Unidades 01 a 04: Marketing 4.0, Direitos Sociais e Prevenção.', 
    icon: 'fa-handshake-angle', 
    xpValue: 2000,
    lessons: [
      {
        id: 'u1',
        title: 'Marketing 4.0: Humano no Centro',
        duration: '15m',
        theory: 'O Marketing 4.0, definido por Philip Kotler, é a integração entre o offline e o online, mas com foco total na humanização. As marcas agora precisam ter valores e interagir de forma ética com a sociedade.',
        challenge: 'Mapeie 2 comércios no seu bairro que você considera "humanos" no atendimento.',
        quiz: {
          question: 'O que define o Marketing 4.0 segundo a apostila?',
          options: ['Uso de robôs para vender', 'Comunicação humanizada e centrada no cliente', 'Apenas anúncios no Facebook', 'Ignorar o contato presencial'],
          correctIndex: 1,
          explanation: 'O Marketing 4.0 foca na conexão real e humanizada entre marcas e pessoas.'
        },
        checklist: ['Ler Unit 01', 'Identificar marcas locais'],
        xpValue: 500
      },
      {
        id: 'u2',
        title: 'Cidadania e Estatuto da Juventude',
        duration: '20m',
        theory: 'Cidadania é o conjunto de direitos e deveres. O Estatuto da Juventude (Lei 12.852/2013) garante ao jovem acesso à cultura, lazer, trabalho e saúde.',
        challenge: 'Acesse o link da lei fornecido na apostila e cite um direito que você não conhecia.',
        quiz: {
          question: 'Em que ano foi aprovado o Estatuto da Juventude?',
          options: ['1990', '2000', '2013', '2024'],
          correctIndex: 2,
          explanation: 'A lei de 2013 foi um marco para os direitos dos jovens brasileiros.'
        },
        checklist: ['Estudar Unit 02', 'Pesquisar Estatuto'],
        xpValue: 500
      }
    ]
  },
  { 
    id: '2', 
    title: 'Projeto de Vida e Mindset', 
    progress: 0, 
    status: 'locked',
    technicalSkill: 'Planejamento',
    description: 'Unidade 05: Ikigai, Metas SMART e Mentalidade de Crescimento.', 
    icon: 'fa-seedling', 
    xpValue: 1500,
    lessons: [
      {
        id: 'u5',
        title: 'Descobrindo seu Ikigai',
        duration: '25m',
        theory: 'Ikigai é o encontro entre o que você ama, o que você é bom, o que o mundo precisa e pelo que pode ser pago.',
        challenge: 'Escreva seus 4 pilares do Ikigai em um papel e suba uma foto da sua anotação mental.',
        quiz: {
          question: 'O que o Ikigai ajuda o jovem a definir?',
          options: ['Apenas quanto vai ganhar', 'Seu propósito de vida e carreira', 'Onde vai morar', 'Apenas seus hobbies'],
          correctIndex: 1,
          explanation: 'O Ikigai alinha paixão, vocação e renda.'
        },
        checklist: ['Unit 05 Completa', 'Desenho do Ikigai'],
        xpValue: 750
      },
      {
        id: 'u5-2',
        title: 'Mindset e Metas SMART',
        duration: '20m',
        theory: 'Carol Dweck ensina que o Mindset de Crescimento acredita no esforço. Metas SMART garantem que seus sonhos tenham prazo e métricas.',
        challenge: 'Crie uma meta SMART para sua primeira consultoria paga.',
        quiz: {
          question: 'Qual o significado da letra "S" em SMART?',
          options: ['Social', 'Sério', 'Específico (Specific)', 'Sustentável'],
          correctIndex: 2,
          explanation: 'Uma meta deve ser clara e específica para ser alcançada.'
        },
        checklist: ['Exercício SMART', 'Teste de Kolb'],
        xpValue: 750
      }
    ]
  },
  { 
    id: '3', 
    title: 'Fundamentos Técnicos', 
    progress: 0, 
    status: 'locked',
    technicalSkill: 'Marketing Digital',
    description: 'Unidades 06 e 07: Os 4 Ps, Funil de Vendas e Ferramentas 4.0.', 
    icon: 'fa-microchip', 
    xpValue: 2000,
    lessons: [
      {
        id: 'u6',
        title: 'Os 4 Ps do Marketing',
        duration: '30m',
        theory: 'Produto, Preço, Praça e Promoção. No digital, o foco mudou do produto para o cliente (Simon Sinek: Comece pelo Porquê).',
        challenge: 'Escolha um comércio e identifique como ele trabalha a "Praça" (entrega/localização).',
        quiz: {
          question: 'Segundo Simon Sinek, o Círculo Dourado começa por:',
          options: ['O quê', 'Como', 'Porquê', 'Quanto'],
          correctIndex: 2,
          explanation: 'O "Porquê" é o propósito que gera lealdade dos clientes.'
        },
        checklist: ['Unit 06 Lida', 'Círculo Dourado Pessoal'],
        xpValue: 1000
      }
    ]
  },
  { 
    id: '4', 
    title: 'Produção de Conteúdo e Design', 
    progress: 0, 
    status: 'locked',
    technicalSkill: 'Content Creation',
    description: 'Unidades 08 a 10: Copywriting, Redes Sociais e Identidade Visual.', 
    icon: 'fa-palette', 
    xpValue: 2500,
    lessons: [
      {
        id: 'u8',
        title: 'A Arte da Escrita Útil',
        duration: '30m',
        theory: 'Ann Handley ensina que todos somos escritores. No digital, sua escrita deve ser clara, concisa e focada em ajudar o leitor.',
        challenge: 'Escreva um post de 3 linhas para um salão de beleza usando a técnica do gancho.',
        quiz: {
          question: 'Qual a regra principal de Ann Handley?',
          options: ['Escrever textos longos', 'Usar palavras difíceis', 'Escrever conteúdos que realmente ajudem', 'Focar só em vender'],
          correctIndex: 2,
          explanation: 'Conteúdo de valor gera autoridade e confiança.'
        },
        checklist: ['Unit 08 Lida', 'Treino de Copy'],
        xpValue: 1250
      }
    ]
  },
  { 
    id: '5', 
    title: 'SEO e Campanhas Digitais', 
    progress: 0, 
    status: 'locked',
    technicalSkill: 'Growth',
    description: 'Unidades 11 e 12: SEO, Link Building e Planejamento de Campanhas.', 
    icon: 'fa-magnifying-glass-chart', 
    xpValue: 3000,
    lessons: [
      {
        id: 'u11',
        title: 'Dominando o SEO Local',
        duration: '40m',
        theory: 'O Google Maps prioriza: Relevância, Distância e Proeminência. Fotos e avaliações são essenciais.',
        challenge: 'Aponte 3 melhorias no perfil de uma oficina mecânica no Google Maps.',
        quiz: {
          question: 'O que significa a sigla SEO?',
          options: ['Social Engine Organization', 'Search Engine Optimization', 'Selo de Empresa Online', 'Sistema de Edição'],
          correctIndex: 1,
          explanation: 'SEO é a otimização para mecanismos de busca.'
        },
        checklist: ['Unit 11 Estudada', 'Pesquisa de Palavras-Chave'],
        xpValue: 1500
      }
    ]
  },
  { 
    id: '6', 
    title: 'Audiovisual e Métricas', 
    progress: 0, 
    status: 'locked',
    technicalSkill: 'Analista Digital',
    description: 'Unidades 13 a 15: Vídeos, Podcasts, ROI e Projeto Final.', 
    icon: 'fa-chart-line', 
    xpValue: 4000,
    lessons: [
      {
        id: 'u14',
        title: 'Métricas: Os Dados Não Mentem',
        duration: '30m',
        theory: 'Alcance, Engajamento e ROI (Retorno sobre Investimento). Você precisa medir para melhorar.',
        challenge: 'Calcule o engajamento médio dos seus últimos 3 posts no Instagram.',
        quiz: {
          question: 'O que o ROI mede?',
          options: ['Número de curtidas', 'Retorno financeiro sobre o investimento', 'Velocidade da internet', 'Quantidade de seguidores'],
          correctIndex: 1,
          explanation: 'O ROI prova se o investimento em marketing deu lucro.'
        },
        checklist: ['Unit 14 Lida', 'Análise de Gráfico'],
        xpValue: 2000
      }
    ]
  }
];

export const OPPORTUNITIES: Opportunity[] = [
  { id: '1', businessName: 'Padaria Social', title: 'Consultoria Marketing 4.0', location: 'Centro', lat: -8.0, lng: -34.9, type: 'freelance', reward: 'R$ 350', requiredSkill: 'Marketing 4.0' },
  { id: '2', businessName: 'Mercadinho do Bairro', title: 'Ajuste SEO no Maps', location: 'Vila Norte', lat: -8.1, lng: -34.9, type: 'pj', reward: 'R$ 500', requiredSkill: 'Growth' },
];
