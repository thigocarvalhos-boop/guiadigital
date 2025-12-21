
import { Module, Opportunity, IATool } from './types';

export const IA_TOOLS: IATool[] = [
  {
    id: 'copy-gen',
    name: 'IA Copywriter Local',
    description: 'Cria scripts persuasivos para redes sociais do bairro.',
    icon: 'fa-pen-nib',
    minLevel: 1,
    promptTemplate: 'Aja como um especialista em Marketing Digital focado em pequenos negócios de periferia. Crie uma legenda para Instagram de um(a) {business_type} no bairro {neighborhood}. O objetivo é converter vizinhos em clientes usando prova social e senso de comunidade.'
  },
  {
    id: 'google-bio',
    name: 'Otimizador de Perfil',
    description: 'Melhora a descrição de negócios no Google Maps.',
    icon: 'fa-location-dot',
    minLevel: 2,
    promptTemplate: 'Analise os seguintes dados de uma empresa local: {input}. Reescreva a descrição para o Google Maps focando em palavras-chave de busca local e diferenciais competitivos.'
  }
];

export const MODULES: Module[] = [
  { 
    id: '1', 
    title: 'Dominando o Google Maps', 
    progress: 0, 
    status: 'current',
    technicalSkill: 'SEO Local',
    description: 'Aprenda a colocar qualquer negócio do bairro no topo das buscas do Google.', 
    icon: 'fa-map-location-dot', 
    xpValue: 1200,
    lessons: [
      {
        id: 'l1',
        title: 'O Poder da Presença Local',
        duration: '10m',
        content: 'O Google Maps é a nova lista telefônica. Se um comércio não está lá, ele não existe para o cliente moderno.',
        checklist: ['Instalar Google Business', 'Identificar 3 comércios não listados'],
        xpValue: 400
      },
      {
        id: 'l2',
        title: 'Fotos que Vendem',
        duration: '15m',
        content: 'Fotos de alta qualidade e geolocalizadas aumentam a confiança em 300%. Aprenda a técnica da fachada iluminada.',
        checklist: ['Tirar foto da fachada', 'Subir foto com Geotag'],
        xpValue: 400
      },
      {
        id: 'l3',
        title: 'NAP e Palavras-Chave',
        duration: '20m',
        content: 'Nome, Endereço e Telefone (NAP) precisam ser idênticos em toda a web. Aprenda a configurar categorias.',
        checklist: ['Validar Telefone', 'Categorizar negócio corretamente'],
        xpValue: 400
      }
    ]
  },
  { 
    id: '2', 
    title: 'Copywriting com IA', 
    progress: 0, 
    status: 'locked',
    technicalSkill: 'Escrita Criativa',
    description: 'Use Inteligência Artificial para escrever posts que vendem de verdade.', 
    icon: 'fa-wand-magic-sparkles', 
    xpValue: 1500,
    lessons: [
      {
        id: 'l4',
        title: 'Engenharia de Prompt Social',
        duration: '25m',
        content: 'Como falar com a IA para que ela entenda a realidade da nossa comunidade.',
        checklist: ['Criar prompt de persona local', 'Gerar 3 legendas de teste'],
        xpValue: 750
      },
      {
        id: 'l5',
        title: 'Storytelling no Bairro',
        duration: '20m',
        content: 'Histórias convencem mais que preços. Use a IA para contar a história do dono do negócio.',
        checklist: ['Entrevistar um comerciante', 'Transformar história em post'],
        xpValue: 750
      }
    ]
  },
  { 
    id: '3', 
    title: 'Psicologia de Vendas', 
    progress: 0, 
    status: 'locked',
    technicalSkill: 'Vendas Diretas',
    description: 'Domine a arte de fechar contratos de consultoria no bairro.', 
    icon: 'fa-comments-dollar', 
    xpValue: 2000,
    lessons: [
      {
        id: 'l6',
        title: 'A Abordagem sem Medo',
        duration: '30m',
        content: 'Venda o benefício, não a ferramenta. Mostre como o Maps trará novos clientes amanhã.',
        checklist: ['Fazer uma visita teste', 'Coletar 2 objeções comuns'],
        xpValue: 1000
      },
      {
        id: 'l7',
        title: 'Fechamento e Contrato',
        duration: '20m',
        content: 'Como cobrar R$ 300 por uma atualização de perfil sem parecer caro.',
        checklist: ['Definir seu preço fixo', 'Simular um fechamento'],
        xpValue: 1000
      }
    ]
  },
  { 
    id: '4', 
    title: 'Gestão Financeira MEI', 
    progress: 0, 
    status: 'locked',
    technicalSkill: 'Finanças',
    description: 'Transforme o seu trabalho em um negócio formal e sustentável.', 
    icon: 'fa-chart-line', 
    xpValue: 1000,
    lessons: [
      {
        id: 'l8',
        title: 'Separação de Contas',
        duration: '15m',
        content: 'Seu dinheiro não é o dinheiro da sua empresa. Aprenda a regra do pró-labore.',
        checklist: ['Abrir conta digital PJ', 'Definir teto de gastos'],
        xpValue: 1000
      }
    ]
  }
];

export const OPPORTUNITIES: Opportunity[] = [
  { id: '1', businessName: 'Mercado do Biu', title: 'Consultoria Google Maps', location: 'Centro', lat: -8.0, lng: -34.9, type: 'freelance', reward: 'R$ 350', requiredSkill: 'SEO Local' },
  { id: '2', businessName: 'Salão da Neide', title: 'Gestão Instagram + IA', location: 'Rua Principal', lat: -8.1, lng: -34.9, type: 'pj', reward: 'R$ 600/mês', requiredSkill: 'Escrita Criativa' },
  { id: '3', businessName: 'Oficina do Gago', title: 'Configuração SEO Maps', location: 'Vila Norte', lat: -8.05, lng: -34.85, type: 'freelance', reward: 'R$ 400', requiredSkill: 'SEO Local' },
  { id: '4', businessName: 'Pet Shop Amigão', title: 'Campanha de Tráfego', location: 'Centro', lat: -8.12, lng: -34.88, type: 'freelance', reward: 'R$ 500', requiredSkill: 'Vendas Diretas' },
];
