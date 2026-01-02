// Quiz Generator for CryptoLingo News Articles
import { NewsQuiz, QuizQuestion, ArticleAnalysis, QuizGenerationConfig, DEFAULT_QUIZ_CONFIG } from '@/types/quiz';
import { NewsArticle } from '@/types/news';

/**
 * Generates a quiz from a news article using text analysis
 */
export function generateQuizFromArticle(
  article: NewsArticle,
  config: QuizGenerationConfig = DEFAULT_QUIZ_CONFIG
): NewsQuiz {
  // Analyze article content
  const analysis = analyzeArticleContent(article);
  
  // Generate questions based on analysis
  const questions = generateQuestions(article, analysis, config);
  
  return {
    id: `quiz_${article.id}_${Date.now()}`,
    newsId: article.id,
    questions,
    createdAt: new Date().toISOString(),
    generatedBy: 'template', // Would be 'ai' if using GPT API
  };
}

/**
 * Analyzes article content to extract entities, sentiment, and key facts
 */
function analyzeArticleContent(article: NewsArticle): ArticleAnalysis {
  const content = `${article.title} ${article.content}`.toLowerCase();
  
  // Extract prices (e.g., $50,000, 50k, 50000)
  const priceRegex = /\$?\d+[,\.]?\d*k?\s*(thousand|million|billion)?/gi;
  const priceMatches = content.match(priceRegex) || [];
  const prices = priceMatches.map(match => ({
    currency: 'USD',
    value: parsePriceString(match),
    context: match,
  }));
  
  // Extract crypto names
  const cryptoNames = ['bitcoin', 'btc', 'ethereum', 'eth', 'cardano', 'ada', 
                       'solana', 'sol', 'ripple', 'xrp', 'dogecoin', 'doge'];
  const foundCryptos = cryptoNames.filter(crypto => content.includes(crypto));
  
  // Extract countries/organizations
  const organizations = extractCapitalizedWords(article.content)
    .filter(word => word.length > 3 && !cryptoNames.includes(word.toLowerCase()));
  
  // Sentiment analysis (simple keyword-based)
  const sentiment = analyzeSentiment(content);
  
  // Extract percentages
  const percentageRegex = /\d+(\.\d+)?%/g;
  const percentages = content.match(percentageRegex) || [];
  
  return {
    entities: [
      ...foundCryptos.map(crypto => ({
        text: crypto,
        type: 'crypto' as const,
        confidence: 0.9,
      })),
      ...percentages.map(pct => ({
        text: pct,
        type: 'percentage' as const,
        confidence: 0.95,
      })),
    ],
    sentiment,
    keyFacts: extractKeyFacts(article.content),
    prices,
    dates: extractDates(article.content),
    locations: extractLocations(article.content),
    organizations: organizations.slice(0, 5),
  };
}

/**
 * Generates quiz questions based on article analysis
 */
function generateQuestions(
  article: NewsArticle,
  analysis: ArticleAnalysis,
  config: QuizGenerationConfig
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  
  // Question 1: Sentiment question (always included)
  questions.push(generateSentimentQuestion(article, analysis));
  
  // Question 2: Price/Entity question
  if (analysis.prices.length > 0) {
    questions.push(generatePriceQuestion(article, analysis));
  } else if (analysis.entities.length > 0) {
    questions.push(generateEntityQuestion(article, analysis));
  } else {
    questions.push(generateFactQuestion(article, analysis));
  }
  
  // Question 3: Concept/Fact question
  if (analysis.organizations.length > 0) {
    questions.push(generateOrganizationQuestion(article, analysis));
  } else {
    questions.push(generateConceptQuestion(article, analysis));
  }
  
  return questions.slice(0, config.numQuestions);
}

/**
 * Generates a sentiment analysis question
 */
