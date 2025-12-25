
import { Track } from './types.ts';

export const TRACKS: Track[] = [
  {
    id: 'social-media-track',
    title: 'Social Media Strategy',
    icon: '📱',
    lessons: [
      {
        id: 'sm-1',
        title: 'Editorial e Planejamento',
        category: 'SOCIAL MEDIA',
        theoryContent: `Gestão de redes sociais profissional não é postar por postar. É sobre retenção e construção de comunidade.

1. **Calendário Editorial:** Organizar posts por pilares de conteúdo (Autoridade, Venda, Conexão e Entretenimento). Sem pilar, o perfil vira um panfleto digital.
2. **Lógica de Algoritmo:** No Instagram e TikTok, os primeiros 3 segundos decidem o alcance. Foque no "Hook" (Gancho).
3. **Escrita Estratégica:** Legendas devem seguir o método AIDA (Atenção, Interesse, Desejo, Ação). Cada post deve ter um objetivo claro de negócio.`,
        quiz: {
          question: "Qual técnica de escrita é mais recomendada para converter seguidores em compradores na legenda?",
          options: [
            "Método de escrita criativa livre",
            "Estrutura AIDA (Atenção, Interesse, Desejo, Ação)",
            "Apenas colocar o preço e sair"
          ],
          answer: 1,
          explanation: "O método AIDA guia o usuário por um funil psicológico, desde o gancho inicial até a chamada para ação (CTA)."
        },
        practicePrompt: "Crie um cronograma semanal simples (3 posts) para uma loja de roupas do seu bairro. Defina o pilar de cada post e o objetivo técnico.",
        submissionPrompt: "Documente o planejamento: Tema do Post, Tipo de Mídia (Reels/Carrossel) e o CTA que será usado.",
        competency: 'Escrita'
      }
    ]
  },
  {
    id: 'traffic-manager-track',
    title: 'Gestor de Tráfego Pago',
    icon: '📈',
    lessons: [
      {
        id: 'traffic-1',
        title: 'Arquitetura de Campanhas',
        category: 'PERFORMANCE',
        theoryContent: `Mídia paga é a arte de comprar dados para gerar lucro.

1. **Estrutura Pro:** Campanha (Objetivo) > Conjunto de Anúncios (Público/Verba) > Anúncio (Criativo).
2. **Métricas Chave:** CPA (Custo por Aquisição), CPM (Custo por mil impressões) e ROAS.
3. **Públicos:** Diferencie Público Frio (nunca te viu) de Público Quente (Remarketing). Nunca gaste toda a verba em público frio se o pixel já tem dados.`,
        quiz: {
          question: "Se você quer que as pessoas comprem um produto, qual objetivo de campanha deve escolher no Gerenciador?",
          options: [
            "Reconhecimento de Marca",
            "Vendas / Conversão",
            "Engajamento com o Post"
          ],
          answer: 1,
          explanation: "O objetivo de Vendas otimiza o algoritmo para encontrar pessoas com maior probabilidade de finalizar uma compra."
        },
        practicePrompt: "Um cliente tem R$ 500 para investir no mês. Como você dividiria essa verba entre 'Atração de novos clientes' e 'Remarketing'? Justifique com lógica técnica.",
        submissionPrompt: "Apresente um plano de investimento: Orçamento diário, Sugestão de Público e Meta de CPA.",
        competency: 'Estrategia'
      }
    ]
  },
  {
    id: 'video-editor-track',
    title: 'Editor de Vídeo (Ads & Reels)',
    icon: '✂️',
    lessons: [
      {
        id: 'video-1',
        title: 'Storytelling Curto e Edição Ads',
        category: 'AUDIOVISUAL',
        theoryContent: `Edição mobile (CapCut) ou desktop (Premiere) precisa seguir a velocidade do digital.

1. **Regra dos 3 Segundos:** O corte inicial deve quebrar o padrão visual do usuário.
2. **Ritmo e Sound Design:** A trilha sonora não é fundo, ela dita o corte. Use SFX (efeitos sonoros) para destacar CTAs.
3. **Formatos:** 9:16 é o rei. Legendas dinâmicas aumentam a retenção em 40% em ambientes onde o áudio está desligado.`,
        quiz: {
          question: "Qual o elemento mais importante para manter a retenção em um vídeo curto de 15 segundos?",
          options: [
            "A resolução 4K da câmera",
            "O gancho (hook) nos primeiros segundos",
            "Uma trilha sonora famosa"
          ],
          answer: 1,
          explanation: "Sem um gancho forte, o usuário 'scrola' o vídeo antes mesmo de ver o conteúdo principal."
        },
        practicePrompt: "Escreva o roteiro de edição de um vídeo de 15 segundos para uma lanchonete. Descreva o que acontece no segundo 0, no segundo 7 e no segundo 15.",
        submissionPrompt: "Documente o fluxo: Gancho Visual, Desenvolvimento e CTA Final.",
        competency: 'Audiovisual'
      }
    ]
  },
  {
    id: 'digital-designer-track',
    title: 'Designer Digital & Branding',
    icon: '🎨',
    lessons: [
      {
        id: 'design-1',
        title: 'Identidade e Hierarquia Visual',
        category: 'DESIGN',
        theoryContent: `Design para social media é sobre clareza e contraste.

1. **Hierarquia Visual:** O que o olho deve ler primeiro? Use tamanho e cor para guiar o olhar.
2. **Psicologia das Cores:** Cores quentes geram urgência/fome. Cores frias geram confiança/tecnologia.
3. **Branding Local:** Como transformar um negócio de bairro em uma marca que parece 'premium' usando apenas princípios de design e consistência.`,
        quiz: {
          question: "O que é 'Espaço Negativo' no design e por que ele é importante?",
          options: [
            "É um erro de impressão",
            "É a área vazia que permite ao layout 'respirar' e focar no que importa",
            "É quando usamos a cor preta no fundo"
          ],
          answer: 1,
          explanation: "O espaço negativo evita a poluição visual e garante que a mensagem principal seja lida sem esforço."
        },
        practicePrompt: "Escolha uma barbearia fictícia. Defina a paleta de cores (2 cores principais) e a tipografia. Explique por que essas escolhas comunicam profissionalismo.",
        submissionPrompt: "Apresente o guia visual: Cores (Hexadecimal), Fontes e Estilo de Imagem.",
        competency: 'Design'
      }
    ]
  }
];
