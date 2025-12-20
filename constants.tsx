
import { Module, Opportunity } from './types';

export const MODULES: Module[] = [
  { 
    id: '1', 
    title: 'Engenharia de Maps Elite', 
    progress: 0, 
    status: 'current',
    technicalSkill: 'Especialista em SEO Local',
    description: 'Domine o algoritmo de proximidade e coloque clientes no topo das buscas em 15 dias.', 
    icon: 'fa-location-crosshairs', 
    xpValue: 1200,
    lessons: [
      {
        id: 'l1',
        title: 'PAD e Relevância de Categoria',
        duration: '25m',
        content: 'O Google pune variações de Nome, Endereço e Telefone (PAD). Aprenda a técnica de "Silo de Categoria" - como usar as 10 subcategorias permitidas para dominar buscas por termos vizinhos.',
        xpValue: 400,
        checklist: [
          'Padronizar Nome, Endereço e Telefone em 10 diretórios locais',
          'Mapear 10 subcategorias ocultas do nicho',
          'Configurar Área de Serviço por CEP estratégico'
        ]
      },
      {
        id: 'l2',
        title: 'Geotagueamento de Fotos',
        duration: '20m',
        content: 'Fotos não são apenas estéticas. Aprenda a injetar coordenadas GPS nas imagens antes do upload para provar ao Google que o negócio é real.',
        xpValue: 400,
        checklist: [
          'Processar 10 fotos reais com coordenadas GPS',
          'Renomear arquivos com [Bairro] + [Serviço] + [Marca]',
          'Upload de foto de fachada 360º'
        ]
      },
      {
        id: 'l3',
        title: 'Estratégia de Avaliações',
        duration: '30m',
        content: 'Reviews vazios não ajudam. Aprenda o roteiro para fazer o cliente citar a palavra-chave e o bairro na avaliação.',
        xpValue: 400,
        checklist: [
          'Criar QR Code para o formulário de 5 estrelas',
          'Treinar o dono para pedir avaliação no fechamento',
          'Responder reviews com palavras-chave estratégicas'
        ]
      }
    ]
  },
  { 
    id: '2', 
    title: 'Anúncios de Bairro (Ads)', 
    progress: 0, 
    status: 'locked',
    technicalSkill: 'Tráfego Hiper-Local',
    description: 'Como dominar as ruas ao redor do comércio usando o orçamento de um cafezinho por dia.', 
    icon: 'fa-radar', 
    xpValue: 1500,
    lessons: [
      {
        id: 'l4',
        title: 'Raio de 1KM: O Tiro de Elite',
        duration: '30m',
        content: 'Configuração de anúncios para negócios físicos. Aprenda a excluir o resto da cidade e focar apenas nas ruas que cercam o comércio.',
        xpValue: 750,
        checklist: [
          'Pino fixo com raio de 1.5km no Gerenciador',
          'Criativo em vídeo chegando na loja',
          'Botão de "Como Chegar" e "WhatsApp"'
        ]
      }
    ]
  },
  { 
    id: '3', 
    title: 'Consultoria Mensal', 
    progress: 0, 
    status: 'locked',
    technicalSkill: 'Gestão de Faturamento',
    description: 'Transforme o serviço em um salário mensal garantido com contratos recorrentes.', 
    icon: 'fa-sack-dollar', 
    xpValue: 2000,
    lessons: [
      {
        id: 'l6',
        title: 'Modelo de Taxa Mensal',
        duration: '40m',
        content: 'Não venda apenas a configuração, venda a manutenção do ranking e gestão de novos clientes.',
        xpValue: 2000,
        checklist: [
          'Apresentação de Relatório de Chamadas e Rotas',
          'Contrato de 6 meses com renovação',
          'Script: Custo de Aquisição vs Lucro Real'
        ]
      }
    ]
  },
  {
    id: '4',
    title: 'Textos que Vendem (Copy)',
    progress: 0,
    status: 'locked',
    technicalSkill: 'Redator de Resposta Direta',
    description: 'Aprenda a transformar palavras em dinheiro e desejos em ações imediatas no bairro.',
    icon: 'fa-comment-dots',
    xpValue: 1800,
    lessons: [
      {
        id: 'l7',
        title: 'Princípios da Escrita Persuasiva',
        duration: '30m',
        content: 'O foco não é o produto, é o problema que ele resolve no dia a dia das pessoas.',
        xpValue: 900,
        checklist: [
          'Mapear a dor principal do cliente local',
          'Listar 5 benefícios reais do serviço',
          'Aplicar a regra do "Fale com o Vizinho"'
        ]
      }
    ]
  }
];

export const OPPORTUNITIES: Opportunity[] = [
  { id: '1', businessName: 'Padaria da Vila', title: 'Configuração de Google Maps', location: 'Bairro Novo', lat: -8.0772, lng: -34.9126, type: 'freelance', reward: 'R$ 650', matchingScore: 95 },
  { id: '2', businessName: 'Clínica Sorriso', title: 'Anúncios e Reputação Local', location: 'Centro', lat: -8.1268, lng: -34.9015, type: 'pj', reward: 'R$ 1.200/mês', matchingScore: 82 },
  { id: '3', businessName: 'Barbearia do Corte', title: 'Otimização de Perfil Digital', location: 'Ipsep', lat: -8.1123, lng: -34.9190, type: 'freelance', reward: 'R$ 400', matchingScore: 90 },
];