function generateSentimentQuestion(article: NewsArticle, analysis: ArticleAnalysis): QuizQuestion {
  const correctSentiment = analysis.sentiment;
  const sentimentOptions = ['bullish', 'bearish', 'neutral'];
  
  return {
    id: `q_sentiment_${Date.now()}`,
    question: 'Qual é o sentimento principal desta notícia?',
    options: sentimentOptions.map(sentiment => ({
      id: sentiment,
      text: sentiment === 'bullish' ? '📈 Otimista (Bullish)' 
          : sentiment === 'bearish' ? '📉 Pessimista (Bearish)'
          : '➡️ Neutro',
      isCorrect: sentiment === correctSentiment,
    })),
    correctAnswerId: correctSentiment,
    explanation: `Esta notícia tem um tom ${
      correctSentiment === 'bullish' ? 'otimista, indicando movimentos positivos no mercado' 
      : correctSentiment === 'bearish' ? 'pessimista, indicando preocupações ou quedas no mercado'
      : 'neutro, apresentando fatos sem viés emocional'
    }.`,
    difficulty: 'easy',
    category: 'sentiment',
  };
}

/**
 * Generates a price-related question
 */
function generatePriceQuestion(article: NewsArticle, analysis: ArticleAnalysis): QuizQuestion {
  const mainPrice = analysis.prices[0];
  const distractors = generatePriceDistractors(mainPrice.value);
  
  return {
    id: `q_price_${Date.now()}`,
    question: 'Qual foi o preço mencionado na notícia?',
    options: [
      {
        id: 'correct',
        text: `$${formatPrice(mainPrice.value)}`,
        isCorrect: true,
      },
      ...distractors.map((price, idx) => ({
        id: `distractor_${idx}`,
        text: `$${formatPrice(price)}`,
        isCorrect: false,
      })),
    ].sort(() => Math.random() - 0.5), // Shuffle options
    correctAnswerId: 'correct',
    explanation: `O preço correto mencionado foi $${formatPrice(mainPrice.value)}.`,
    difficulty: 'medium',
    category: 'price',
  };
}

/**
 * Generates an entity-related question
 */
function generateEntityQuestion(article: NewsArticle, analysis: ArticleAnalysis): QuizQuestion {
  const mainEntity = analysis.entities[0];
  const entityType = mainEntity.type === 'crypto' ? 'criptomoeda' : 'entidade';
  
  const cryptoOptions = ['Bitcoin', 'Ethereum', 'Cardano', 'Solana', 'Ripple'];
  const correctCrypto = capitalizeFirst(mainEntity.text);
  const distractors = cryptoOptions.filter(c => c !== correctCrypto).slice(0, 3);
  
  return {
    id: `q_entity_${Date.now()}`,
    question: `Qual ${entityType} foi mencionada na notícia?`,
    options: [
      {
        id: 'correct',
        text: correctCrypto,
        isCorrect: true,
      },
      ...distractors.map((crypto, idx) => ({
        id: `distractor_${idx}`,
        text: crypto,
        isCorrect: false,
      })),
    ].sort(() => Math.random() - 0.5),
    correctAnswerId: 'correct',
    explanation: `A ${entityType} principal mencionada foi ${correctCrypto}.`,
    difficulty: 'easy',
    category: 'entity',
  };
}

/**
 * Generates an organization-related question
 */
function generateOrganizationQuestion(article: NewsArticle, analysis: ArticleAnalysis): QuizQuestion {
  const mainOrg = analysis.organizations[0];
  const allOrgs = ['SEC', 'BlackRock', 'Coinbase', 'Binance', 'Federal Reserve'];
  const distractors = allOrgs.filter(org => org !== mainOrg).slice(0, 3);
  
  return {
    id: `q_org_${Date.now()}`,
    question: 'Qual empresa ou organização foi mencionada?',
    options: [
      {
        id: 'correct',
        text: mainOrg,
        isCorrect: true,
      },
      ...distractors.map((org, idx) => ({
        id: `distractor_${idx}`,
        text: org,
        isCorrect: false,
      })),
    ].sort(() => Math.random() - 0.5),
    correctAnswerId: 'correct',
    explanation: `A organização mencionada foi ${mainOrg}.`,
    difficulty: 'medium',
    category: 'entity',
  };
}

/**
 * Generates a fact-based question
 */
