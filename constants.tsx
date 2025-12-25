
import { Track } from './types.ts';

export interface MuralItem {
  id: string;
  type: 'AVISO' | 'DICA' | 'EVENTO' | 'MEI' | 'INSTITUCIONAL';
  title: string;
  content: string;
  date: string;
  icon: string;
  links?: { label: string; url: string; icon: string }[];
  details?: string[];
  requirements?: string[];
}

export const MURAL_ITEMS: MuralItem[] = [
  {
    id: 'm1',
    type: 'AVISO',
    title: 'Sincronização de Dossiê',
    content: 'Boy, não esquece de revisar teu portfólio antes de bater um papo com cliente. O mercado olha a técnica, mas o brilho nos olhos conta muito.',
    date: 'Dica do Dia',
    icon: 'fa-sync'
  },
  {
    id: 'm-capacitacoes-go',
    type: 'EVENTO',
    title: '+ CAPACITAÇÕES ON LINE',
    content: 'O GO Recife oferece diversos cursos gratuitos para você se especializar. Acesse o portal e turbine seu Dossiê com novos certificados técnicos.',
    date: 'GO Recife',
    icon: 'fa-graduation-cap',
    links: [
      { label: 'Ver Cursos Disponíveis', url: 'https://gorecife.recife.pe.gov.br/cursos', icon: 'fa-laptop-code' }
    ]
  },
  {
    id: 'm-vagas-go',
    type: 'DICA',
    title: 'SE LIGA NAS VAGAS GO recife',
    content: 'A oportunidade que você busca pode estar a um clique. Explore as vagas abertas no portal oficial e conecte seu talento ao mercado.',
    date: 'GO Recife',
    icon: 'fa-briefcase',
    links: [
      { label: 'Acessar Oportunidades', url: 'https://gorecife.recife.pe.gov.br/oportunidades', icon: 'fa-magnifying-glass-chart' }
    ]
  },
  {
    id: 'm-guia-social',
    type: 'INSTITUCIONAL',
    title: 'CONHEÇA MAIS SOBRE O INSTITUTO GUIA SOCIAL _',
    content: 'Transformamos o futuro de jovens através da tecnologia social, ética e inclusão produtiva. Estamos aqui para guiar seu corre.',
    date: 'Institucional',
    icon: 'fa-heart',
    links: [
      { label: 'www.institutoguiasocial.org', url: 'https://www.institutoguiasocial.org', icon: 'fa-globe' },
      { label: '@institutoguiasocial', url: 'https://instagram.com/institutoguiasocial', icon: 'fa-brands fa-instagram' },
      { label: 'Manda um zap: 81 99182-8743', url: 'https://wa.me/5581991828743', icon: 'fa-brands fa-whatsapp' },
      { label: 'Email: institutoguiasocial@gmail.com', url: 'mailto:institutoguiasocial@gmail.com', icon: 'fa-envelope' }
    ]
  },
  {
    id: 'm-mei',
    type: 'MEI',
    title: 'SEJA MEI _ PROTOCOLO DE FORMALIZAÇÃO',
    content: 'O MEI é um modelo simplificado de empresa criado para tirar do mercado informal trabalhadores autônomos. Com o registro da MEI, você passa a contar com benefícios previdenciários e emissão de notas fiscais.',
    date: 'Destaque',
    icon: 'fa-id-card',
    links: [
      { label: 'Formalize-se Agora', url: 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei', icon: 'fa-user-plus' },
      { label: 'Imprimir Boleto DAS', url: 'https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao', icon: 'fa-barcode' },
      { label: 'Certificado CCMEI', url: 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/emissao-de-comprovante-ccmei', icon: 'fa-certificate' },
      { label: 'Declaração Anual', url: 'https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/dasnsimei.app/Identificacao', icon: 'fa-file-invoice' },
      { label: 'Cartão CNPJ', url: 'https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp', icon: 'fa-address-card' },
      { label: 'Alterar Dados', url: 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/atualizacao-cadastral-de-mei', icon: 'fa-pen-to-square' }
    ],
    requirements: [
      'Não ter participação em outra empresa como sócio ou titular',
      'Faturar até R$ 81.000,00 por ano',
      'Exercer atividades permitidas (Ex: Pintores, Cabeleireiros, Vendedores)'
    ],
    details: [
      'Documentos: RG, Contato, Endereço e Local do Negócio.',
      'Conta gov.br: Nível Prata ou Ouro obrigatório.'
    ]
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
