
import { Module, Opportunity, IATool } from './types';

export const IA_TOOLS: IATool[] = [
  {
    id: 'copy-writer',
    name: 'Copywriter Ann Handley',
    description: 'Cria textos úteis e empáticos baseados no livro "Everybody Writes".',
    icon: 'fa-pen-nib',
    minLevel: 1,
    promptTemplate: 'Aja como Ann Handley. Crie um post para o Instagram de um pequeno negócio de {business_type} no bairro {neighborhood} em Recife. O texto deve ser útil, focar no cliente local e evitar jargões técnicos.'
  },
  {
    id: 'smart-planner',
    name: 'Mentor de Metas SMART',
    description: 'Transforma seus objetivos em planos de ação com prazos reais.',
    icon: 'fa-bullseye',
    minLevel: 2,
    promptTemplate: 'Analise este objetivo: {input}. Transforme-o em uma meta SMART (Específica, Mensurável, Alcançável, Relevante e com Prazo) para um jovem micro-consultor digital em Recife.'
  },
  {
    id: 'seo-optimizer',
    name: 'Analista de SEO Local',
    description: 'Sugere palavras-chave para negócios do bairro aparecerem no Google Maps.',
    icon: 'fa-location-crosshairs',
    minLevel: 3,
    promptTemplate: 'Sugira 5 palavras-chave estratégicas para um negócio de {input} ser encontrado no Google Maps por moradores do bairro {neighborhood} em Recife.'
  }
];

