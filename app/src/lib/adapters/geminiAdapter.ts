import { GoogleGenAI } from '@google/genai';
import { ProviderAdapter } from '../aiProviderGateway';
import { AIProvider, AIProviderResponse } from '../../types';
import crypto from 'crypto';

export class GeminiAdapter implements ProviderAdapter {
  private ai: GoogleGenAI;
  private providerConfig: AIProvider;

  constructor(provider: AIProvider) {
    this.providerConfig = provider;
    // secret_ref would typically be a reference to an env var or secure vault
    // for this adapter, we assume secret_ref contains the API key directly (for MVP) 
    // or points to process.env.GEMINI_API_KEY
    const apiKey = provider.secret_ref === 'env:GEMINI_API_KEY' ? process.env.GEMINI_API_KEY : provider.secret_ref;
    
    this.ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  }

  async list_models(): Promise<string[]> {
    return ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];
  }

  async health_check(): Promise<boolean> {
    try {
      // Lightest call possible to check auth
      await this.ai.models.generateContent({
        model: this.providerConfig.model || 'gemini-2.5-flash',
        contents: 'Hi',
        config: { maxOutputTokens: 1 }
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  async chat(prompt: string, history?: any[], context?: any): Promise<AIProviderResponse> {
    const startTime = Date.now();
    try {
      const response = await this.ai.models.generateContent({
        model: this.providerConfig.model || 'gemini-2.5-flash',
        contents: prompt,
        // Incorporate history if needed (simplified for adapter contract)
      });
      
      const latency = Date.now() - startTime;
      
      return {
        provider_id: this.providerConfig.id,
        model: this.providerConfig.model,
        request_id: crypto.randomUUID(),
        output_text: response.text || '',
        latency_ms: latency,
        finish_reason: 'STOP',
        routing_reason: 'DIRECT',
      };
    } catch (err: any) {
      const normError = this.normalize_error(err);
      throw new Error(`[${normError.code}] ${normError.message}`);
    }
  }

  async stream_chat(prompt: string, onChunk: (text: string) => void, history?: any[]): Promise<AIProviderResponse> {
    const startTime = Date.now();
    try {
      const responseStream = await this.ai.models.generateContentStream({
        model: this.providerConfig.model || 'gemini-2.5-flash',
        contents: prompt,
      });

      let fullText = '';
      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullText += chunk.text;
          onChunk(chunk.text);
        }
      }

      return {
        provider_id: this.providerConfig.id,
        model: this.providerConfig.model,
        request_id: crypto.randomUUID(),
        output_text: fullText,
        latency_ms: Date.now() - startTime,
        finish_reason: 'STOP',
        routing_reason: 'DIRECT',
      };
    } catch (err: any) {
      throw new Error(this.normalize_error(err).message);
    }
  }

  capabilities(): Record<string, boolean> {
    return {
      chat: true,
      streaming: true,
      tools: true,
      json_schema: true,
      vision: true
    };
  }

  normalize_error(err: any): { code: string; message: string; } {
    const msg = err?.message || 'Unknown Gemini Error';
    return { code: 'GEMINI_ERROR', message: msg };
  }

  estimate_usage(prompt: string): number {
    return Math.ceil(prompt.length / 4);
  }

  close(): void {}
}
