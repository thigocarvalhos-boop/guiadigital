
import { Module, Opportunity, IATool } from './types';

export const IA_TOOLS: IATool[] = [
  {
    id: 'copy-gen',
    name: 'IA Copywriter Local',
    description: 'Cria posts para Instagram de negócios do bairro.',
    icon: 'fa-pen-nib',
    minLevel: 1,
    promptTemplate: 'Crie uma legenda persuasiva para o Instagram de um(a) {business_type} localizado no bairro {neighborhood}. O foco é atrair clientes vizinhos. Use gatilhos de urgência e prova social.'
  },
  {
    id: 'seo-auditor',
    name: 'Auditor de Maps',
    description: 'Analisa o que falta para o comércio subir no ranking.',
    icon: 'fa-magnifying-glass-chart',
    minLevel: 2,
    promptTemplate: 'Analise este perfil de Google Maps: {input}. Identifique 3 erros fatais de SEO Local e sugira 3 melhorias imediatas para dominar o bairro.'
  }
];

export const MODULES: Module[] = [
  { 
    id: '1', 
    title: 'Engenharia de Maps', 
    progress: 0, 
    status: 'current',
    technicalSkill: 'SEO Local',
    description: 'Coloque clientes no topo das buscas do bairro.', 
    icon: 'fa-location-dot', 
    xpValue: 1200,
    lessons: [
      {
        id: 'l1',
        title: 'Anatomia do Perfil Imbatível',
        duration: '15m',
        content: 'Como configurar o PAD (Nome, Endereço, Telefone) de forma perfeita para o algoritmo.',
        xpValue: 400,
        checklist: ['Verificar NAP', 'Escolher Categoria Primária', 'Adicionar Horário Real']
      },
      {
        id: 'l2',
        title: 'Geotagging na Prática',
        duration: '20m',
        content: 'Usando coordenadas GPS em fotos para provar relevância local.',
        xpValue: 400,
        checklist: ['Capturar foto da fachada', 'Extrair GPS', 'Upload Otimizado']
      }
    ]
  },
  { 
    id: '2', 
    title: 'Social Media Raiz', 
    progress: 0, 
    status: 'locked',
    technicalSkill: 'Copywriting',
    description: 'Textos que fazem o vizinho comprar.', 
    icon: 'fa-bullhorn', 
    xpValue: 1500,
    lessons: [
      {
        id: 'l3',
        title: 'Copy para WhatsApp Business',
        duration: '25m',
        content: 'Scripts de fechamento para converter curiosos em clientes.',
        xpValue: 750,
        checklist: ['Criar saudação', 'Mapear 3 dores', 'Call to Action']
      }
    ]
  }
];

export const OPPORTUNITIES: Opportunity[] = [
  { id: '1', businessName: 'Mercadinho do Zé', title: 'Otimizar Google Maps', location: 'Alto da Vila', lat: -8.0, lng: -34.9, type: 'freelance', reward: 'R$ 450', requiredSkill: 'SEO Local' },
  { id: '2', businessName: 'Pet Shop Amigão', title: 'Gestão de Conteúdo IA', location: 'Centro', lat: -8.1, lng: -34.9, type: 'pj', reward: 'R$ 800/mês', requiredSkill: 'Copywriting' },
];
