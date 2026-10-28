export interface IncaTip {
  id: number;
  category: string;
  emoji: string;
  title: string;
  fact: string;
  source: string;
}

export const INCA_PREVENTION_TIPS: IncaTip[] = [
  {
    id: 1,
    category: 'Estilo de Vida',
    emoji: '🌱',
    title: 'Prevenção Ativa',
    fact: 'De 30% a 50% dos casos de câncer podem ser prevenidos com hábitos saudáveis, como boa alimentação, exercícios e cessação do tabagismo.',
    source: '21 Fatos sobre o Câncer — INCA',
  },
  {
    id: 2,
    category: 'Tabagismo',
    emoji: '🚭',
    title: 'Fumo e Múltiplos Órgãos',
    fact: 'O tabagismo não agride só os pulmões. Ele é fator de risco comprovado para câncer de boca, laringe, faringe, esôfago, bexiga e pâncreas.',
    source: 'Publicação Fatores de Risco — INCA',
  },
  {
    id: 3,
    category: 'Alimentação',
    emoji: '🥗',
    title: 'Prato Colorido e In Natura',
    fact: 'Consumir ao menos 400g diários de frutas, legumes e verduras fornece fitoquímicos e fibras que protegem as células contra danos oxidativos.',
    source: 'Relatório Dieta e Câncer — INCA/WCRF',
  },
  {
    id: 4,
    category: 'Alimentação',
    emoji: '🥓',
    title: 'Cuidado com Carnes Processadas',
    fact: 'Evitar alimentos como salsicha, bacon, presunto e salame diminui diretamente a formação de compostos carcinogênicos no intestino.',
    source: 'Diretrizes Nutricionais — INCA',
  },
  {
    id: 5,
    category: 'Proteção Solar',
    emoji: '☀️',
    title: 'Sol com Responsabilidade',
    fact: 'A radiação UV danifica o DNA das células da pele de forma cumulativa. Evite o sol das 10h às 16h e use protetor solar mesmo em dias nublados.',
    source: '21 Fatos sobre o Câncer — INCA',
  },
  {
    id: 6,
    category: 'Atividade Física',
    emoji: '🏃',
    title: 'Corpo em Movimento',
    fact: '150 minutos de exercícios moderados por semana ajudam no controle do peso e na modulação hormonal, prevenindo câncer de mama e cólon.',
    source: 'Relatório Atividade Física — INCA',
  },
  {
    id: 7,
    category: 'Álcool',
    emoji: '🍷',
    title: 'Bebidas Alcoólicas',
    fact: 'Qualquer quantidade de bebida alcoólica eleva o risco de tumores de cabeça, pescoço, esôfago, fígado, intestino e mama.',
    source: 'Fatores de Risco — INCA',
  },
  {
    id: 8,
    category: 'Genética',
    emoji: '🧬',
    title: 'Hereditariedade em Perspectiva',
    fact: 'Apenas 5% a 10% dos cânceres decorrem exclusivamente de mutações hereditárias. A grande maioria está ligada a fatores do ambiente e do dia a dia.',
    source: '21 Fatos sobre o Câncer — INCA',
  },
  {
    id: 9,
    category: 'Mitos e Verdades',
    emoji: '📡',
    title: 'Micro-ondas e Radiação',
    fact: 'Fornos micro-ondas usam radiação não ionizante (térmica) e não alteram o DNA dos alimentos ou do corpo humano quando em bom estado.',
    source: 'Mitos sobre o Câncer — INCA',
  },
  {
    id: 10,
    category: 'Vacinação',
    emoji: '💉',
    title: 'Vacina contra HPV e Hepatite B',
    fact: 'A vacina contra o HPV previne mais de 90% dos casos de câncer de colo do útero e orofaringe, e está disponível gratuitamente no SUS.',
    source: 'Ministério da Saúde / INCA',
  },
  {
    id: 11,
    category: 'Maternidade',
    emoji: '🤱',
    title: 'Amamentação Protetora',
    fact: 'O aleitamento materno reduz o risco de a mãe desenvolver câncer de mama e ajuda a criança a evitar a obesidade no futuro.',
    source: 'Relatório WCRF / INCA',
  },
  {
    id: 12,
    category: 'Peso Corporal',
    emoji: '⚖️',
    title: 'Controle do Peso',
    fact: 'A gordura corporal em excesso mantém um estado inflamatório contínuo. Manter o peso adequado protege contra pelo menos 13 tipos de câncer.',
    source: 'Diretrizes de Prevenção — INCA',
  },
];

export function getRandomIncaTip(): IncaTip {
  const index = Math.floor(Math.random() * INCA_PREVENTION_TIPS.length);
  return INCA_PREVENTION_TIPS[index];
}
