
import { Track } from './types.ts';

export interface MuralItem {
  id: string;
  type: 'AVISO' | 'DICA' | 'EVENTO' | 'MEI' | 'INSTITUCIONAL' | 'VAGAS' | 'CURSO';
  title: string;
  content: string;
  date: string;
  icon: string;
  links?: { label: string; url: string; icon: string }[];
}

export const MANIFESTO_TEXT = `Desenvolvido pela equipe do Instituto Guia Social, a GUI.A DIGITAL é o sistema operacional da sua carreira. 
Nascemos no coração do Recife para provar que a tecnologia social e a inteligência artificial são ferramentas de soberania. 
Não estamos aqui para criar apenas "usuários", estamos aqui para forjar Talentos da Periferia que dominam o mercado digital. 
Nosso código é ética, nosso motor é o corre e nosso objetivo é o seu impacto. 
Aqui, o aprendizado vira ativo, a prática vira portfólio e o talento vira nota fiscal.`;

export const MURAL_ITEMS: MuralItem[] = [
  {
    id: 'm-inst',
    type: 'INSTITUCIONAL',
    title: 'INSTITUTO GUIA SOCIAL',
    content: 'Tecnologia social focada em reduzir o abismo digital e transformar o talento da periferia em força de elite para o mercado.',
    date: 'Suporte Ativo',
    icon: 'fa-hand-holding-heart',
    links: [
      { label: 'Web', url: 'https://www.institutoguiasocial.org', icon: 'fa-globe' },
      { label: 'Insta', url: 'https://www.instagram.com/institutoguiasocial', icon: 'fa-brands fa-instagram' },
      { label: 'Email', url: 'mailto:institutoguiasocial@gmail.com', icon: 'fa-envelope' },
      { label: 'Zap', url: 'https://wa.me/5581991828743', icon: 'fa-brands fa-whatsapp' }
    ]
  },
  {
    id: 'm-cursos-go',
    type: 'CURSO',
    title: '+ CAPACITAÇÕES ON LINE',
    content: 'Acesse o portal GO Recife e turbine seu currículo com cursos gratuitos e certificados pela prefeitura.',
    date: 'Educação Continuada',
    icon: 'fa-graduation-cap',
    links: [
      { label: 'Ver Cursos', url: 'https://gorecife.recife.pe.gov.br/cursos', icon: 'fa-up-right-from-square' }
    ]
  },
  {
    id: 'm-vagas-go',
    type: 'VAGAS',
    title: 'SE LIGA NAS VAGAS - GO RECIFE',
    content: 'Oportunidades reais de emprego e estágio te esperando no Hub GO Recife. Não deixa passar!',
    date: 'Mercado Aberto',
    icon: 'fa-briefcase',
    links: [
      { label: 'Painel de Vagas', url: 'https://gorecife.recife.pe.gov.br/oportunidades', icon: 'fa-magnifying-glass-chart' }
    ]
  },
  {
    id: 'm-mei',
    type: 'MEI',
    title: 'PROFISSIONALIZE SEU CORRE (MEI)',
    content: 'Para emitir nota fiscal e fechar com grandes empresas, você precisa ser MEI. É rápido, barato e garante seus direitos.',
    date: 'Dica Técnica',
    icon: 'fa-id-card'
  }
];

