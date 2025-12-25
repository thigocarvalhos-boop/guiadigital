
import { Track } from './types.ts';

export interface MuralItem {
  id: string;
  type: 'AVISO' | 'DICA' | 'EVENTO';
  title: string;
  content: string;
  date: string;
  icon: string;
}

export const MURAL_ITEMS: MuralItem[] = [
  {
    id: 'm1',
    type: 'AVISO',
    title: 'Sincronização de Dossiê',
    content: 'Boy, não esquece de revisar teu portfólio antes de bater um papo com cliente. O mercado olha a técnica, mas o brilho nos olhos conta muito.',
    date: 'Hoje',
    icon: 'fa-sync'
  },
  {
    id: 'm2',
    type: 'DICA',
    title: 'Como cobrar o primeiro trampo?',
    content: 'Não desvalorize teu corre. Se é iniciante, foque em pacotes por entrega (Ex: 5 artes = X). Isso dá clareza pro cliente e segurança pra tu.',
    date: '2 dias atrás',
    icon: 'fa-hand-holding-dollar'
  },
  {
    id: 'm3',
    type: 'EVENTO',
    title: 'Workshop no Porto Digital',
    content: 'Sexta-feira teremos mentoria presencial sobre IA Generativa aplicada a Design. Cola lá no Cais do Apolo, às 14h.',
    date: '15 Out',
    icon: 'fa-users'
  },
  {
    id: 'm4',
    type: 'AVISO',
    title: 'Comunidade em Expansão',
    content: 'Batemos a marca de 500 jovens ativos no GUI.A! O ecossistema de Recife tá ficando pequeno pra tanto talento.',
    date: '1 sem atrás',
    icon: 'fa-rocket'
  }
];

export const TRACKS: Track[] = [
  {
    id: 'social-media',
    title: 'Social Media Strategy',
    description: 'Gestão estratégica e construção de comunidades digitais.',
    icon: '📱',
    lessons: [
      {
        id: 'sm-1',
        title: 'Calendário e Retenção',
        category: 'ESTRATÉGIA',
        theoryContent: `O Social Media profissional não apenas "posta", ele gerencia ativos de atenção. 
        1. Pilares de Conteúdo: Autoridade, Conexão e Venda. 
        2. Regra dos 3 Segundos: O gancho inicial determina o alcance. 
        3. AIDA: Atenção, Interesse, Desejo e Ação na escrita de legendas.`,
        quiz: {
          question: "Qual o objetivo principal do pilar de 'Conexão' em uma estratégia de conteúdo?",
          options: [
            "Vender um produto imediatamente",
            "Humanizar a marca e gerar identificação com o seguidor",
            "Apenas preencher o calendário editorial"
          ],
          answer: 1,
          explanation: "Conteúdo de conexão serve para criar laços emocionais, aumentando a LTV (Lifetime Value) do cliente."
        },
        practicePrompt: "Crie uma linha editorial de 3 dias para uma lanchonete de bairro. Defina o objetivo técnico de cada post.",
        submissionPrompt: "Documente o planejamento: Tema, Formato (Reels/Foto) e CTA sugerido.",
        competency: 'Escrita'
      }
    ]
  },
  {
    id: 'traffic-manager',
    title: 'Gestor de Tráfego',
    description: 'Mídia paga, performance e análise de dados reais.',
    icon: '📈',
    lessons: [
      {
        id: 'tm-1',
        title: 'Lógica de Leilão e Funil',
        category: 'PERFORMANCE',
        theoryContent: `Tráfego pago é a compra de dados. 
        1. Estrutura: Campanha (Objetivo) > Conjunto (Público) > Anúncio (Criativo). 
        2. Métricas: CPM, CPC, CTR e o mais importante: CPA (Custo por Aquisição). 
        3. Pixel: O cérebro da operação que rastreia conversões.`,
        quiz: {
          question: "Se uma campanha tem CTR alto mas nenhuma venda, onde provavelmente está o problema?",
          options: [
            "No anúncio (criativo)",
            "Na página de destino ou oferta do produto",
            "No valor investido por dia"
          ],
          answer: 1,
          explanation: "CTR alto significa que o anúncio atraiu o clique, mas se não houve venda, a falha está na etapa seguinte: o site ou a oferta."
        },
        practicePrompt: "Um cliente tem R$ 10 diários. Como você dividiria esse valor entre Atração (público frio) e Remarketing (público quente)?",
        submissionPrompt: "Desenhe o funil de tráfego: Público Alvo, Orçamento e Meta de CPA.",
        competency: 'Estrategia'
      }
    ]
  },
  {
    id: 'video-editor',
    title: 'Editor de Vídeo',
    description: 'Audiovisual de alto impacto para Reels, Ads e YouTube.',
    icon: '✂️',
    lessons: [
      {
        id: 've-1',
        title: 'Cortes e Sound Design',
        category: 'AUDIOVISUAL',
        theoryContent: `Edição para mobile exige ritmo. 
        1. J-Cuts e L-Cuts: Fluidez no diálogo. 
        2. Sound Design: Efeitos sonoros que enfatizam a ação. 
        3. Legendas Dinâmicas: Essenciais para consumo sem áudio (80% do tráfego mobile).`,
        quiz: {
          question: "O que é um 'Jump Cut' e qual sua principal utilidade no digital?",
          options: [
            "Um erro de gravação que deve ser evitado",
            "Um corte seco que elimina pausas desnecessárias, aumentando o dinamismo",
            "Uma transição de dissolução suave entre cenas"
          ],
          answer: 1,
          explanation: "O Jump Cut mantém o espectador engajado ao remover tempos mortos e 'vícios' de fala."
        },
        practicePrompt: "Descreva o roteiro de edição para um anúncio de 15 segundos: O que acontece no segundo 1, 7 e 14?",
        submissionPrompt: "Fluxo de edição: Gancho, Conflito, Resolução e CTA.",
        competency: 'Audiovisual'
      }
    ]
  },
  {
    id: 'digital-designer',
    title: 'Designer Digital',
    description: 'Identidade visual e comunicação gráfica profissional.',
    icon: '🎨',
    lessons: [
      {
        id: 'dd-1',
        title: 'Hierarquia e Contraste',
        category: 'DESIGN',
        theoryContent: `Design é organizar informação. 
        1. Hierarquia: Guie o olho do leitor para o mais importante primeiro. 
        2. Gestalt: Princípios de proximidade e semelhança. 
        3. Tipografia: Fontes que comunicam a personalidade da marca.`,
        quiz: {
          question: "No design de um anúncio, o que deve ter o maior peso visual?",
          options: [
            "O logotipo da empresa",
            "A Proposta Única de Valor (o benefício principal)",
            "As redes sociais do cliente no rodapé"
          ],
          answer: 1,
          explanation: "O benefício (headline) é o que interrompe o scroll do usuário. O logo é secundário na fase de atenção."
        },
        practicePrompt: "Defina uma paleta de 3 cores para uma fintech voltada a jovens de periferia. Justifique a escolha técnica.",
        submissionPrompt: "Guia de Estilo: Paleta (Hex), Fontes e Conceito Visual.",
        competency: 'Design'
      }
    ]
  }
];
