
import { Track } from './types.ts';

export const TRACKS: Track[] = [
  {
    id: 'social-media',
    title: 'Estrategista de Ativos',
    icon: '📊',
    imageUrl: '',
    lessons: [
      {
        id: 'sm-1',
        title: 'Engenharia de Retenção',
        category: 'ESTRATÉGIA',
        theory: 'Esqueça likes. No mercado real, mandamos na retenção. Aprenda a estruturar ganchos que prendem o usuário nos primeiros 1.5s.',
        quiz: {
          question: "Qual o foco da nova economia de atenção?",
          options: ["Engajamento vazio", "Retenção e LTV", "Crescimento orgânico aleatório"],
          answer: 1
        },
        labPrompt: "Desenhe uma linha editorial de 3 ativos focada em retenção agressiva para uma marca de tecnologia do Porto Digital.",
        deliveryType: 'link',
        competency: 'Estrategia'
      }
    ]
  },
  {
    id: 'ads-manager',
    title: 'Arquitetura de Tráfego',
    icon: '📈',
    imageUrl: '',
    lessons: [
      {
        id: 'tp-1',
        title: 'Arbitragem de ROI',
        category: 'ANALISE',
        theory: 'Tráfego pago não é post impulsionado. É engenharia financeira aplicada a anúncios. Domine métricas de conversão direta.',
        quiz: {
          question: "O que define o sucesso de uma campanha de performance?",
          options: ["Custo por Mil (CPM)", "Retorno Sobre Investimento (ROAS/ROI)", "Alcance total"],
          answer: 1
        },
        labPrompt: "Estruture um plano de investimento para um lançamento de R$ 5k, dividindo topo, meio e fundo de funil.",
        deliveryType: 'link',
        competency: 'Analise'
      }
    ]
  },
  {
    id: 'video-mobile',
    title: 'Editor Mobile High-End',
    icon: '🎬',
    imageUrl: '',
    lessons: [
      {
        id: 'vm-1',
        title: 'Ritmo e Storytelling',
        category: 'TECNICA',
        theory: 'O celular é sua estação de guerra. Aprenda cortes invisíveis, sound design de impacto e correção de cor profissional.',
        quiz: {
          question: "O que é um 'Jump Cut' funcional?",
          options: ["Um erro de edição", "Corte rítmico para remover pausas e acelerar a narrativa", "Efeito de transição de vídeo"],
          answer: 1
        },
        labPrompt: "Descreva seu workflow de edição para um vídeo de 30s que precisa converter venda em 10s.",
        deliveryType: 'link',
        competency: 'Tecnica'
      }
    ]
  },
  {
    id: 'ai-creative',
    title: 'Design & AI Architect',
    icon: '🎨',
    imageUrl: '',
    lessons: [
      {
        id: 'ai-1',
        title: 'Direção de Arte com IA',
        category: 'DESIGN',
        theory: 'Não é apenas "pedir imagem". É dominar Prompt Engineering e ControlNet para criar identidades visuais imbatíveis.',
        quiz: {
          question: "O que define um prompt profissional?",
          options: ["Ser longo e poético", "Estrutura lógica, referências de estilo e parâmetros técnicos", "Uso de palavras mágicas"],
          answer: 1
        },
        labPrompt: "Crie o conceito visual e os prompts para a identidade visual de uma Fintech periférica.",
        deliveryType: 'link',
        competency: 'Tecnica'
      }
    ]
  }
];
