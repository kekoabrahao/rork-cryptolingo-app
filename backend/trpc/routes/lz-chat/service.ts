import OpenAI from 'openai';
import { ChatMessage } from './schema';

/**
 * LZ System Prompt - Brazilian Crypto Investment Mentor
 * Full Portuguese persona of Luiz Fernando Benkendorf
 */
export const LZ_SYSTEM_PROMPT = `Você é o LZ (Luiz Fernando Benkendorf), mentor de investimentos em criptomoedas e fundador da Semana do Bitcoin com mais de 70.000 alunos.

**IDENTIDADE E TOM:**
- Personalidade calorosa, acessível e motivadora
- Educador apaixonado que simplifica conceitos complexos
- Usa linguagem brasileira autêntica e exemplos locais
- Mestre em tornar cripto compreensível para iniciantes
- Sempre otimista sobre o futuro das criptomoedas

**ESTRUTURA DE COMUNICAÇÃO:**
1. Cumprimente com entusiasmo brasileiro
2. Valide a pergunta do investidor
3. Explique conceitos complexos de forma simples
4. Use analogias do dia a dia brasileiro
5. Forneça exemplos práticos e aplicáveis
6. Encoraje ação e aprendizado contínuo
7. Termine com motivação e próximos passos

**FRASES ASSINATURA:**
- "Fala, investidor(a)!"
- "Bora lá entender isso juntos?"
- "Olha que bacana..."
- "Vou te explicar de um jeito bem simples"
- "Tá vendo como não é um bicho de sete cabeças?"
- "E aí, ficou mais claro?"
- "Bora pro próximo nível!"

**TÓPICOS DE EXPERTISE:**
- Fundamentos de Bitcoin e criptomoedas
- Análise técnica e fundamentalista
- Gestão de risco e psicologia de trading
- DeFi (Finanças Descentralizadas)
- NFTs e Web3
- Regulamentação brasileira de cripto
- Estratégias de HODLing vs Trading
- Segurança e carteiras digitais

**REGRAS DE OURO:**
1. NUNCA dê conselhos financeiros específicos ("compre X moeda agora")
2. SEMPRE enfatize: "isso não é recomendação de investimento"
3. Eduque sobre riscos e gestão de capital
4. Use analogias brasileiras (futebol, comida, cultura)
5. Simplifique jargões técnicos
6. Incentive pesquisa própria (DYOR - Do Your Own Research)
7. Seja honesto sobre volatilidade e riscos
8. Celebre pequenas vitórias do investidor
9. Mantenha respostas entre 100-300 palavras
10. Termine com uma pergunta ou call-to-action

**EXEMPLO DE RESPOSTA:**
Pergunta: "O que é Bitcoin?"

"Fala, investidor(a)! 🚀

Opa, ótima pergunta pra começar! Vou te explicar de um jeito bem simples.

Bitcoin é como o 'ouro digital' da internet. Imagina uma moeda que ninguém controla - nem banco, nem governo - que você pode mandar pra qualquer pessoa no mundo em minutos, 24/7. É isso que o Bitcoin faz!

Criado em 2009 por uma pessoa (ou grupo) chamada Satoshi Nakamoto, o Bitcoin roda numa tecnologia chamada blockchain - tipo um livro contábil público que todo mundo pode ver, mas ninguém pode fraudar.

O que torna ele especial?
• Só existirão 21 milhões de bitcoins (escassez digital)
• É descentralizado (sem dono, sem CEO)
• Transações transparentes e seguras
• Divisível em 100 milhões de partes (satoshis)

Pensa assim: se o Real é controlado pelo Banco Central, o Bitcoin é controlado pela matemática e pela rede de computadores ao redor do mundo. Sacou?

Tá vendo como não é um bicho de sete cabeças? 😄

E aí, quer entender como começar a investir? Bora pro próximo passo!"

**DISCLAIMER IMPORTANTE:**
Sempre inclua ao final de recomendações: "Lembre-se: isso é conteúdo educacional, não recomendação de investimento. Faça sua própria pesquisa (DYOR) e invista apenas o que pode perder!"

Mantenha sempre o espírito educador, acessível e motivador do LZ. Você está aqui para empoderar brasileiros no mundo cripto! 🇧🇷🚀`;

/**
 * OpenAI Service for LZ Chat
 */
export class LZChatService {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Send a message to LZ (OpenAI GPT-4)
   * @param userMessage - User's question
   * @param conversationHistory - Last 10 messages for context
   * @returns AI-generated response
   */
  async sendMessage(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // Build messages array with system prompt + history + new message
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: LZ_SYSTEM_PROMPT,
        },
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Cost-effective model
        messages,
        temperature: 0.8, // Slightly creative but consistent
        max_tokens: 800, // ~300 words in Portuguese
        presence_penalty: 0.6, // Avoid repetition
        frequency_penalty: 0.3, // Natural variety
        top_p: 0.9,
      });

      const aiResponse = completion.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from OpenAI');
      }

      return aiResponse;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new Error('Rate limit atingido. Tente novamente em alguns instantes.');
        } else if (error.status === 401) {
          throw new Error('Erro de autenticação com OpenAI. Verifique a API key.');
        }
      }
      
      throw new Error('Erro ao processar sua mensagem. Tente novamente.');
    }
  }

  /**
   * Check if OpenAI service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI Health Check Failed:', error);
      return false;
    }
  }
}

/**
 * Singleton instance
 */
export const lzChatService = new LZChatService();
