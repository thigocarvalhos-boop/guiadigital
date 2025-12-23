
import { Track } from './types.ts';

export const TRACKS: Track[] = [
  {
    id: 'social-media',
    title: 'Social Media Strategy',
    icon: 'fa-hashtag',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
    lessons: [
      {
        id: 'sm-1',
        title: 'Posicionamento e Voz',
        category: 'Social Media',
        theory: 'Definir o posicionamento é o primeiro passo para não ser só mais um no feed. No Porto Digital, as marcas que se destacam são as que têm alma e estratégia.',
        quiz: {
          question: "O que define a 'Voz da Marca'?",
          options: ["O volume do áudio dos vídeos", "A personalidade expressa na comunicação", "Apenas as cores do logo"],
          answer: 1
        },
        labPrompt: "Escreva uma bio de Instagram para um café tecnológico no Bairro do Recife.",
        deliveryType: 'link',
        competency: 'Estrategia'
      }
    ]
  },
  {
    id: 'visual-design',
    title: 'Visual Design Labs',
    icon: 'fa-palette',
    imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800',
    lessons: [
      {
        id: 'vd-1',
        title: 'Composição de Ativos',
        category: 'Design',
        theory: 'Design não é só "perfumaria", é hierarquia de informação. Aprenda a guiar o olho do usuário.',
        quiz: {
          question: "Qual o elemento principal da hierarquia visual?",
          options: ["O contraste", "O tamanho do arquivo", "A quantidade de fontes"],
          answer: 0
        },
        labPrompt: "Crie um card de evento no Canva para um Meetup de Devs.",
        deliveryType: 'link',
        competency: 'Tecnica'
      }
    ]
  }
];
