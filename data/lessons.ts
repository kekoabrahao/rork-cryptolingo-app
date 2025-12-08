import { Lesson } from "@/types/lesson";

export const lessons: Lesson[] = [
  {
    id: "lesson-1",
    title: "What is Cryptocurrency?",
    module: "Crypto Fundamentals",
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
        question: "What is cryptocurrency?",
        options: [
          "Digital or virtual currency using cryptography",
          "A type of credit card",
          "Physical coins made of gold",
          "Government-issued paper money",
        ],
        correctAnswer: 0,
        explanation:
          "Cryptocurrency is a digital or virtual currency that uses cryptography for security. Unlike traditional currencies, it operates independently of central banks.",
      },
      {
        id: "q1-2",
        type: "true_false",
        question: "Cryptocurrencies are controlled by governments and central banks.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! Most cryptocurrencies are decentralized, meaning they're not controlled by any government or central authority. This is one of their key features.",
      },
      {
        id: "q1-3",
        type: "multiple_choice",
        question: "What technology powers most cryptocurrencies?",
        options: ["Cloud Computing", "Blockchain", "Artificial Intelligence", "5G Networks"],
        correctAnswer: 1,
        explanation:
          "Blockchain technology is the foundation of most cryptocurrencies. It's a distributed ledger that records all transactions across a network of computers.",
        hint: "Think of a chain of blocks containing transaction data...",
      },
      {
        id: "q1-4",
        type: "multiple_choice",
        question: "Which was the first cryptocurrency?",
        options: ["Ethereum", "Litecoin", "Bitcoin", "Ripple"],
        correctAnswer: 2,
        explanation:
          "Bitcoin, created by Satoshi Nakamoto in 2009, was the first cryptocurrency. It revolutionized digital currency and inspired thousands of alternatives.",
      },
      {
        id: "q1-5",
        type: "true_false",
        question: "You can physically hold a cryptocurrency like you hold cash.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! Cryptocurrencies are purely digital. They exist only as records on a blockchain and are stored in digital wallets, not physical form.",
      },
    ],
  },
  {
    id: "lesson-2",
    title: "Blockchain Basics",
    module: "Crypto Fundamentals",
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
        question: "What is a blockchain?",
        options: [
          "A chain worn as jewelry",
          "A distributed database of transactions",
          "A type of cryptocurrency",
          "A mining tool",
        ],
        correctAnswer: 1,
        explanation:
          "A blockchain is a distributed database that maintains a continuously growing list of records called blocks, which are linked and secured using cryptography.",
      },
      {
        id: "q2-2",
        type: "true_false",
        question: "Once data is recorded in a blockchain, it can be easily altered or deleted.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! One of blockchain's key features is immutability. Once data is added to the blockchain, it's extremely difficult to change, making it secure and trustworthy.",
      },
      {
        id: "q2-3",
        type: "multiple_choice",
        question: "What does each block in a blockchain contain?",
        options: [
          "Only the transaction data",
          "Transaction data, timestamp, and link to previous block",
          "Just a timestamp",
          "Only cryptocurrency prices",
        ],
        correctAnswer: 1,
        explanation:
          "Each block contains transaction data, a timestamp, and a cryptographic hash of the previous block. This creates an unbreakable chain.",
        hint: "Blocks are connected like links in a chain...",
      },
      {
        id: "q2-4",
        type: "multiple_choice",
        question: "Who maintains the blockchain network?",
        options: [
          "A single company",
          "The government",
          "A distributed network of computers (nodes)",
          "Banks only",
        ],
        correctAnswer: 2,
        explanation:
          "Blockchain networks are maintained by distributed nodes (computers) around the world. This decentralization makes them resistant to control or shutdown.",
      },
      {
        id: "q2-5",
        type: "true_false",
        question: "Blockchain technology can only be used for cryptocurrencies.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! While blockchain powers cryptocurrencies, it has many other applications including supply chain management, healthcare records, voting systems, and more.",
      },
    ],
  },
  {
    id: "lesson-3",
    title: "Bitcoin 101",
    module: "Crypto Fundamentals",
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
        question: "Who created Bitcoin?",
        options: ["Elon Musk", "Satoshi Nakamoto", "Vitalik Buterin", "Bill Gates"],
        correctAnswer: 1,
        explanation:
          "Bitcoin was created by an anonymous person or group using the pseudonym Satoshi Nakamoto. Their true identity remains unknown to this day.",
      },
      {
        id: "q3-2",
        type: "multiple_choice",
        question: "What is the maximum supply of Bitcoin that will ever exist?",
        options: ["21 million", "100 million", "Unlimited", "1 billion"],
        correctAnswer: 0,
        explanation:
          "Bitcoin has a fixed supply cap of 21 million coins. This scarcity is built into its protocol and makes it potentially valuable as a store of value.",
        hint: "Think of a number that makes Bitcoin scarce...",
      },
      {
        id: "q3-3",
        type: "true_false",
        question: "Bitcoin transactions are completely anonymous.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! Bitcoin transactions are pseudonymous, not anonymous. All transactions are recorded on a public ledger, though they're linked to addresses rather than names.",
      },
      {
        id: "q3-4",
        type: "multiple_choice",
        question: "What is Bitcoin mining?",
        options: [
          "Digging for physical bitcoins underground",
          "Buying bitcoins from a store",
          "Using computers to validate transactions and secure the network",
          "Creating fake bitcoins",
        ],
        correctAnswer: 2,
        explanation:
          "Bitcoin mining is the process of using computational power to validate transactions, secure the network, and add new blocks to the blockchain. Miners are rewarded with new bitcoins.",
      },
      {
        id: "q3-5",
        type: "true_false",
        question: "You need to buy a whole Bitcoin to own any Bitcoin.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! Bitcoin is divisible. The smallest unit is called a Satoshi (0.00000001 BTC). You can buy any fraction of a Bitcoin that fits your budget.",
      },
    ],
  },
  {
    id: "lesson-4",
    title: "Crypto Wallets",
    module: "Crypto Fundamentals",
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
        question: "What is a cryptocurrency wallet?",
        options: [
          "A leather wallet for storing coins",
          "A digital tool that stores your private keys",
          "A bank account for crypto",
          "A physical USB drive",
        ],
        correctAnswer: 1,
        explanation:
          "A cryptocurrency wallet is a digital tool that stores your private keys, allowing you to send and receive cryptocurrencies. It doesn't actually store the coins themselves.",
      },
      {
        id: "q4-2",
        type: "multiple_choice",
        question: "What are the two main types of wallets?",
        options: [
          "Big and small",
          "Hot and cold",
          "Fast and slow",
          "New and old",
        ],
        correctAnswer: 1,
        explanation:
          "The two main types are hot wallets (connected to internet, convenient but less secure) and cold wallets (offline storage, more secure but less convenient).",
        hint: "Think about temperature and internet connectivity...",
      },
      {
        id: "q4-3",
        type: "true_false",
        question: "If you lose your private key, you can contact customer support to recover it.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! If you lose your private key and don't have a backup (seed phrase), your crypto is gone forever. No one can recover it for you - this is the price of decentralization.",
      },
      {
        id: "q4-4",
        type: "multiple_choice",
        question: "Which type of wallet is most secure for long-term storage?",
        options: [
          "Mobile wallet app",
          "Exchange wallet",
          "Hardware wallet (cold storage)",
          "Web browser extension wallet",
        ],
        correctAnswer: 2,
        explanation:
          "Hardware wallets (cold storage) are the most secure for long-term storage because they keep your private keys offline, away from hackers and malware.",
      },
      {
        id: "q4-5",
        type: "true_false",
        question: "You should share your wallet's private key with trusted friends for backup.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! NEVER share your private key with anyone. Anyone with your private key has complete control over your crypto. Keep it secret and secure.",
      },
    ],
  },
  {
    id: "lesson-5",
    title: "Public vs Private Keys",
    module: "Crypto Fundamentals",
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
        question: "What is a public key?",
        options: [
          "A secret password you never share",
          "Your wallet address that others can use to send you crypto",
          "A key to a public bathroom",
          "Your bank account number",
        ],
        correctAnswer: 1,
        explanation:
          "A public key is your wallet address that you can safely share with others. It's like your email address - people need it to send you things.",
      },
      {
        id: "q5-2",
        type: "multiple_choice",
        question: "What is a private key?",
        options: [
          "A password you can share with family",
          "Your username on crypto exchanges",
          "A secret code that gives control over your crypto",
          "A public address for receiving crypto",
        ],
        correctAnswer: 2,
        explanation:
          "A private key is a secret cryptographic code that gives you control over your cryptocurrency. It must be kept absolutely secret - anyone with it can access your funds.",
        hint: "Think about what should always remain private and secret...",
      },
      {
        id: "q5-3",
        type: "true_false",
        question: "Your public key can be shared safely with anyone.",
        options: ["True", "False"],
        correctAnswer: 0,
        explanation:
          "True! Your public key (wallet address) is meant to be shared. It's how others send you cryptocurrency. Think of it like your email address.",
      },
      {
        id: "q5-4",
        type: "multiple_choice",
        question: "Which analogy best describes public and private keys?",
        options: [
          "Username and password",
          "Email address and email password",
          "Phone number and voicemail PIN",
          "All of the above",
        ],
        correctAnswer: 3,
        explanation:
          "All are good analogies! Public key is what others use to reach you (like email address), private key is your secret access code (like password) that must be protected.",
      },
      {
        id: "q5-5",
        type: "true_false",
        question: "If someone has your public key, they can steal your cryptocurrency.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! Having your public key only allows someone to send you crypto or view your balance. They need your private key to steal or move your funds.",
      },
    ],
  },
  {
    id: "lesson-6",
    title: "Altcoins Explained",
    module: "Types of Cryptocurrencies",
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
        question: "What does 'altcoin' mean?",
        options: [
          "Alternative to Bitcoin",
          "Aluminum coin",
          "Altitude coin",
          "Altered coin",
        ],
        correctAnswer: 0,
        explanation:
          "'Altcoin' is short for 'alternative coin' - any cryptocurrency that isn't Bitcoin. There are thousands of altcoins with different features and purposes.",
      },
      {
        id: "q6-2",
        type: "multiple_choice",
        question: "Which of these is a popular altcoin?",
        options: ["Dollar", "Ethereum", "Euro", "Yen"],
        correctAnswer: 1,
        explanation:
          "Ethereum is one of the most popular altcoins. It was created to enable smart contracts and decentralized applications, going beyond Bitcoin's payment focus.",
      },
      {
        id: "q6-3",
        type: "true_false",
        question: "All altcoins are just copies of Bitcoin with different names.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! While some altcoins are similar to Bitcoin, many have unique features like smart contracts (Ethereum), fast transactions (Solana), or specific use cases.",
        hint: "Different cryptocurrencies have different purposes...",
      },
      {
        id: "q6-4",
        type: "multiple_choice",
        question: "Why do altcoins exist?",
        options: [
          "To confuse people",
          "To improve on Bitcoin or serve different purposes",
          "Just to make money",
          "Because Bitcoin is illegal",
        ],
        correctAnswer: 1,
        explanation:
          "Altcoins exist to improve on Bitcoin's limitations or serve different purposes. Some offer faster transactions, smart contracts, privacy features, or specific use cases.",
      },
      {
        id: "q6-5",
        type: "true_false",
        question: "Bitcoin dominance refers to Bitcoin's share of the total crypto market.",
        options: ["True", "False"],
        correctAnswer: 0,
        explanation:
          "True! Bitcoin dominance is the percentage of the total cryptocurrency market capitalization that Bitcoin represents. It fluctuates as altcoins gain or lose value.",
      },
    ],
  },
  {
    id: "lesson-7",
    title: "Stablecoins",
    module: "Types of Cryptocurrencies",
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
        question: "What is a stablecoin?",
        options: [
          "A cryptocurrency pegged to a stable asset like USD",
          "A coin that never changes price",
          "The most popular cryptocurrency",
          "A physical metal coin",
        ],
        correctAnswer: 0,
        explanation:
          "A stablecoin is a cryptocurrency designed to maintain a stable value by being pegged to a stable asset, typically the US dollar. 1 USDT ≈ $1 USD.",
      },
      {
        id: "q7-2",
        type: "multiple_choice",
        question: "Why are stablecoins useful?",
        options: [
          "They're the cheapest cryptocurrency",
          "They combine crypto benefits with price stability",
          "They're the fastest cryptocurrency",
          "They're the most private",
        ],
        correctAnswer: 1,
        explanation:
          "Stablecoins offer the benefits of cryptocurrency (fast transfers, 24/7 trading) while maintaining stable value. This makes them ideal for trading, payments, and storing value.",
        hint: "Think about combining the best of both worlds...",
      },
      {
        id: "q7-3",
        type: "true_false",
        question: "Stablecoins can significantly increase or decrease in value like Bitcoin.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! Stablecoins are designed to maintain a stable value (usually $1). While they can slightly fluctuate, they shouldn't experience the volatility of Bitcoin or other cryptocurrencies.",
      },
      {
        id: "q7-4",
        type: "multiple_choice",
        question: "Which of these is a popular stablecoin?",
        options: ["Bitcoin", "Ethereum", "USDT (Tether)", "Dogecoin"],
        correctAnswer: 2,
        explanation:
          "USDT (Tether) is one of the most popular stablecoins, pegged to the US dollar. Other popular ones include USDC, DAI, and BUSD.",
      },
      {
        id: "q7-5",
        type: "true_false",
        question: "Stablecoins are always backed by physical US dollars in a bank.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! While some stablecoins are backed by fiat currency reserves, others use cryptocurrency collateral or algorithmic mechanisms to maintain their peg to the dollar.",
      },
    ],
  },
  {
    id: "lesson-8",
    title: "Tokens vs Coins",
    module: "Types of Cryptocurrencies",
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
        question: "What's the main difference between coins and tokens?",
        options: [
          "Coins are cheaper than tokens",
          "Coins have their own blockchain, tokens are built on existing blockchains",
          "Tokens are always worth more",
          "There is no difference",
        ],
        correctAnswer: 1,
        explanation:
          "Coins (like Bitcoin, Ethereum) operate on their own blockchain. Tokens are built on existing blockchains using smart contracts (like many tokens on Ethereum).",
      },
      {
        id: "q8-2",
        type: "multiple_choice",
        question: "Which is an example of a token?",
        options: [
          "Bitcoin (BTC)",
          "Ethereum (ETH)",
          "Chainlink (LINK) - runs on Ethereum",
          "Litecoin (LTC)",
        ],
        correctAnswer: 2,
        explanation:
          "Chainlink (LINK) is a token built on the Ethereum blockchain. Bitcoin, Ethereum, and Litecoin are coins with their own blockchains.",
        hint: "Look for the one that 'runs on' another blockchain...",
      },
      {
        id: "q8-3",
        type: "true_false",
        question: "Tokens can represent ownership, access rights, or other assets beyond currency.",
        options: ["True", "False"],
        correctAnswer: 0,
        explanation:
          "True! Tokens are very versatile. They can represent utility (access to services), security (ownership stakes), governance rights, NFTs, and much more.",
      },
      {
        id: "q8-4",
        type: "multiple_choice",
        question: "What blockchain standard is commonly used for tokens?",
        options: ["ERC-20", "HTTP", "TCP/IP", "DNS"],
        correctAnswer: 0,
        explanation:
          "ERC-20 is the most common token standard on Ethereum. It defines how tokens should behave, making them compatible with wallets and exchanges.",
      },
      {
        id: "q8-5",
        type: "true_false",
        question: "Creating a token requires building an entire blockchain from scratch.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! One of the benefits of tokens is that you can create them on existing blockchains like Ethereum without building your own blockchain infrastructure.",
      },
    ],
  },
  {
    id: "lesson-9",
    title: "Introduction to NFTs",
    module: "Types of Cryptocurrencies",
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
        question: "What does NFT stand for?",
        options: [
          "New Financial Token",
          "Non-Fungible Token",
          "Network File Transfer",
          "Not For Trading",
        ],
        correctAnswer: 1,
        explanation:
          "NFT stands for Non-Fungible Token. 'Non-fungible' means each token is unique and can't be replaced with another identical one, unlike cryptocurrencies.",
      },
      {
        id: "q9-2",
        type: "multiple_choice",
        question: "What does 'fungible' mean?",
        options: [
          "Expensive",
          "Digital",
          "Interchangeable/replaceable",
          "Rare",
        ],
        correctAnswer: 2,
        explanation:
          "Fungible means interchangeable. A dollar bill is fungible - any $1 bill has the same value. NFTs are non-fungible - each one is unique with its own value.",
        hint: "Think about items that can be swapped without losing value...",
      },
      {
        id: "q9-3",
        type: "true_false",
        question: "NFTs can only represent digital art.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! While digital art is popular, NFTs can represent anything unique: music, videos, virtual real estate, event tickets, in-game items, collectibles, and more.",
      },
      {
        id: "q9-4",
        type: "multiple_choice",
        question: "Where are NFTs primarily bought and sold?",
        options: [
          "Regular online stores",
          "NFT marketplaces like OpenSea",
          "Physical auction houses only",
          "Banks",
        ],
        correctAnswer: 1,
        explanation:
          "NFTs are primarily traded on specialized marketplaces like OpenSea, Rarible, and Magic Eden. These platforms connect buyers and sellers of unique digital assets.",
      },
      {
        id: "q9-5",
        type: "true_false",
        question: "Owning an NFT means you own the copyright to the underlying artwork.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! Buying an NFT typically gives you ownership of the token and maybe some usage rights, but not necessarily the copyright. The original creator often retains copyright.",
      },
    ],
  },
  {
    id: "lesson-10",
    title: "DeFi Basics",
    module: "Types of Cryptocurrencies",
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
        question: "What does DeFi stand for?",
        options: [
          "Definite Finance",
          "Decentralized Finance",
          "Digital Fidelity",
          "Deferred Financing",
        ],
        correctAnswer: 1,
        explanation:
          "DeFi stands for Decentralized Finance - financial services built on blockchain that operate without traditional intermediaries like banks.",
      },
      {
        id: "q10-2",
        type: "multiple_choice",
        question: "What's the main advantage of DeFi over traditional finance?",
        options: [
          "It's always more profitable",
          "No intermediaries, accessible to anyone with internet",
          "It's regulated by governments",
          "It's risk-free",
        ],
        correctAnswer: 1,
        explanation:
          "DeFi removes intermediaries like banks, making financial services accessible 24/7 to anyone with an internet connection, regardless of location or background.",
        hint: "Think about removing middlemen and barriers...",
      },
      {
        id: "q10-3",
        type: "true_false",
        question: "DeFi applications require you to have a bank account.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! One of DeFi's key benefits is financial inclusion. You only need a crypto wallet and internet connection - no bank account required.",
      },
      {
        id: "q10-4",
        type: "multiple_choice",
        question: "Which is an example of a DeFi activity?",
        options: [
          "Withdrawing cash from an ATM",
          "Lending crypto and earning interest",
          "Using a credit card",
          "Depositing at a bank",
        ],
        correctAnswer: 1,
        explanation:
          "DeFi includes activities like lending/borrowing crypto, trading on decentralized exchanges, earning yield, and more - all without traditional financial institutions.",
      },
      {
        id: "q10-5",
        type: "true_false",
        question: "DeFi protocols are typically controlled by a single company.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "False! Most DeFi protocols are decentralized and governed by their community through DAOs (Decentralized Autonomous Organizations), not controlled by a single entity.",
      },
    ],
  },
];
