import { Lesson } from "@/types/lesson";

export const lessonsPt: Lesson[] = [
  {
    id: "lesson-1",
    title: "O que é Criptomoeda?",
    module: "Fundamentos de Cripto",
    moduleNumber: 1,
    difficulty: "beginner",
    xpReward: 20,
    coinReward: 10,
    requiredLevel: 0,
    icon: "💎",
    questions: [
      {
        id: "q1-1",
        type: "multiple_choice",
        question: "O que é criptomoeda?",
        options: [
          "Moeda digital ou virtual usando criptografia",
          "Um tipo de cartão de crédito",
          "Moedas físicas feitas de ouro",
          "Dinheiro em papel emitido pelo governo",
        ],
        correctAnswer: 0,
        explanation:
          "Criptomoeda é uma moeda digital ou virtual que usa criptografia para segurança. Ao contrário das moedas tradicionais, ela opera independentemente de bancos centrais.",
      },
      {
        id: "q1-2",
        type: "true_false",
        question: "Criptomoedas são controladas por governos e bancos centrais.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! A maioria das criptomoedas é descentralizada, o que significa que não são controladas por nenhum governo ou autoridade central. Esta é uma de suas características principais.",
      },
      {
        id: "q1-3",
        type: "multiple_choice",
        question: "Que tecnologia alimenta a maioria das criptomoedas?",
        options: ["Computação em Nuvem", "Blockchain", "Inteligência Artificial", "Redes 5G"],
        correctAnswer: 1,
        explanation:
          "A tecnologia Blockchain é a base da maioria das criptomoedas. É um livro-razão distribuído que registra todas as transações em uma rede de computadores.",
        hint: "Pense em uma cadeia de blocos contendo dados de transação...",
      },
      {
        id: "q1-4",
        type: "multiple_choice",
        question: "Qual foi a primeira criptomoeda?",
        options: ["Ethereum", "Litecoin", "Bitcoin", "Ripple"],
        correctAnswer: 2,
        explanation:
          "Bitcoin, criado por Satoshi Nakamoto em 2009, foi a primeira criptomoeda. Ela revolucionou a moeda digital e inspirou milhares de alternativas.",
      },
      {
        id: "q1-5",
        type: "true_false",
        question: "Você pode segurar fisicamente uma criptomoeda como segura dinheiro.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! Criptomoedas são puramente digitais. Elas existem apenas como registros em uma blockchain e são armazenadas em carteiras digitais, não em forma física.",
      },
    ],
  },
  {
    id: "lesson-2",
    title: "Básico de Blockchain",
    module: "Fundamentos de Cripto",
    moduleNumber: 1,
    difficulty: "beginner",
    xpReward: 20,
    coinReward: 10,
    requiredLevel: 0,
    icon: "🔗",
    questions: [
      {
        id: "q2-1",
        type: "multiple_choice",
        question: "O que é uma blockchain?",
        options: [
          "Uma corrente usada como joia",
          "Um banco de dados distribuído de transações",
          "Um tipo de criptomoeda",
          "Uma ferramenta de mineração",
        ],
        correctAnswer: 1,
        explanation:
          "Uma blockchain é um banco de dados distribuído que mantém uma lista crescente de registros chamados blocos, que são vinculados e protegidos usando criptografia.",
      },
      {
        id: "q2-2",
        type: "true_false",
        question: "Uma vez que os dados são registrados em uma blockchain, eles podem ser facilmente alterados ou excluídos.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! Uma das principais características da blockchain é a imutabilidade. Uma vez que os dados são adicionados à blockchain, é extremamente difícil mudá-los, tornando-a segura e confiável.",
      },
      {
        id: "q2-3",
        type: "multiple_choice",
        question: "O que cada bloco em uma blockchain contém?",
        options: [
          "Apenas os dados de transação",
          "Dados de transação, carimbo de tempo e link para o bloco anterior",
          "Apenas um carimbo de tempo",
          "Apenas preços de criptomoedas",
        ],
        correctAnswer: 1,
        explanation:
          "Cada bloco contém dados de transação, um carimbo de tempo e um hash criptográfico do bloco anterior. Isso cria uma cadeia inquebrável.",
        hint: "Blocos são conectados como elos em uma cadeia...",
      },
      {
        id: "q2-4",
        type: "multiple_choice",
        question: "Quem mantém a rede blockchain?",
        options: [
          "Uma única empresa",
          "O governo",
          "Uma rede distribuída de computadores (nós)",
          "Apenas bancos",
        ],
        correctAnswer: 2,
        explanation:
          "Redes blockchain são mantidas por nós distribuídos (computadores) ao redor do mundo. Essa descentralização as torna resistentes ao controle ou desligamento.",
      },
      {
        id: "q2-5",
        type: "true_false",
        question: "A tecnologia blockchain só pode ser usada para criptomoedas.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! Embora a blockchain alimente criptomoedas, ela tem muitas outras aplicações, incluindo gestão de cadeia de suprimentos, registros de saúde, sistemas de votação e muito mais.",
      },
    ],
  },
  {
    id: "lesson-3",
    title: "Bitcoin 101",
    module: "Fundamentos de Cripto",
    moduleNumber: 1,
    difficulty: "beginner",
    xpReward: 20,
    coinReward: 10,
    requiredLevel: 0,
    icon: "₿",
    questions: [
      {
        id: "q3-1",
        type: "multiple_choice",
        question: "Quem criou o Bitcoin?",
        options: ["Elon Musk", "Satoshi Nakamoto", "Vitalik Buterin", "Bill Gates"],
        correctAnswer: 1,
        explanation:
          "Bitcoin foi criado por uma pessoa ou grupo anônimo usando o pseudônimo Satoshi Nakamoto. Sua verdadeira identidade permanece desconhecida até hoje.",
      },
      {
        id: "q3-2",
        type: "multiple_choice",
        question: "Qual é o fornecimento máximo de Bitcoin que existirá?",
        options: ["21 milhões", "100 milhões", "Ilimitado", "1 bilhão"],
        correctAnswer: 0,
        explanation:
          "Bitcoin tem um limite fixo de fornecimento de 21 milhões de moedas. Essa escassez está incorporada em seu protocolo e o torna potencialmente valioso como reserva de valor.",
        hint: "Pense em um número que torna o Bitcoin escasso...",
      },
      {
        id: "q3-3",
        type: "true_false",
        question: "As transações de Bitcoin são completamente anônimas.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! As transações de Bitcoin são pseudônimas, não anônimas. Todas as transações são registradas em um livro-razão público, embora estejam vinculadas a endereços em vez de nomes.",
      },
      {
        id: "q3-4",
        type: "multiple_choice",
        question: "O que é mineração de Bitcoin?",
        options: [
          "Cavar bitcoins físicos no subsolo",
          "Comprar bitcoins em uma loja",
          "Usar computadores para validar transações e proteger a rede",
          "Criar bitcoins falsos",
        ],
        correctAnswer: 2,
        explanation:
          "A mineração de Bitcoin é o processo de usar poder computacional para validar transações, proteger a rede e adicionar novos blocos à blockchain. Os mineradores são recompensados com novos bitcoins.",
      },
      {
        id: "q3-5",
        type: "true_false",
        question: "Você precisa comprar um Bitcoin inteiro para possuir qualquer Bitcoin.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! Bitcoin é divisível. A menor unidade é chamada de Satoshi (0,00000001 BTC). Você pode comprar qualquer fração de um Bitcoin que se ajuste ao seu orçamento.",
      },
    ],
  },
  {
    id: "lesson-4",
    title: "Carteiras Cripto",
    module: "Fundamentos de Cripto",
    moduleNumber: 1,
    difficulty: "beginner",
    xpReward: 20,
    coinReward: 10,
    requiredLevel: 1,
    icon: "👛",
    questions: [
      {
        id: "q4-1",
        type: "multiple_choice",
        question: "O que é uma carteira de criptomoeda?",
        options: [
          "Uma carteira de couro para guardar moedas",
          "Uma ferramenta digital que armazena suas chaves privadas",
          "Uma conta bancária para cripto",
          "Um pen drive físico",
        ],
        correctAnswer: 1,
        explanation:
          "Uma carteira de criptomoeda é uma ferramenta digital que armazena suas chaves privadas, permitindo que você envie e receba criptomoedas. Ela não armazena as moedas em si.",
      },
      {
        id: "q4-2",
        type: "multiple_choice",
        question: "Quais são os dois tipos principais de carteiras?",
        options: [
          "Grande e pequena",
          "Quente e fria",
          "Rápida e lenta",
          "Nova e velha",
        ],
        correctAnswer: 1,
        explanation:
          "Os dois tipos principais são carteiras quentes (conectadas à internet, convenientes mas menos seguras) e carteiras frias (armazenamento offline, mais seguras mas menos convenientes).",
        hint: "Pense em temperatura e conectividade com a internet...",
      },
      {
        id: "q4-3",
        type: "true_false",
        question: "Se você perder sua chave privada, pode entrar em contato com o suporte ao cliente para recuperá-la.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! Se você perder sua chave privada e não tiver um backup (frase de recuperação), sua cripto se foi para sempre. Ninguém pode recuperá-la para você - este é o preço da descentralização.",
      },
      {
        id: "q4-4",
        type: "multiple_choice",
        question: "Qual tipo de carteira é mais segura para armazenamento de longo prazo?",
        options: [
          "Aplicativo de carteira móvel",
          "Carteira de exchange",
          "Carteira de hardware (armazenamento frio)",
          "Carteira de extensão de navegador",
        ],
        correctAnswer: 2,
        explanation:
          "Carteiras de hardware (armazenamento frio) são as mais seguras para armazenamento de longo prazo porque mantêm suas chaves privadas offline, longe de hackers e malware.",
      },
      {
        id: "q4-5",
        type: "true_false",
        question: "Você deve compartilhar a chave privada da sua carteira com amigos confiáveis como backup.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! NUNCA compartilhe sua chave privada com ninguém. Qualquer pessoa com sua chave privada tem controle completo sobre sua cripto. Mantenha-a secreta e segura.",
      },
    ],
  },
  {
    id: "lesson-5",
    title: "Chaves Públicas vs Privadas",
    module: "Fundamentos de Cripto",
    moduleNumber: 1,
    difficulty: "beginner",
    xpReward: 20,
    coinReward: 10,
    requiredLevel: 1,
    icon: "🔐",
    questions: [
      {
        id: "q5-1",
        type: "multiple_choice",
        question: "O que é uma chave pública?",
        options: [
          "Uma senha secreta que você nunca compartilha",
          "Seu endereço de carteira que outros podem usar para lhe enviar cripto",
          "Uma chave para um banheiro público",
          "Seu número de conta bancária",
        ],
        correctAnswer: 1,
        explanation:
          "Uma chave pública é o endereço da sua carteira que você pode compartilhar com segurança com outras pessoas. É como seu endereço de e-mail - as pessoas precisam dele para lhe enviar coisas.",
      },
      {
        id: "q5-2",
        type: "multiple_choice",
        question: "O que é uma chave privada?",
        options: [
          "Uma senha que você pode compartilhar com a família",
          "Seu nome de usuário em exchanges de cripto",
          "Um código secreto que dá controle sobre sua cripto",
          "Um endereço público para receber cripto",
        ],
        correctAnswer: 2,
        explanation:
          "Uma chave privada é um código criptográfico secreto que lhe dá controle sobre sua criptomoeda. Deve ser mantida absolutamente secreta - qualquer pessoa com ela pode acessar seus fundos.",
        hint: "Pense sobre o que deve sempre permanecer privado e secreto...",
      },
      {
        id: "q5-3",
        type: "true_false",
        question: "Sua chave pública pode ser compartilhada com segurança com qualquer pessoa.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 0,
        explanation:
          "Verdadeiro! Sua chave pública (endereço de carteira) foi feita para ser compartilhada. É assim que outras pessoas enviam criptomoeda para você. Pense nela como seu endereço de e-mail.",
      },
      {
        id: "q5-4",
        type: "multiple_choice",
        question: "Qual analogia melhor descreve chaves públicas e privadas?",
        options: [
          "Nome de usuário e senha",
          "Endereço de e-mail e senha de e-mail",
          "Número de telefone e PIN de correio de voz",
          "Todas as anteriores",
        ],
        correctAnswer: 3,
        explanation:
          "Todas são boas analogias! A chave pública é o que outras pessoas usam para alcançá-lo (como endereço de e-mail), a chave privada é seu código de acesso secreto (como senha) que deve ser protegido.",
      },
      {
        id: "q5-5",
        type: "true_false",
        question: "Se alguém tiver sua chave pública, eles podem roubar sua criptomoeda.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! Ter sua chave pública só permite que alguém envie cripto para você ou visualize seu saldo. Eles precisam de sua chave privada para roubar ou mover seus fundos.",
      },
    ],
  },
  {
    id: "lesson-6",
    title: "Altcoins Explicadas",
    module: "Tipos de Criptomoedas",
    moduleNumber: 2,
    difficulty: "beginner",
    xpReward: 20,
    coinReward: 10,
    requiredLevel: 2,
    icon: "🪙",
    questions: [
      {
        id: "q6-1",
        type: "multiple_choice",
        question: "O que significa 'altcoin'?",
        options: [
          "Alternativa ao Bitcoin",
          "Moeda de alumínio",
          "Moeda de altitude",
          "Moeda alterada",
        ],
        correctAnswer: 0,
        explanation:
          "'Altcoin' é abreviação de 'moeda alternativa' - qualquer criptomoeda que não seja Bitcoin. Existem milhares de altcoins com diferentes recursos e propósitos.",
      },
      {
        id: "q6-2",
        type: "multiple_choice",
        question: "Qual destas é uma altcoin popular?",
        options: ["Dólar", "Ethereum", "Euro", "Iene"],
        correctAnswer: 1,
        explanation:
          "Ethereum é uma das altcoins mais populares. Foi criada para habilitar contratos inteligentes e aplicações descentralizadas, indo além do foco de pagamento do Bitcoin.",
      },
      {
        id: "q6-3",
        type: "true_false",
        question: "Todas as altcoins são apenas cópias do Bitcoin com nomes diferentes.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! Embora algumas altcoins sejam semelhantes ao Bitcoin, muitas têm recursos únicos como contratos inteligentes (Ethereum), transações rápidas (Solana), ou casos de uso específicos.",
        hint: "Diferentes criptomoedas têm propósitos diferentes...",
      },
      {
        id: "q6-4",
        type: "multiple_choice",
        question: "Por que as altcoins existem?",
        options: [
          "Para confundir as pessoas",
          "Para melhorar o Bitcoin ou servir propósitos diferentes",
          "Apenas para ganhar dinheiro",
          "Porque o Bitcoin é ilegal",
        ],
        correctAnswer: 1,
        explanation:
          "Altcoins existem para melhorar as limitações do Bitcoin ou servir propósitos diferentes. Algumas oferecem transações mais rápidas, contratos inteligentes, recursos de privacidade ou casos de uso específicos.",
      },
      {
        id: "q6-5",
        type: "true_false",
        question: "Dominância do Bitcoin refere-se à participação do Bitcoin no mercado total de cripto.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 0,
        explanation:
          "Verdadeiro! A dominância do Bitcoin é a porcentagem da capitalização total do mercado de criptomoedas que o Bitcoin representa. Ela flutua conforme as altcoins ganham ou perdem valor.",
      },
    ],
  },
  {
    id: "lesson-7",
    title: "Stablecoins",
    module: "Tipos de Criptomoedas",
    moduleNumber: 2,
    difficulty: "beginner",
    xpReward: 20,
    coinReward: 10,
    requiredLevel: 2,
    icon: "💵",
    questions: [
      {
        id: "q7-1",
        type: "multiple_choice",
        question: "O que é uma stablecoin?",
        options: [
          "Uma criptomoeda atrelada a um ativo estável como USD",
          "Uma moeda que nunca muda de preço",
          "A criptomoeda mais popular",
          "Uma moeda de metal físico",
        ],
        correctAnswer: 0,
        explanation:
          "Uma stablecoin é uma criptomoeda projetada para manter um valor estável sendo atrelada a um ativo estável, tipicamente o dólar americano. 1 USDT ≈ $1 USD.",
      },
      {
        id: "q7-2",
        type: "multiple_choice",
        question: "Por que as stablecoins são úteis?",
        options: [
          "Elas são a criptomoeda mais barata",
          "Elas combinam benefícios de cripto com estabilidade de preço",
          "Elas são a criptomoeda mais rápida",
          "Elas são as mais privadas",
        ],
        correctAnswer: 1,
        explanation:
          "Stablecoins oferecem os benefícios da criptomoeda (transferências rápidas, negociação 24/7) mantendo valor estável. Isso as torna ideais para negociação, pagamentos e armazenamento de valor.",
        hint: "Pense em combinar o melhor dos dois mundos...",
      },
      {
        id: "q7-3",
        type: "true_false",
        question: "Stablecoins podem aumentar ou diminuir significativamente em valor como o Bitcoin.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! Stablecoins são projetadas para manter um valor estável (geralmente $1). Embora possam flutuar ligeiramente, elas não devem experimentar a volatilidade do Bitcoin ou outras criptomoedas.",
      },
      {
        id: "q7-4",
        type: "multiple_choice",
        question: "Qual destas é uma stablecoin popular?",
        options: ["Bitcoin", "Ethereum", "USDT (Tether)", "Dogecoin"],
        correctAnswer: 2,
        explanation:
          "USDT (Tether) é uma das stablecoins mais populares, atrelada ao dólar americano. Outras populares incluem USDC, DAI e BUSD.",
      },
      {
        id: "q7-5",
        type: "true_false",
        question: "Stablecoins são sempre lastreadas por dólares americanos físicos em um banco.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! Embora algumas stablecoins sejam lastreadas por reservas de moeda fiduciária, outras usam colateral de criptomoeda ou mecanismos algorítmicos para manter sua paridade com o dólar.",
      },
    ],
  },
  {
    id: "lesson-8",
    title: "Tokens vs Moedas",
    module: "Tipos de Criptomoedas",
    moduleNumber: 2,
    difficulty: "intermediate",
    xpReward: 25,
    coinReward: 15,
    requiredLevel: 3,
    icon: "🎯",
    questions: [
      {
        id: "q8-1",
        type: "multiple_choice",
        question: "Qual é a principal diferença entre moedas e tokens?",
        options: [
          "Moedas são mais baratas que tokens",
          "Moedas têm sua própria blockchain, tokens são construídos em blockchains existentes",
          "Tokens sempre valem mais",
          "Não há diferença",
        ],
        correctAnswer: 1,
        explanation:
          "Moedas (como Bitcoin, Ethereum) operam em sua própria blockchain. Tokens são construídos em blockchains existentes usando contratos inteligentes (como muitos tokens no Ethereum).",
      },
      {
        id: "q8-2",
        type: "multiple_choice",
        question: "Qual é um exemplo de token?",
        options: [
          "Bitcoin (BTC)",
          "Ethereum (ETH)",
          "Chainlink (LINK) - roda no Ethereum",
          "Litecoin (LTC)",
        ],
        correctAnswer: 2,
        explanation:
          "Chainlink (LINK) é um token construído na blockchain Ethereum. Bitcoin, Ethereum e Litecoin são moedas com suas próprias blockchains.",
        hint: "Procure aquele que 'roda em' outra blockchain...",
      },
      {
        id: "q8-3",
        type: "true_false",
        question: "Tokens podem representar propriedade, direitos de acesso ou outros ativos além de moeda.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 0,
        explanation:
          "Verdadeiro! Tokens são muito versáteis. Eles podem representar utilidade (acesso a serviços), segurança (participações de propriedade), direitos de governança, NFTs e muito mais.",
      },
      {
        id: "q8-4",
        type: "multiple_choice",
        question: "Qual padrão de blockchain é comumente usado para tokens?",
        options: ["ERC-20", "HTTP", "TCP/IP", "DNS"],
        correctAnswer: 0,
        explanation:
          "ERC-20 é o padrão de token mais comum no Ethereum. Ele define como os tokens devem se comportar, tornando-os compatíveis com carteiras e exchanges.",
      },
      {
        id: "q8-5",
        type: "true_false",
        question: "Criar um token requer construir uma blockchain inteira do zero.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! Um dos benefícios dos tokens é que você pode criá-los em blockchains existentes como Ethereum sem construir sua própria infraestrutura de blockchain.",
      },
    ],
  },
  {
    id: "lesson-9",
    title: "Introdução aos NFTs",
    module: "Tipos de Criptomoedas",
    moduleNumber: 2,
    difficulty: "intermediate",
    xpReward: 25,
    coinReward: 15,
    requiredLevel: 3,
    icon: "🖼️",
    questions: [
      {
        id: "q9-1",
        type: "multiple_choice",
        question: "O que significa NFT?",
        options: [
          "Novo Token Financeiro",
          "Token Não-Fungível",
          "Transferência de Arquivo de Rede",
          "Não Para Negociar",
        ],
        correctAnswer: 1,
        explanation:
          "NFT significa Token Não-Fungível. 'Não-fungível' significa que cada token é único e não pode ser substituído por outro idêntico, ao contrário das criptomoedas.",
      },
      {
        id: "q9-2",
        type: "multiple_choice",
        question: "O que significa 'fungível'?",
        options: [
          "Caro",
          "Digital",
          "Intercambiável/substituível",
          "Raro",
        ],
        correctAnswer: 2,
        explanation:
          "Fungível significa intercambiável. Uma nota de dólar é fungível - qualquer nota de $1 tem o mesmo valor. NFTs são não-fungíveis - cada um é único com seu próprio valor.",
        hint: "Pense em itens que podem ser trocados sem perder valor...",
      },
      {
        id: "q9-3",
        type: "true_false",
        question: "NFTs só podem representar arte digital.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! Embora a arte digital seja popular, NFTs podem representar qualquer coisa única: música, vídeos, imóveis virtuais, ingressos para eventos, itens de jogos, colecionáveis e muito mais.",
      },
      {
        id: "q9-4",
        type: "multiple_choice",
        question: "Onde os NFTs são principalmente comprados e vendidos?",
        options: [
          "Lojas online regulares",
          "Mercados de NFT como OpenSea",
          "Apenas casas de leilão físicas",
          "Bancos",
        ],
        correctAnswer: 1,
        explanation:
          "NFTs são principalmente negociados em mercados especializados como OpenSea, Rarible e Magic Eden. Essas plataformas conectam compradores e vendedores de ativos digitais únicos.",
      },
      {
        id: "q9-5",
        type: "true_false",
        question: "Possuir um NFT significa que você possui os direitos autorais da obra de arte subjacente.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! Comprar um NFT geralmente lhe dá a propriedade do token e talvez alguns direitos de uso, mas não necessariamente os direitos autorais. O criador original frequentemente retém os direitos autorais.",
      },
    ],
  },
  {
    id: "lesson-10",
    title: "Básico de DeFi",
    module: "Tipos de Criptomoedas",
    moduleNumber: 2,
    difficulty: "intermediate",
    xpReward: 25,
    coinReward: 15,
    requiredLevel: 4,
    icon: "🏦",
    questions: [
      {
        id: "q10-1",
        type: "multiple_choice",
        question: "O que significa DeFi?",
        options: [
          "Finanças Definitivas",
          "Finanças Descentralizadas",
          "Fidelidade Digital",
          "Financiamento Diferido",
        ],
        correctAnswer: 1,
        explanation:
          "DeFi significa Finanças Descentralizadas - serviços financeiros construídos em blockchain que operam sem intermediários tradicionais como bancos.",
      },
      {
        id: "q10-2",
        type: "multiple_choice",
        question: "Qual é a principal vantagem do DeFi sobre as finanças tradicionais?",
        options: [
          "É sempre mais lucrativo",
          "Sem intermediários, acessível a qualquer pessoa com internet",
          "É regulado por governos",
          "É sem risco",
        ],
        correctAnswer: 1,
        explanation:
          "DeFi remove intermediários como bancos, tornando os serviços financeiros acessíveis 24/7 para qualquer pessoa com conexão à internet, independentemente de localização ou histórico.",
        hint: "Pense em remover intermediários e barreiras...",
      },
      {
        id: "q10-3",
        type: "true_false",
        question: "Aplicações DeFi exigem que você tenha uma conta bancária.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! Um dos principais benefícios do DeFi é a inclusão financeira. Você só precisa de uma carteira de cripto e conexão à internet - nenhuma conta bancária necessária.",
      },
      {
        id: "q10-4",
        type: "multiple_choice",
        question: "Qual é um exemplo de atividade DeFi?",
        options: [
          "Sacar dinheiro de um caixa eletrônico",
          "Emprestar cripto e ganhar juros",
          "Usar um cartão de crédito",
          "Depositar em um banco",
        ],
        correctAnswer: 1,
        explanation:
          "DeFi inclui atividades como emprestar/tomar emprestado cripto, negociar em exchanges descentralizadas, ganhar rendimento e mais - tudo sem instituições financeiras tradicionais.",
      },
      {
        id: "q10-5",
        type: "true_false",
        question: "Protocolos DeFi são tipicamente controlados por uma única empresa.",
        options: ["Verdadeiro", "Falso"],
        correctAnswer: 1,
        explanation:
          "Falso! A maioria dos protocolos DeFi é descentralizada e governada por sua comunidade através de DAOs (Organizações Autônomas Descentralizadas), não controladas por uma única entidade.",
      },
    ],
  },
];
