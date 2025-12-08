import { NewsArticle, NewsCategory, NewsUrgency } from '@/types/news';

export const newsArticles: NewsArticle[] = [
  {
    id: 'news_1',
    title: 'Bitcoin ETF Approval: A Major Milestone for Crypto Adoption',
    summary: 'The SEC approves the first Bitcoin spot ETF, marking a historic moment for cryptocurrency mainstream adoption.',
    content: `The U.S. Securities and Exchange Commission has approved the first Bitcoin spot ETF, marking a watershed moment for the cryptocurrency industry. This decision opens the door for traditional investors to gain exposure to Bitcoin through regulated financial products.

The approval comes after years of applications and rejections, signaling a shift in regulatory stance toward digital assets. Industry experts predict this could lead to billions of dollars in institutional investment flowing into Bitcoin.

Financial advisors can now include Bitcoin in traditional investment portfolios, making it accessible to a broader audience. This move is expected to reduce volatility and increase market maturity.

Key implications:
- Easier access for retail investors
- Increased institutional participation
- Enhanced market liquidity
- Potential for reduced volatility
- Greater regulatory clarity

This milestone represents not just a win for Bitcoin, but for the entire cryptocurrency ecosystem, demonstrating that digital assets are becoming a legitimate part of the global financial system.`,
    source: 'coindesk',
    category: 'bitcoin',
    urgency: 'breaking',
    impact: 'bullish',
    impactScore: 9,
    relatedCryptos: ['BTC'],
    publishedAt: new Date('2024-01-10T14:30:00Z'),
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800',
    readTime: 5,
    difficulty: 'beginner',
    keyTerms: ['ETF', 'SEC', 'Spot Bitcoin', 'Institutional Investment'],
    relatedLessons: ['bitcoin_basics', 'crypto_investment'],
    xpReward: 25,
    coinReward: 15,
    quiz: {
      question: 'What is a Bitcoin ETF?',
      options: [
        'A cryptocurrency wallet',
        'An investment fund that tracks Bitcoin price',
        'A Bitcoin mining company',
        'A blockchain protocol'
      ],
      correctAnswer: 1,
      explanation: 'A Bitcoin ETF (Exchange-Traded Fund) is an investment fund that tracks the price of Bitcoin and trades on traditional stock exchanges, allowing investors to gain exposure to Bitcoin without directly owning it.',
      difficulty: 'easy',
      xpBonus: 10,
      coinBonus: 5
    },
    comments: 234,
    likes: 1523,
    shares: 456
  },
  {
    id: 'news_2',
    title: 'Ethereum Upgrade Reduces Gas Fees by 40%',
    summary: 'The latest Ethereum network upgrade successfully implements EIP-4844, dramatically reducing transaction costs.',
    content: `Ethereum has successfully completed its highly anticipated upgrade, implementing EIP-4844 (proto-danksharding), which has resulted in a 40% reduction in average gas fees across the network.

This upgrade introduces "blobs" - a new type of data that's cheaper to include in blocks, specifically designed to help Layer 2 scaling solutions reduce their costs. The impact on users has been immediate and significant.

Technical improvements:
- Data availability sampling enabled
- Reduced L2 rollup costs
- Improved network throughput
- Enhanced scalability infrastructure

The Ethereum community has been celebrating this milestone as a crucial step toward making blockchain technology more accessible and affordable for everyday users. DeFi protocols and NFT marketplaces are already reporting lower transaction costs.

Layer 2 solutions like Arbitrum and Optimism are expected to pass these savings directly to users, potentially reducing transaction costs by up to 90% in some cases.

This upgrade positions Ethereum more competitively against other blockchain platforms and reinforces its commitment to becoming the world's decentralized computer.`,
    source: 'cointelegraph',
    category: 'ethereum',
    urgency: 'important',
    impact: 'bullish',
    impactScore: 8,
    relatedCryptos: ['ETH', 'ARB', 'OP'],
    publishedAt: new Date('2024-01-12T09:15:00Z'),
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    readTime: 6,
    difficulty: 'intermediate',
    keyTerms: ['Gas Fees', 'EIP-4844', 'Layer 2', 'Danksharding', 'Scaling'],
    relatedLessons: ['ethereum_basics', 'defi_fundamentals'],
    xpReward: 30,
    coinReward: 20,
    quiz: {
      question: 'What is the primary benefit of EIP-4844?',
      options: [
        'Increases mining rewards',
        'Reduces transaction costs',
        'Creates new tokens',
        'Removes validators'
      ],
      correctAnswer: 1,
      explanation: 'EIP-4844 introduces proto-danksharding which significantly reduces transaction costs by providing cheaper data storage for Layer 2 solutions, making Ethereum more affordable for users.',
      difficulty: 'medium',
      xpBonus: 15,
      coinBonus: 8
    },
    comments: 189,
    likes: 1245,
    shares: 378
  },
  {
    id: 'news_3',
    title: 'Major Banks Launch Blockchain Payment Network',
    summary: 'Five of the world\'s largest banks announce a joint blockchain-based payment system for international transfers.',
    content: `In a groundbreaking collaboration, five major international banks have announced the launch of a blockchain-based payment network designed to revolutionize cross-border transactions.

The consortium includes JPMorgan, HSBC, Deutsche Bank, BNP Paribas, and Santander. Their new system promises to reduce international transfer times from 3-5 days to mere minutes, while cutting costs by up to 80%.

Key features:
- Real-time settlement
- Multi-currency support
- Enhanced transparency
- Reduced intermediary fees
- 24/7 operation

This initiative represents a significant validation of blockchain technology by the traditional banking sector. The system will initially support transfers in USD, EUR, GBP, and JPY, with plans to add more currencies.

Industry analysts view this as a potential threat to traditional payment processors like SWIFT, which have dominated international transfers for decades. However, it also legitimizes blockchain technology in the eyes of regulators and traditional financial institutions.

The banks have stated that the system will be interoperable with existing blockchain networks, potentially creating bridges between traditional finance and decentralized finance (DeFi).

Initial rollout begins in Q2 2024, targeting corporate clients before expanding to retail banking customers.`,
    source: 'coindesk',
    category: 'adoption',
    urgency: 'important',
    impact: 'bullish',
    impactScore: 7,
    relatedCryptos: ['XRP', 'XLM', 'USDC'],
    publishedAt: new Date('2024-01-13T11:00:00Z'),
    imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
    readTime: 5,
    difficulty: 'beginner',
    keyTerms: ['Blockchain', 'Cross-border Payments', 'Banking', 'Settlement'],
    relatedLessons: ['blockchain_basics', 'crypto_adoption'],
    xpReward: 20,
    coinReward: 12,
    quiz: {
      question: 'What is the main advantage of blockchain-based payment systems over traditional methods?',
      options: [
        'Higher interest rates',
        'Faster settlement and lower costs',
        'More customer support',
        'Better credit scores'
      ],
      correctAnswer: 1,
      explanation: 'Blockchain-based payment systems offer significantly faster settlement times (minutes vs days) and lower costs by removing intermediaries and operating 24/7.',
      difficulty: 'easy',
      xpBonus: 10,
      coinBonus: 5
    },
    comments: 156,
    likes: 987,
    shares: 234
  },
  {
    id: 'news_4',
    title: 'DeFi Protocol Suffers $50M Exploit: Security Concerns Rise',
    summary: 'A popular DeFi lending platform falls victim to a smart contract vulnerability, raising questions about security audits.',
    content: `A major decentralized finance (DeFi) protocol has suffered a $50 million exploit due to a critical vulnerability in its smart contract code. The incident has reignited discussions about security practices in the DeFi ecosystem.

The attack occurred early this morning when an unknown actor exploited a reentrancy vulnerability in the protocol's lending pool contract. The attacker was able to drain funds across multiple transactions before the team could respond.

Timeline of events:
- 2:30 AM UTC: First suspicious transaction detected
- 2:45 AM UTC: Exploit confirmed by security researchers
- 3:15 AM UTC: Protocol team pauses contracts
- 4:00 AM UTC: Public announcement made

This incident highlights several critical issues in the DeFi space:

1. Audit limitations: The protocol had undergone two security audits, yet the vulnerability remained undetected.

2. Complexity risks: As DeFi protocols become more sophisticated, the attack surface grows.

3. Response time: The delay between detection and response allowed the attacker to maximize damage.

The protocol's team has promised to reimburse affected users through their insurance fund, though it may not cover the full amount. They've also committed to a comprehensive security overhaul and additional audits.

Security experts recommend:
- Using only audited protocols
- Diversifying across platforms
- Monitoring for unusual activity
- Understanding smart contract risks

This event serves as a sobering reminder that while DeFi offers exciting opportunities, it also carries significant risks that users must carefully consider.`,
    source: 'cryptopanic',
    category: 'defi',
    urgency: 'breaking',
    impact: 'bearish',
    impactScore: 6,
    relatedCryptos: ['ETH', 'AAVE', 'COMP'],
    publishedAt: new Date('2024-01-14T08:30:00Z'),
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
    readTime: 7,
    difficulty: 'advanced',
    keyTerms: ['DeFi', 'Smart Contract', 'Exploit', 'Reentrancy', 'Security Audit'],
    relatedLessons: ['defi_fundamentals', 'security_basics'],
    xpReward: 35,
    coinReward: 25,
    quiz: {
      question: 'What is a reentrancy attack in smart contracts?',
      options: [
        'A type of phishing scam',
        'An attack where a function is called repeatedly before completing',
        'A denial of service attack',
        'A type of malware'
      ],
      correctAnswer: 1,
      explanation: 'A reentrancy attack exploits a vulnerability where an external call is made before updating the contract state, allowing an attacker to recursively call the function and drain funds.',
      difficulty: 'hard',
      xpBonus: 25,
      coinBonus: 15
    },
    comments: 445,
    likes: 678,
    shares: 189
  },
  {
    id: 'news_5',
    title: 'NFT Market Shows Signs of Recovery with 30% Volume Increase',
    summary: 'Digital art and collectibles market rebounds as major brands announce new Web3 initiatives.',
    content: `The NFT market is showing strong signs of recovery with trading volumes increasing by 30% over the past month, driven by renewed interest from major brands and innovative use cases.

Market highlights:
- Total volume: $2.1B in January
- Active wallets: Up 25%
- New collections: 1,500+ launched
- Average sale price: $350

Several factors are contributing to this resurgence:

1. Brand involvement: Nike, Adidas, and Starbucks have expanded their NFT programs, bringing mainstream attention back to the space.

2. Utility focus: Projects are shifting from pure speculation to offering real-world benefits, such as event access, merchandise, and community perks.

3. Gaming integration: Play-to-earn games are incorporating NFTs in more meaningful ways, creating genuine utility.

4. Technical improvements: Lower gas fees on Ethereum and the rise of Layer 2 solutions have made minting and trading more affordable.

Notable recent sales:
- Bored Ape #5234: $485,000
- CryptoPunk #7804: $623,000
- Azuki #9605: $234,000

Industry experts believe we're entering a more mature phase of the NFT market, where sustainable utility trumps speculative hype. This could lead to steadier growth and broader adoption.

New use cases emerging:
- Digital identity verification
- Ticketing and event management
- Intellectual property rights
- Supply chain tracking
- Gaming assets

While the market is far from its 2021 peak, the current recovery appears to be built on stronger fundamentals, suggesting potential for long-term viability.`,
    source: 'cointelegraph',
    category: 'nft',
    urgency: 'normal',
    impact: 'bullish',
    impactScore: 5,
    relatedCryptos: ['ETH', 'MATIC', 'SOL'],
    publishedAt: new Date('2024-01-15T13:45:00Z'),
    imageUrl: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800',
    readTime: 6,
    difficulty: 'beginner',
    keyTerms: ['NFT', 'Web3', 'Digital Collectibles', 'Utility', 'Gaming'],
    relatedLessons: ['nft_basics', 'web3_fundamentals'],
    xpReward: 22,
    coinReward: 15,
    quiz: {
      question: 'What is the main shift happening in the NFT market?',
      options: [
        'Moving to physical art only',
        'Focus on speculation',
        'Shift toward utility and real-world benefits',
        'Abandoning blockchain technology'
      ],
      correctAnswer: 2,
      explanation: 'The NFT market is maturing and shifting from pure speculation toward projects that offer real utility, such as event access, merchandise, community benefits, and gaming integration.',
      difficulty: 'easy',
      xpBonus: 10,
      coinBonus: 5
    },
    comments: 234,
    likes: 1123,
    shares: 345
  },
  {
    id: 'news_6',
    title: 'New Crypto Regulations Proposed in European Union',
    summary: 'EU lawmakers unveil comprehensive crypto asset framework aimed at consumer protection and market integrity.',
    content: `The European Union has proposed a comprehensive regulatory framework for cryptocurrency assets, marking one of the most significant regulatory developments in the space.

Key provisions include:

1. Licensing requirements:
   - Crypto exchanges must obtain EU-wide licenses
   - Minimum capital requirements
   - Regular audits and reporting

2. Consumer protections:
   - Mandatory risk disclosures
   - Cooling-off periods for purchases
   - Compensation schemes for losses

3. Stablecoin regulations:
   - Reserve requirements
   - Redemption guarantees
   - Audit transparency

4. DeFi oversight:
   - Guidelines for decentralized protocols
   - Developer accountability measures
   - Smart contract standards

The regulations aim to balance innovation with consumer protection, creating a "safe space" for crypto businesses to operate while protecting retail investors.

Industry reaction has been mixed:
- Major exchanges welcome clarity
- DeFi projects express concerns about compliance
- Consumer advocates praise protection measures
- Some fear over-regulation may stifle innovation

The framework is expected to be voted on in Q3 2024, with implementation beginning in 2025. If passed, it would create the world's most comprehensive crypto regulatory regime.

Impact on the market:
- Increased legitimacy
- Potential short-term volatility
- Long-term market stability
- Clearer business environment

This move by the EU could set a precedent for other jurisdictions considering crypto regulation, potentially influencing global standards.`,
    source: 'coindesk',
    category: 'regulation',
    urgency: 'important',
    impact: 'neutral',
    impactScore: 8,
    relatedCryptos: ['BTC', 'ETH', 'USDT', 'USDC'],
    publishedAt: new Date('2024-01-16T10:00:00Z'),
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
    readTime: 8,
    difficulty: 'intermediate',
    keyTerms: ['Regulation', 'MiCA', 'Compliance', 'Consumer Protection', 'Licensing'],
    relatedLessons: ['crypto_regulation', 'investing_safely'],
    xpReward: 28,
    coinReward: 18,
    quiz: {
      question: 'What is the main goal of the EU crypto regulations?',
      options: [
        'To ban all cryptocurrencies',
        'To balance innovation with consumer protection',
        'To increase taxes only',
        'To eliminate blockchain technology'
      ],
      correctAnswer: 1,
      explanation: 'The EU regulations aim to create a balanced framework that protects consumers while allowing the crypto industry to innovate and grow within clear legal guidelines.',
      difficulty: 'medium',
      xpBonus: 15,
      coinBonus: 8
    },
    comments: 312,
    likes: 876,
    shares: 267
  },
  {
    id: 'news_7',
    title: 'Bitcoin Mining Becomes More Eco-Friendly with Renewable Energy',
    summary: 'Latest report shows 55% of Bitcoin mining now powered by renewable energy sources.',
    content: `A comprehensive new study reveals that Bitcoin mining has made significant strides in environmental sustainability, with 55% of operations now powered by renewable energy sources.

The Bitcoin Mining Council's latest report highlights several positive trends:

Renewable energy adoption:
- Hydroelectric: 28%
- Wind: 15%
- Solar: 12%
- Other renewables: 5%

This represents a dramatic shift from just three years ago when renewables accounted for only 35% of the mining mix. Several factors have driven this change:

1. Economic incentives: Renewable energy is often cheaper, especially in regions with abundant natural resources.

2. Geographic shifts: Mining operations have moved to countries with excess renewable capacity, such as Iceland, Norway, and parts of Canada.

3. Technology improvements: Modern mining hardware is significantly more energy-efficient, using 30% less power per terahash.

4. Stranded energy utilization: Miners are increasingly using energy that would otherwise be wasted, such as flared natural gas or excess hydroelectric power.

Environmental impact:
- Carbon footprint reduced by 40%
- Estimated annual CO2 savings: 8 million tons
- Equivalent to removing 1.7 million cars from roads

Major mining companies are also setting ambitious sustainability targets:
- Marathon Digital: 100% renewable by 2026
- Riot Blockchain: 80% renewable by 2025
- Hut 8 Mining: Carbon neutral by 2024

Critics argue that any energy consumption for Bitcoin is wasteful, while proponents counter that Bitcoin provides valuable services and increasingly uses energy that would otherwise go unused.

The trend toward renewable energy is expected to continue as miners seek competitive advantages through lower electricity costs and improved public perception.`,
    source: 'binance',
    category: 'bitcoin',
    urgency: 'normal',
    impact: 'bullish',
    impactScore: 6,
    relatedCryptos: ['BTC'],
    publishedAt: new Date('2024-01-17T14:20:00Z'),
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    readTime: 6,
    difficulty: 'beginner',
    keyTerms: ['Bitcoin Mining', 'Renewable Energy', 'Sustainability', 'Carbon Footprint'],
    relatedLessons: ['bitcoin_basics', 'mining_explained'],
    xpReward: 24,
    coinReward: 16,
    quiz: {
      question: 'What percentage of Bitcoin mining now uses renewable energy?',
      options: [
        '25%',
        '35%',
        '55%',
        '75%'
      ],
      correctAnswer: 2,
      explanation: 'According to the latest Bitcoin Mining Council report, 55% of Bitcoin mining operations are now powered by renewable energy sources, marking significant progress in sustainability.',
      difficulty: 'easy',
      xpBonus: 10,
      coinBonus: 5
    },
    comments: 178,
    likes: 945,
    shares: 212
  },
  {
    id: 'news_8',
    title: 'Crypto Market Analysis: Bull Run Indicators Strengthen',
    summary: 'Multiple technical and fundamental indicators suggest the cryptocurrency market may be entering a sustained bull phase.',
    content: `Market analysts are observing a confluence of bullish indicators across the cryptocurrency landscape, suggesting the potential for a sustained upward trend in the coming months.

Technical indicators:
- Bitcoin 200-day MA: Golden cross confirmed
- RSI levels: Healthy 55-65 range
- On-chain metrics: Accumulation phase detected
- Exchange outflows: Up 35%

Fundamental drivers:

1. Institutional adoption:
   - Record ETF inflows: $2.3B in January
   - Corporate treasuries adding BTC
   - Pension funds exploring allocation

2. Regulatory clarity:
   - Positive developments in major markets
   - Framework certainty increasing
   - Compliance path becoming clearer

3. Technology improvements:
   - Network upgrades completed
   - Scaling solutions maturing
   - User experience enhancing

4. Macroeconomic factors:
   - Inflation concerns persist
   - Currency devaluation fears
   - Digital asset as hedge narrative

Historical patterns:
Looking at previous bull cycles, current market structure shows similarities to early stages of 2017 and 2020 rallies:
- Gradual accumulation phase
- Institutional interest growing
- Retail FOMO not yet peaked
- Technical breakouts occurring

Analyst predictions:
- Conservative: $75,000 BTC by year-end
- Moderate: $100,000 BTC in 2024
- Optimistic: $150,000+ in extended cycle

Risk factors to monitor:
- Regulatory surprises
- Macroeconomic shocks
- Security incidents
- Market manipulation

Key levels to watch:
- BTC support: $38,000
- BTC resistance: $52,000
- ETH support: $2,100
- ETH resistance: $3,200

While past performance doesn't guarantee future results, the current setup appears favorable for sustained growth. Investors are advised to maintain risk management practices and avoid over-leveraging.

The next few months will be critical in determining whether this marks the beginning of a new bull cycle or merely a relief rally within a longer consolidation period.`,
    source: 'cryptopanic',
    category: 'market',
    urgency: 'normal',
    impact: 'bullish',
    impactScore: 7,
    relatedCryptos: ['BTC', 'ETH', 'BNB', 'SOL'],
    publishedAt: new Date('2024-01-18T09:00:00Z'),
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    readTime: 7,
    difficulty: 'intermediate',
    keyTerms: ['Bull Run', 'Technical Analysis', 'On-chain Metrics', 'Institutional Adoption'],
    relatedLessons: ['market_analysis', 'trading_basics'],
    xpReward: 30,
    coinReward: 20,
    quiz: {
      question: 'What is a "golden cross" in technical analysis?',
      options: [
        'A new cryptocurrency',
        'When a short-term moving average crosses above a long-term moving average',
        'A type of trading platform',
        'A blockchain consensus mechanism'
      ],
      correctAnswer: 1,
      explanation: 'A golden cross occurs when a short-term moving average (like 50-day) crosses above a long-term moving average (like 200-day), often interpreted as a bullish signal.',
      difficulty: 'medium',
      xpBonus: 15,
      coinBonus: 8
    },
    comments: 267,
    likes: 1456,
    shares: 423
  }
];

export const getNewsArticle = (id: string): NewsArticle | undefined => {
  return newsArticles.find(article => article.id === id);
};

export const getNewsByCategory = (category: NewsCategory): NewsArticle[] => {
  return newsArticles.filter(article => article.category === category);
};

export const getNewsByUrgency = (urgency: NewsUrgency): NewsArticle[] => {
  return newsArticles.filter(article => article.urgency === urgency);
};

export const getTrendingNews = (): NewsArticle[] => {
  return [...newsArticles]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);
};

export const getBreakingNews = (): NewsArticle[] => {
  return newsArticles.filter(article => article.urgency === 'breaking');
};
