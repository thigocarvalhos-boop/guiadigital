
import { Module } from './types.ts';

export const MODULES: Module[] = [
  {
    id: 'tr_sm',
    trailId: 'social_media',
    title: 'SOCIAL MEDIA ESTRATÉGICO',
    icon: 'fa-hashtag',
    description: 'Planejamento de conteúdo e escrita de legendas com foco em conversão de negócios.',
    lessons: [
      {
        id: 'sm_l1',
        title: 'LINHA EDITORIAL E PERSONA',
        theory: `Uma rede social sem estratégia é apenas ruído. No mercado profissional, definimos primeiro a Persona (quem compra) e a Linha Editorial (o que falamos para atrair essa persona). A Linha Editorial deve ser dividida em pilares: Autoridade, Conexão e Venda. \n\nA autoridade prova que você sabe o que faz; a conexão cria vínculo humano; a venda convida à ação. O equilíbrio comum é 40% autoridade, 40% conexão e 20% venda direta.`,
        minReadSeconds: 45,
        quiz: {
          question: 'Qual a função primordial do pilar de "Autoridade" em uma linha editorial?',
          options: [
            'Gerar curtidas rápidas com memes.',
            'Demonstrar domínio técnico e confiança para o potencial cliente.',
            'Falar apenas sobre a vida pessoal do dono do negócio.',
            'Vender o produto com o menor preço possível.'
          ],
          correctIndex: 1,
          explanation: 'Autoridade serve para reduzir a percepção de risco do cliente ao contratar ou comprar.'
        },
        challenge: 'Defina a Persona e 3 temas de postagem para um "Mercadinho de Bairro" focado em conveniência. Justifique cada tema com base nos pilares Autoridade, Conexão ou Venda.',
        reviewContent: 'Excelente. Agora que você estruturou a base, lembre-se: redes sociais para negócios são ferramentas de balanço financeiro, não de ego. O próximo passo é a prova real.',
        minChars: 300,
        xpValue: 1500
      }
    ]
  },
  {
    id: 'tr_gt',
    trailId: 'trafego',
    title: 'GESTOR DE TRÁFEGO PAGO',
    icon: 'fa-bullseye',
    description: 'A ciência de comprar atenção qualificada e ler indicadores de performance.',
    lessons: [
      {
        id: 'gt_l1',
        title: 'MÉTRICAS DE FUNIL E ROAS',
        theory: `O tráfego pago não é "apertar botão", é gerir capital. As métricas principais seguem o funil: CTR (interesse no anúncio), CPC (eficiência do leilão), e ROAS (Retorno sobre Gasto em Anúncios). \n\nUm ROAS de 5.0 significa que para cada R$ 1,00 investido, retornaram R$ 5,00. Se o CTR está alto (ex: >2%) mas a conversão está zerada, o problema não é o anúncio, é a oferta ou a página de destino (Landing Page).`,
        minReadSeconds: 60,
        quiz: {
          question: 'Se um cliente investe R$ 1.000 e vende R$ 3.000, qual é o seu ROAS?',
          options: [
            'ROAS 1.0',
            'ROAS 30.0',
            'ROAS 3.0',
            'ROAS 0.3'
          ],
          correctIndex: 2,
          explanation: 'Vendas (3000) divididas por Investimento (1000) = 3.0.'
        },
        challenge: 'Um cliente de estética tem CTR de 3% e CPC de R$ 0,50, mas ninguém chama no WhatsApp. Analise tecnicamente o que pode estar ocorrendo e sugira 2 melhorias estruturais.',
        reviewContent: 'Análise concluída. Lembre-se que o gestor de tráfego é um cientista de dados aplicado ao consumo. Sua responsabilidade é com o ROI do cliente.',
        minChars: 350,
        xpValue: 2000
      }
    ]
  },
  {
    id: 'tr_ev',
    trailId: 'video',
    title: 'EDITOR DE VÍDEO MOBILE',
    icon: 'fa-video',
    description: 'Storytelling curto aplicado a anúncios e Reels que retêm atenção.',
    lessons: [
      {
        id: 'ev_l1',
        title: 'A REGRA DOS 3 SEGUNDOS',
        theory: `Em vídeos curtos (Reels/TikTok), a batalha é perdida nos primeiros 3 segundos. Chamamos isso de "Hook" (Gancho). Sem um gancho visual ou sonoro potente, o usuário desliza. \n\nA estrutura profissional de um vídeo de venda curto é: Gancho (0-3s) -> Problema (3-10s) -> Solução/Produto (10-25s) -> CTA (Chamada para Ação). A edição deve servir à narrativa, não apenas ser "bonita".`,
        minReadSeconds: 40,
        quiz: {
          question: 'Qual o objetivo principal do "Hook" em um vídeo para redes sociais?',
          options: [
            'Aparecer os créditos do editor.',
            'Interromper o scroll infinito e reter a atenção inicial.',
            'Mostrar o preço do produto imediatamente.',
            'Pedir para o usuário seguir a página antes de ver o conteúdo.'
          ],
          correctIndex: 1,
          explanation: 'O gancho serve para "pescar" a atenção do usuário no meio de milhares de estímulos.'
        },
        challenge: 'Descreva um roteiro de 15 segundos para um anúncio de "Lanche Artesanal". Defina exatamente qual será o Gancho visual e qual será o CTA final.',
        reviewContent: 'Ótimo. O ritmo é o coração da edição. Agora vamos para a validação prática onde você precisará produzir esse material.',
        minChars: 250,
        xpValue: 1800
      }
    ]
  },
  {
    id: 'tr_ds',
    trailId: 'design',
    title: 'DESIGNER DIGITAL PRO',
    icon: 'fa-palette',
    description: 'Fundamentos de design, hierarquia visual e criação de ativos para negócios.',
    lessons: [
      {
        id: 'ds_l1',
        title: 'HIERARQUIA E CONTRASTE',
        theory: `Design para marketing não é "arte livre", é comunicação funcional. Os pilares são Hierarquia (o que o olho vê primeiro) e Contraste (legibilidade). \n\nUm erro comum é usar fontes decorativas em textos longos ou cores de fundo que "matam" a leitura. A regra de ouro é: Informação Principal deve ser a maior e com mais contraste. O design deve guiar o olhar do cliente para o objetivo final: a conversão.`,
        minReadSeconds: 45,
        quiz: {
          question: 'O que define uma boa Hierarquia Visual em um post de venda?',
          options: [
            'Usar o máximo de cores possíveis.',
            'Colocar todas as informações com o mesmo tamanho de fonte.',
            'Organizar os elementos para que o olhar siga uma ordem lógica (Título > Imagem > CTA).',
            'Esconder o preço para o cliente ter que perguntar.'
          ],
          correctIndex: 2,
          explanation: 'A hierarquia guia o cérebro do cliente na ordem de importância das informações.'
        },
        challenge: 'Imagine um post de "Promoção de Inauguração". Descreva como você organizaria a Hierarquia Visual entre Título, Data, Local e Botão de Ação.',
        reviewContent: 'Design é sobre resolver problemas, não sobre decorar. Sua base conceitual está sólida.',
        minChars: 300,
        xpValue: 1600
      }
    ]
  }
];