function generateFactQuestion(article: NewsArticle, analysis: ArticleAnalysis): QuizQuestion {
  const facts = [
    'A notícia fala sobre aprovação de ETF',
    'A notícia menciona regulamentação',
    'A notícia discute adoção institucional',
    'A notícia aborda tecnologia blockchain',
  ];
  
  return {
    id: `q_fact_${Date.now()}`,
    question: 'Qual é o tema principal desta notícia?',
    options: facts.map((fact, idx) => ({
      id: `option_${idx}`,
      text: fact,
      isCorrect: idx === 0, // First option is correct (simplified)
    })),
    correctAnswerId: 'option_0',
    explanation: 'Esta notícia aborda principalmente este tema.',
    difficulty: 'medium',
    category: 'fact',
  };
}

/**
 * Generates a concept-based question
 */
function generateConceptQuestion(article: NewsArticle, analysis: ArticleAnalysis): QuizQuestion {
  const concepts = [
    { concept: 'DeFi', desc: 'Finanças Descentralizadas' },
    { concept: 'NFT', desc: 'Token Não Fungível' },
    { concept: 'Blockchain', desc: 'Tecnologia de registro distribuído' },
    { concept: 'Smart Contract', desc: 'Contrato inteligente auto-executável' },
  ];
  
  const selectedConcept = concepts[0];
  
  return {
    id: `q_concept_${Date.now()}`,
    question: 'Qual conceito é mais relevante para esta notícia?',
    options: concepts.map((c, idx) => ({
      id: `concept_${idx}`,
      text: `${c.concept} - ${c.desc}`,
      isCorrect: idx === 0,
    })),
    correctAnswerId: 'concept_0',
    explanation: `O conceito principal é ${selectedConcept.concept}: ${selectedConcept.desc}.`,
    difficulty: 'hard',
    category: 'concept',
  };
}

// Helper functions

function parsePriceString(priceStr: string): number {
  const cleaned = priceStr.replace(/[$,]/g, '').toLowerCase();
  let value = parseFloat(cleaned);
  
  if (cleaned.includes('k') || cleaned.includes('thousand')) {
    value *= 1000;
  } else if (cleaned.includes('m') || cleaned.includes('million')) {
    value *= 1000000;
  } else if (cleaned.includes('b') || cleaned.includes('billion')) {
    value *= 1000000000;
  }
  
  return value;
}

function formatPrice(price: number): string {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)}B`;
  } else if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(1)}K`;
  }
  return price.toFixed(2);
}

function generatePriceDistractors(correctPrice: number): number[] {
  return [
    correctPrice * 0.8,
    correctPrice * 1.2,
    correctPrice * 1.5,
  ];
}

function extractCapitalizedWords(text: string): string[] {
  const words = text.match(/[A-Z][a-z]+/g) || [];
  return [...new Set(words)];
}

function extractKeyFacts(content: string): string[] {
  const sentences = content.split(/[.!?]+/);
  return sentences.slice(0, 3).map(s => s.trim());
}

function extractDates(content: string): Array<{ date: string; context: string }> {
  const dateRegex = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/g;
  const matches = content.match(dateRegex) || [];
  return matches.map(date => ({ date, context: date }));
}

function extractLocations(content: string): string[] {
  const commonLocations = ['EUA', 'Brasil', 'China', 'Europa', 'Japão', 'Reino Unido'];
  return commonLocations.filter(loc => content.includes(loc));
}

function analyzeSentiment(content: string): 'bullish' | 'bearish' | 'neutral' {
  const bullishWords = ['alta', 'sobe', 'cresce', 'lucro', 'ganho', 'positivo', 'aprovação', 'sucesso'];
  const bearishWords = ['queda', 'cai', 'perda', 'negativo', 'risco', 'rejeição', 'falha', 'proibição'];
  
  const bullishCount = bullishWords.filter(word => content.includes(word)).length;
  const bearishCount = bearishWords.filter(word => content.includes(word)).length;
  
  if (bullishCount > bearishCount) return 'bullish';
  if (bearishCount > bullishCount) return 'bearish';
  return 'neutral';
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