export const MODULES: Module[] = [
  { 
    id: '1', 
    title: 'Cidadania e Sociedade 4.0', 
    progress: 0, 
    status: 'current',
    technicalSkill: 'Ética Digital',
    description: 'Fundamentação teórica sobre Marketing Humano e Direitos Sociais no Brasil.', 
    icon: 'fa-handshake-angle', 
    xpValue: 2000,
    lessons: [
      {
        id: 'u1',
        title: 'Marketing 4.0: Humano no Centro',
        duration: '25m',
        theory: 'O Marketing 4.0 integra o digital ao humano. Em Recife, vemos isso quando uma padaria em Casa Forte usa o Instagram não só para vender, mas para criar comunidade. Philip Kotler ensina que as marcas agora devem ter "personalidade" e valores éticos claros.',
        challenge: 'Identifique um empreendimento no seu bairro que utiliza uma comunicação humanizada. Como eles interagem com a comunidade?',
        quiz: {
          question: 'No Marketing 4.0, qual o foco principal da relação marca-cliente?',
          options: ['Vender a qualquer custo', 'Humanização e conexão de valores', 'Automatização total por robôs', 'Apenas preços baixos'],
          correctIndex: 1,
          explanation: 'A conexão de valores e a humanização são os pilares da nova era do marketing.'
        },
        checklist: ['Estudar conceito de Kotler', 'Mapear 1 negócio local humanizado', 'Analisar valores da marca'],
        xpValue: 500
      },
      {
        id: 'u2',
        title: 'Dignidade e Direitos Digitais',
        duration: '30m',
        theory: 'O Estatuto da Juventude (Lei 12.852/2013) garante ao jovem o direito ao trabalho e à cultura. No mundo digital, isso se traduz em soberania de dados e acesso a ferramentas de produção de renda.',
        challenge: 'Leia os pontos principais do Estatuto da Juventude e relacione um direito com a sua futura atuação como consultor digital.',
        quiz: {
          question: 'Qual lei brasileira garante direitos específicos aos jovens de 15 a 29 anos?',
          options: ['Lei do Estágio', 'Estatuto da Juventude', 'Código Civil', 'Lei da Informática'],
          correctIndex: 1,
          explanation: 'O Estatuto da Juventude é a base legal para políticas públicas de mobilidade para jovens.'
        },
        checklist: ['Leitura da Lei 12.852', 'Reflexão sobre autonomia econômica'],
        xpValue: 500
      }
    ]
  },
  { 
    id: '2', 
    title: 'Engenharia de Projeto de Vida', 
    progress: 0, 
    status: 'locked',
    technicalSkill: 'Gestão Estratégica',
    description: 'Planejamento de carreira através do Ikigai e Metas SMART aplicadas.', 
    icon: 'fa-seedling', 
    xpValue: 1500,
    lessons: [
      {
        id: 'u5',
        title: 'O Ikigai do Consultor Local',
        duration: '35m',
        theory: 'Ikigai é um conceito japonês para "razão de ser". Para um jovem no Recife, pode ser unir sua habilidade em design com a necessidade de digitalizar o pequeno produtor de Bolo de Rolo do bairro.',
        challenge: 'Desenhe sua mandala Ikigai focada em como suas habilidades podem servir ao seu território.',
        quiz: {
          question: 'O Ikigai é a intersecção de quais pilares?',
          options: ['Paixão, Missão, Vocação e Profissão', 'Trabalho, Dinheiro, Casa e Carro', 'Fama, Sucesso, Poder e Renda', 'Estudo, Prova, Nota e Diploma'],
          correctIndex: 0,
          explanation: 'O Ikigai busca o equilíbrio entre o que você ama e o que o mundo precisa.'
        },
        checklist: ['Definir Paixão/Missão', 'Mapear Vocação Territorial', 'Validar pilar de Renda'],
        xpValue: 750
      }
    ]
  },
  { 
    id: '3', 
    title: 'Arquitetura de Marketing Digital', 
    progress: 0, 
    status: 'locked',
    technicalSkill: 'Technical Marketing',
    description: 'Domínio dos 4Ps, Funil de Vendas e o Círculo Dourado de Simon Sinek aplicado ao Recife.', 
    icon: 'fa-microchip', 
    xpValue: 4000,
    lessons: [
      {
        id: 'u6',
        title: 'O Círculo Dourado Territorial',
        duration: '40m',
        theory: 'Simon Sinek afirma: "Pessoas não compram o que você faz, elas compram o porquê você faz". Se você atende um negócio no Porto Digital, o porquê deles deve vibrar inovação. Se é em Afogados, deve vibrar resistência e serviço local.',
        challenge: 'Defina o "Porquê" de um negócio de serviços no seu bairro. Qual a dor real que eles curam na comunidade?',
        quiz: {
          question: 'Onde começa o Círculo Dourado de Simon Sinek?',
          options: ['No "O Quê"', 'No "Como"', 'No "Porquê"', 'No "Preço"'],
          correctIndex: 2,
          explanation: 'O propósito (Porquê) é a âncora de toda estratégia de marketing de alto nível.'
        },
        checklist: ['Identificar o núcleo do propósito', 'Diferenciar Como de O Quê'],
        xpValue: 1000
      },
      {
        id: 'u7',
        title: 'Branding e Estética de Bairro',
        duration: '45m',
        theory: 'Branding não é só logo. É a percepção. Em Recife, o movimento Armorial de Ariano Suassuna ensinou a usar elementos locais para criar algo universal. Como usar a cultura de Casa Amarela para valorizar um comércio local?',
        challenge: 'Crie uma paleta de cores e um conceito visual para uma marca do bairro baseando-se em elementos arquitetônicos ou culturais da vizinhança.',
        quiz: {
          question: 'Qual o objetivo principal do Branding Territorial?',
          options: ['Copiar marcas americanas', 'Valorizar a identidade local para gerar diferencial', 'Diminuir os preços dos produtos', 'Esconder a origem do negócio'],
          correctIndex: 1,
          explanation: 'Branding territorial usa a cultura local como ativo de valorização comercial.'
        },
        checklist: ['Estudo de cores locais', 'Definição de tom de voz', 'Análise de símbolos do bairro'],
        xpValue: 1000
      },
      {
        id: 'u8',
        title: 'SEO de Proximidade e Mapas',
        duration: '50m',
        theory: 'Para o pequeno negócio, ser achado no bairro é mais importante do que ser achado no mundo. O SEO Local foca em palavras-chave geográficas (ex: "Bolo de Rolo em Afogados"). O Google Meu Negócio é a ferramenta de poder aqui.',
        challenge: 'Mapeie as 5 principais palavras-chave que um morador do bairro usaria para achar um serviço de conserto de celulares na sua rua.',
        quiz: {
          question: 'Qual ferramenta é essencial para o SEO de proximidade?',
          options: ['Twitter Ads', 'Google Meu Negócio', 'TikTok', 'Painéis de Outdoor'],
          correctIndex: 1,
          explanation: 'O Google Meu Negócio coloca o comércio local no mapa físico e digital dos usuários.'
        },
        checklist: ['Mapear palavras-chave geográficas', 'Simular cadastro no GMN'],
        xpValue: 1000
      },
      {
        id: 'u9',
        title: 'Copywriting e Persuasão Ética',
        duration: '40m',
        theory: 'Copywriting é a arte de escrever para converter. Usando Ann Handley como guia, aprendemos que "todos escrevem". Gatilhos como Autoridade, Escassez e Prova Social devem ser usados com verdade e foco no benefício do vizinho.',
        challenge: 'Escreva um anúncio de 3 linhas para o WhatsApp de uma feira orgânica no bairro, usando o gatilho da Prova Social.',
        quiz: {
          question: 'Segundo Ann Handley, qual o segredo de uma boa escrita?',
          options: ['Usar palavras difíceis', 'Focar na utilidade e empatia com o leitor', 'Escrever o máximo possível', 'Focar apenas no preço'],
          correctIndex: 1,
          explanation: 'A escrita útil e empática cria confiança antes da venda.'
        },
        checklist: ['Exercício de gatilho mental', 'Revisão de texto empático'],
        xpValue: 1000
      }
    ]
  }
];

export const OPPORTUNITIES: Opportunity[] = [
  { id: '1', businessName: 'Artesanato do Cais', title: 'Consultoria Marketing 4.0', location: 'Recife Antigo', lat: -8.063, lng: -34.871, type: 'freelance', reward: 'R$ 450', requiredSkill: 'Marketing 4.0' },
  { id: '2', businessName: 'Bolo de Rolo da Maria', title: 'Otimização SEO Local', location: 'Afogados', lat: -8.077, lng: -34.908, type: 'pj', reward: 'R$ 600', requiredSkill: 'Growth' },
];
