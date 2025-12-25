
import { Track } from './types.ts';

export const TRACKS: Track[] = [
  {
    id: 'social-media',
    title: 'Gestão de Redes Sociais',
    icon: '📊',
    imageUrl: '',
    lessons: [
      {
        id: 'sm-1',
        title: 'Domínio de Algoritmo',
        category: 'ESTRATÉGIA',
        theory: 'Deixe de ser "postador" e vire estrategista. Aprenda a dominar o algoritmo e criar comunidades lucrativas.',
        quiz: {
          question: "Qual o foco da nova economia de atenção?",
          options: ["Likes", "Retenção e Comunidade", "Quantidade de posts"],
          answer: 1
        },
        labPrompt: "Desenhe uma estratégia de 3 posts focada em retenção para um negócio local.",
        deliveryType: 'link',
        competency: 'Estrategia'
      }
    ]
  },
  {
    id: 'ads-manager',
    title: 'Gestor de Tráfego Pago',
    icon: '📈',
    imageUrl: '',
    lessons: [
      {
        id: 'tp-1',
        title: 'Lucro com Anúncios',
        category: 'TRÁFEGO',
        theory: 'Aprenda a investir dinheiro e trazer lucro real para negócios locais usando Meta e Google Ads.',
        quiz: {
          question: "O que é ROAS?",
          options: ["Retorno sobre investimento em anúncios", "Custo por clique", "Número de seguidores"],
          answer: 0
        },
        labPrompt: "Crie a estrutura de uma campanha de 'Mensagens' para uma pizzaria no seu bairro.",
        deliveryType: 'link',
        competency: 'Analise'
      }
    ]
  },
  {
    id: 'video-mobile',
    title: 'Editor de Vídeo Mobile',
    icon: '🎬',
    imageUrl: '',
    lessons: [
      {
        id: 'vm-1',
        title: 'Vídeos que Vendem',
        category: 'VÍDEO',
        theory: 'Domine storytelling, ganchos de atenção e edição profissional no celular.',
        quiz: {
          question: "Quanto tempo dura o 'gancho' ideal?",
          options: ["10 segundos", "3 segundos", "30 segundos"],
          answer: 1
        },
        labPrompt: "Edite um vídeo de 15s com 3 cortes dinâmicos e uma legenda de destaque.",
        deliveryType: 'link',
        competency: 'Tecnica'
      }
    ]
  },
  {
    id: 'ai-creative',
    title: 'Design & AI Artist',
    icon: '🎨',
    imageUrl: '',
    lessons: [
      {
        id: 'ai-1',
        title: 'Prompt Engineering',
        category: 'DESIGN',
        theory: 'Crie identidades visuais e artes de alta performance usando IA Generativa.',
        quiz: {
          question: "O que define a qualidade de uma imagem em IA?",
          options: ["A sorte", "A clareza do prompt e referências", "O preço da ferramenta"],
          answer: 1
        },
        labPrompt: "Gere o conceito visual de uma marca de streetwear usando técnicas de Prompting.",
        deliveryType: 'link',
        competency: 'Tecnica'
      }
    ]
  }
];