export const TRACKS: Track[] = [
  {
    id: 'social-media',
    title: 'Social Media',
    description: 'Transforme redes sociais em canais de venda para negócios locais.',
    icon: '📱',
    lessons: [
      {
        id: 'sm-1',
        title: '🔰 Iniciante: O Perfil que Vende',
        category: 'SOCIAL MEDIA',
        theoryContent: `Vamos por partes. O Instagram de um negócio é a vitrine dele.\n\nO QUE VOCÊ VAI APRENDER:\n1. Bio Profissional: Nome claro, o que faz, onde fica e link de Zap.\n2. Foto de Perfil: Logo legível ou foto do dono sorrindo.\n3. Destaques: Organize os preços, horários e depoimentos.\n\nPOR QUE ISSO IMPORTA:\nSe o cliente entra e não entende como compra ou onde fica, ele vai embora em 3 segundos.`,
        clientBriefing: "Um brechó de bairro quer profissionalizar o Instagram. Organize a Bio deles e sugira 3 destaques fundamentais.",
        quiz: {
          question: "Qual o elemento MAIS importante na bio de um negócio local?",
          options: [
            "Uma frase em inglês",
            "O link direto para o WhatsApp de vendas",
            "Muitos emojis coloridos"
          ],
          answer: 1,
          explanation: "O link de Zap encurta o caminho do cliente. Facilidade gera venda!"
        },
        practicePrompt: "Escreva a bio e os temas dos destaques.",
        submissionPrompt: "Bio e Estrutura de Destaques",
        competency: 'Estrategia'
      },
      {
        id: 'sm-2',
        title: '⚙️ Intermediário: Planejamento de 7 Dias',
        category: 'SOCIAL MEDIA',
        theoryContent: `Um passo por vez. Planejar evita que você fique sem ideia no meio da semana.\n\nCONTEÚDO PARA NEGÓCIO REAL:\n- Segunda: Bastidores (O corre começando).\n- Quarta: Dica útil (Ex: Como cuidar da peça do brechó).\n- Sexta: Oferta direta (Foto bonita do produto + Preço).\n\nÉTICA DIGITAL:\nNunca use robôs para ganhar seguidores. Isso estraga a conta e o cliente perde dinheiro com seguidores falsos que não compram nada.`,
        clientBriefing: "Monte um calendário de 7 dias para uma marmitaria que entrega apenas no almoço.",
        quiz: {
          question: "O que postar na sexta-feira para um negócio de comida?",
          options: [
            "Um meme de gatinho",
            "A oferta especial do final de semana com call to action claro",
            "A história da fundação da empresa"
          ],
          answer: 1,
          explanation: "Sexta é dia de fome e decisão de compra. Vá direto ao ponto!"
        },
        practicePrompt: "Escreva o que postar em cada um dos 7 dias.",
        submissionPrompt: "Calendário Semanal",
        competency: 'Escrita'
      },
      {
        id: 'sm-3',
        title: '🚀 Avançado: Ganhe com Ética',
        category: 'SOCIAL MEDIA',
        theoryContent: `Você não precisa saber tudo agora, mas precisa saber quanto cobrar.\n\nCONVERTER EM RENDA:\n1. Comece oferecendo gestão para 1 cliente (Ex: 3 posts por semana).\n2. Preço sugerido: R$ 150 a R$ 250 por mês para começar.\n3. Mostre os resultados (mais gente chamando no Zap).\n\nMENSAGEM PARA O CLIENTE:\n'Oi! Vi que seu perfil tá parado. Posso te ajudar a organizar 3 posts por semana por R$ 200/mês? Isso vai trazer mais clientes pro seu Zap.'`,
        clientBriefing: "Monte sua própria proposta de serviço de Social Media para oferecer a um comércio do seu bairro.",
        quiz: {
          question: "Como medir se o seu trabalho de Social Media está funcionando?",
          options: [
            "Pelo número de curtidas apenas",
            "Pelo aumento de pedidos e contatos reais no WhatsApp do cliente",
            "Pela cor do layout"
          ],
          answer: 1,
          explanation: "Curtida não paga conta. O que importa para o pequeno negócio é o dinheiro entrando."
        },
        practicePrompt: "Descreva seu pacote de serviços e preço.",
        submissionPrompt: "Minha Proposta Comercial",
        competency: 'Analise'
      }
    ]
  },
  {
    id: 'designer-digital',
    title: 'Designer Digital',
    description: 'Crie artes profissionais usando apenas o celular.',
    icon: '🎨',
    lessons: [
      {
        id: 'dd-1',
        title: '🔰 Iniciante: Alinhamento e Cores',
        category: 'DESIGN',
        theoryContent: `Design não é enfeite, é organização.\n\nPASSO A PASSO:\n1. Alinhamento: Tudo deve seguir uma linha (ex: tudo à esquerda).\n2. Contraste: Texto escuro em fundo claro ou vice-versa. Nunca coloque texto difícil de ler.\n3. Cores: Escolha 2 cores principais e use sempre as mesmas.\n\nFERRAMENTA:\nUse o Canva ou Photopea no navegador do celular.`,
        clientBriefing: "Crie uma arte de 'Promoção Relâmpago' para uma barbearia usando preto e dourado.",
        quiz: {
          question: "Qual o erro fatal de um iniciante no design?",
          options: [
            "Usar fontes grandes demais",
            "Colocar muitas fontes e cores diferentes na mesma arte, dificultando a leitura",
            "Deixar espaços vazios na arte"
          ],
          answer: 1,
          explanation: "Muita informação confunde o cérebro. Limpeza é profissionalismo!"
        },
        practicePrompt: "Descreva as cores e fontes que usaria na arte da barbearia.",
        submissionPrompt: "Definição Visual da Arte",
        competency: 'Design'
      },
      {
        id: 'dd-2',
        title: '⚙️ Intermediário: Kit Visual do Bairro',
        category: 'DESIGN',
        theoryContent: `Um passo por vez. Agora vamos criar um Kit completo.\n\nO QUE COMPÕE UM KIT:\n1. Foto de perfil (Logo).\n2. Template para posts de aviso.\n3. Template para fotos de produtos.\n\nÉTICA E SEGURANÇA:\nNunca pegue fotos do Google sem saber se pode usar. Use sites como Pexels ou Unsplash para fotos gratuitas e bonitas.`,
        clientBriefing: "Monte um kit visual (cores e estilo) para uma loja de açaí que quer parecer moderna e refrescante.",
        quiz: {
          question: "Para que serve um template?",
          options: [
            "Para a arte ficar sempre igual e chata",
            "Para agilizar a criação e manter a identidade visual da marca sempre profissional",
            "Para economizar bateria do celular"
          ],
          answer: 1,
          explanation: "Templates economizam tempo e criam reconhecimento de marca."
        },
        practicePrompt: "Escolha 3 cores e o estilo de 2 fontes para o açaí.",
        submissionPrompt: "Guia de Estilo da Marca",
        competency: 'Tecnica'
      },
      {
        id: 'dd-3',
        title: '🚀 Avançado: Portfólio e Entrega',
        category: 'DESIGN',
        theoryContent: `Sua habilidade já pode virar uma oportunidade.\n\nCOMO GANHAR DINHEIRO:\n1. Venda o 'Kit de 5 Artes' por R$ 60 - R$ 100.\n2. Ofereça 'Cartão de Visita Digital' com link clicável por R$ 40.\n3. Monte seu portfólio no próprio Instagram ou numa pasta do Google Drive.\n\nCONSELHO DO GUI.A:\n'Não espere ser perfeito para começar. O feito com ética é melhor que o perfeito nunca postado.'`,
        clientBriefing: "Crie seu 'Cardápio de Serviços de Design'. O que você faz e quanto custa?",
        quiz: {
          question: "O que é um portfólio?",
          options: [
            "Uma lista de contatos",
            "Uma amostra dos seus melhores trabalhos para mostrar aos clientes",
            "Um certificado de faculdade"
          ],
          answer: 1,
          explanation: "O cliente compra o que ele vê. Mostre do que você é capaz!"
        },
        practicePrompt: "Liste 3 serviços de design e seus preços iniciais.",
        submissionPrompt: "Tabela de Preços e Serviços",
        competency: 'Tecnica'
      }
    ]
  },
  {
    id: 'editor-video',
    title: 'Editor de Vídeo',
    description: 'Crie vídeos curtos que prendem a atenção e geram cliques.',
    icon: '🎬',
    lessons: [
      {
        id: 'ev-1',
        title: '🔰 Iniciante: Corte e Legenda',
        category: 'VÍDEO',
        theoryContent: `Vídeo bom é vídeo que não enrola.\n\nPASSO A PASSO NO CELULAR:\n1. Cortes: Retire todos os 'eeeerrrr' e silêncios chatos.\n2. Legendas: No CapCut, use as legendas automáticas. Muita gente vê vídeo sem som.\n3. Formato: Sempre na vertical (9:16) para Reels e TikTok.`,
        clientBriefing: "Edite um vídeo de 15 segundos de um barbeiro fazendo um degradê. Onde você faria os cortes?",
        quiz: {
          question: "Por que legendar vídeos é fundamental?",
          options: [
            "Porque as letras são bonitas",
            "Porque garante que quem está no ônibus sem fone entenda a mensagem",
            "Para esconder erros na imagem"
          ],
          answer: 1,
          explanation: "Acessibilidade e conveniência aumentam as visualizações em até 40%!"
        },
        practicePrompt: "Descreva o plano de edição (onde corta, onde legenda).",
        submissionPrompt: "Plano de Edição Simples",
        competency: 'Audiovisual'
      },
      {
        id: 'ev-2',
        title: '⚙️ Intermediário: O Gancho (Hook)',
        category: 'VÍDEO',
        theoryContent: `Atenção é moeda. Se não prender nos primeiros 3 segundos, o vídeo morreu.\n\nTÉCNICAS DE RETENÇÃO:\n- Comece com uma pergunta: 'Você sabia que...' ou 'O erro que você comete...'.\n- Use transições rápidas.\n- Coloque uma música que combine com o ritmo da edição.`,
        clientBriefing: "Crie um roteiro de 10 segundos para um vídeo de 'Unboxing' (abrindo o pacote) de uma loja de doces.",
        quiz: {
          question: "O que é o 'Gancho' de um vídeo?",
          options: [
            "O final onde você pede para seguir",
            "Os primeiros segundos que prendem a atenção do usuário",
            "A música que toca no fundo"
          ],
          answer: 1,
          explanation: "Sem um bom gancho, as pessoas continuam deslizando a tela."
        },
        practicePrompt: "Escreva a frase inicial do vídeo de doces.",
        submissionPrompt: "Roteiro de Retenção",
        competency: 'Audiovisual'
      },
      {
        id: 'ev-3',
        title: '🚀 Avançado: Pacote de Vídeos',
        category: 'VÍDEO',
        theoryContent: `Vamos transformar edição em renda honesta.\n\nCOMO VENDER:\n1. Ofereça '4 Reels editados por mês' por R$ 200 - R$ 400.\n2. Grave o vídeo pro cliente (opcional) ou edite o que ele já tem.\n3. Foco em Storytelling: Conte a história de como o produto é feito.\n\nÉTICA:\nRespeite a privacidade do cliente e nunca use músicas com direitos autorais em anúncios pagos.`,
        clientBriefing: "Monte uma proposta de 'Pacote de Vídeos Mensais' para uma academia de artes marciais.",
        quiz: {
          question: "Qual o valor médio inicial para editar um Reels simples de 30 segundos?",
          options: [
            "R$ 5",
            "R$ 40 a R$ 80",
            "R$ 1.000"
          ],
          answer: 1,
          explanation: "Um valor justo valoriza seu tempo e cabe no bolso do pequeno empreendedor."
        },
        practicePrompt: "Descreva o que viria no seu pacote mensal de vídeos.",
        submissionPrompt: "Minha Oferta de Edição",
        competency: 'Audiovisual'
      }
    ]
  },
  {
    id: 'trafego-pago',
    title: 'Gestor de Tráfego',
    description: 'Aprenda a fazer anúncios básicos que levam clientes até a porta.',
    icon: '🚀',
    lessons: [
      {
        id: 'tp-1',
        title: '🔰 Iniciante: O Botão Turbinar',
        category: 'TRÁFEGO',
        theoryContent: `Anúncio é como um panfleto digital, mas só entrega para quem quer comprar.\n\nPASSO A PASSO:\n1. Botão Turbinar: O jeito mais simples de começar no Instagram.\n2. Localização: Escolha apenas o seu bairro ou um raio de 3km.\n3. Orçamento: Comece com pouco, R$ 6 a R$ 10 por dia.`,
        clientBriefing: "Uma pizzaria quer anunciar apenas para o bairro de Casa Amarela. Como você configuraria o público?",
        quiz: {
          question: "Qual a vantagem de anunciar apenas no bairro?",
          options: [
            "Ficar famoso na cidade toda",
            "Não desperdiçar dinheiro com pessoas que moram longe e não podem comprar",
            "Ganhar mais curtidas de outros países"
          ],
          answer: 1,
          explanation: "Para negócios locais, o foco é a vizinhança. Economia de dinheiro e mais vendas!"
        },
        practicePrompt: "Defina o bairro e o valor diário sugerido.",
        submissionPrompt: "Configuração de Anúncio Local",
        competency: 'Analise'
      },
      {
        id: 'tp-2',
        title: '⚙️ Intermediário: Interesses e Públicos',
        category: 'TRÁFEGO',
        theoryContent: `Um passo por vez. Agora vamos escolher para QUEM mostrar.\n\nSEGMENTAÇÃO:\n- Se vende hambúrguer, escolha interesses como 'Fast Food', 'Hambúrguer', 'iFood'.\n- Se vende roupa feminina, escolha 'Moda Feminina', 'Compras'.\n\nÉTICA NO TRÁFEGO:\nNunca prometa resultados garantidos ou ganhos rápidos. Anúncio é teste. Seja honesto com o cliente.`,
        clientBriefing: "Configure o público de interesses para um anúncio de um curso de trancista presencial.",
        quiz: {
          question: "O que acontece se o público for muito genérico (ex: Brasil inteiro)?",
          options: [
            "Você vende muito mais",
            "Você gasta o dinheiro do cliente e não atrai quem realmente pode ir à loja",
            "O anúncio fica mais barato"
          ],
          answer: 1,
          explanation: "Público qualificado é melhor que público grande."
        },
        practicePrompt: "Liste 3 interesses que combinam com o curso de trancista.",
        submissionPrompt: "Definição de Público Alvo",
        competency: 'Estrategia'
      },
      {
        id: 'tp-3',
        title: '🚀 Avançado: Gestão de Clientes',
        category: 'TRÁFEGO',
        theoryContent: `Hora de profissionalizar o corre do tráfego.\n\nCOMO TRABALHAR:\n1. O cliente paga o anúncio direto para o Instagram.\n2. Você cobra uma 'Taxa de Gestão' para configurar e acompanhar.\n3. Taxa sugerida inicial: R$ 200 a R$ 400 por mês por cliente.\n\nREGRA DO GUI.A:\n'Invista pouco, teste, ajuste e aprenda. O dinheiro do cliente é sagrado.'`,
        clientBriefing: "O cliente tem R$ 300 para gastar no mês em anúncios. Como você dividiria esse valor?",
        quiz: {
          question: "Qual a função principal do Gestor de Tráfego?",
          options: [
            "Postar fotos bonitas",
            "Acompanhar os números dos anúncios e ajustar para o cliente vender mais gastando menos",
            "Responder os comentários dos posts"
          ],
          answer: 1,
          explanation: "Gestão é análise. Olhar o que está funcionando e o que não está."
        },
        practicePrompt: "Descreva seu plano de investimento e sua taxa de trabalho.",
        submissionPrompt: "Plano de Gestão de Tráfego",
        competency: 'Analise'
      }
    ]
  }
];
