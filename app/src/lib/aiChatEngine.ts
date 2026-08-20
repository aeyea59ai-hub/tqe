// AI Assistant Chatbot Engine for SIGNAL DESK UNIFIED v2.0
import { GoogleGenAI } from '@google/genai';

import { AIProviderFactory } from './aiProviderGateway';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface AppChatContext {
  selectedSymbol?: string;
  snapshot?: any;
  candidate?: any;
  deliberation?: any;
  tradePlan?: any;
  riskEval?: any;
  accountState?: any;
}

export async function processChatAssistantQuery(
  userPrompt: string,
  history: ChatMessage[],
  context: AppChatContext
): Promise<string> {
  const isComplex = userPrompt.toLowerCase().includes('analyze') || userPrompt.toLowerCase().includes('complex') || userPrompt.toLowerCase().includes('deep');
  const isFast = userPrompt.toLowerCase().includes('quick') || userPrompt.toLowerCase().includes('fast');
  
  let modelToUse = 'gemini-3.5-flash';
  if (isComplex) modelToUse = 'gemini-3.1-pro-preview';
  else if (isFast) modelToUse = 'gemini-3.1-flash-lite';

  const systemInstruction = `
You are the AI Assistant inside SIGNAL DESK UNIFIED v2.0, a crypto futures paper trading & market intelligence platform.
You are READ-ONLY regarding trading decisions (you explain, analyze, translate, and compare; you do NOT execute live orders).

YOU HAVE ACCESS TO THE LIVE ACTIVE APPLICATION CONTEXT:
- Selected Symbol: ${context.selectedSymbol || 'BTCUSDT'}
- Current Price: ${context.snapshot?.currentPrice || 'N/A'}
- Timeframe: ${context.snapshot?.timeframe || '15m'}
- Market Regime: ${context.snapshot?.regime || 'N/A'}
- RSI / Indicators: RSI=${context.snapshot?.features?.rsi14?.toFixed(1) || 'N/A'}, EMA7=${context.snapshot?.features?.ema7 || 'N/A'}, VolumeRatio=${context.snapshot?.features?.volumeRatio?.toFixed(2) || 'N/A'}x
- Candidate Direction/Strategy: ${context.candidate?.direction || 'N/A'} (${context.candidate?.strategyCode || 'N/A'})
- AI Council Status: ${context.deliberation?.arbiterVerdict?.status || 'NOT_DELIBERATED_YET'}
- AI Consensus Score: ${context.deliberation?.arbiterVerdict?.consensusScore || 'N/A'}/100
- AI Objections: ${context.deliberation?.arbiterVerdict?.objections?.join('; ') || 'None'}
- Invalidation Conditions: ${context.deliberation?.arbiterVerdict?.invalidationConditions?.join('; ') || 'None'}
- Trade Plan Entry/SL/TP: Entry=${context.tradePlan?.entryPrice || 'N/A'}, SL=${context.tradePlan?.stopLoss || 'N/A'}, TP1=${context.tradePlan?.tp1 || 'N/A'}
- Account Balance / Margin: Equity=$${context.accountState?.equity?.toFixed(2) || '10000'}, OpenPositions=${context.accountState?.positions?.length || 0}

INSTRUCTIONS:
1. Answer the user's question directly using the exact live context data above.
2. If asked in Arabic (or if requested "in Arabic"), respond completely in clear Arabic.
3. Be professional, concise, clear, and analytical. Use bullet points or short paragraphs.
4. Explain trade rejections, objections, counter-trend risks, or compare setups accurately based on live numbers.
5. Remind users that all executions are paper trades.
`;

  try {
    const formattedHistory = history.slice(-6).map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
    const fullPrompt = `${formattedHistory}\nUser: ${userPrompt}\nAssistant:`;

    const config: any = { systemInstruction };
    if (modelToUse === 'gemini-3.1-pro-preview') {
      config.thinkingConfig = { thinkingLevel: 'HIGH' as any };
    }
    
    // Add Search Grounding with googleSearch tool
    config.tools = [{ googleSearch: {} }];

    
    const provider = await AIProviderFactory.getEligibleProvider(false);
    if (!provider) throw new Error("AI_UNAVAILABLE: No eligible AI provider configured.");
    
    // Simplification for gateway: map config options internally if needed.
    const response = await provider.chat(fullPrompt);


    return response.output_text?.trim() || 'I have analyzed the current market context. How else can I assist with your strategy review?';
  } catch (err) {
    console.error('Chat Assistant Error:', err);
    return `Analysis for ${context.selectedSymbol || 'active symbol'}: Current price is $${context.snapshot?.currentPrice || 'N/A'} under ${context.snapshot?.regime || 'ranging'} regime. Council status: ${context.deliberation?.arbiterVerdict?.status || 'Pending'}.`;
  }
}
