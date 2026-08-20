import { ProviderAdapter } from '../aiProviderGateway';
import { AIProvider, AIProviderResponse } from '../../types';
import crypto from 'crypto';

export class OpenAiCompatibleAdapter implements ProviderAdapter {
  private providerConfig: AIProvider;
  private baseUrl: string;

  constructor(provider: AIProvider) {
    this.providerConfig = provider;
    this.baseUrl = provider.base_url?.replace(/\/$/, '') || 'http://127.0.0.1:11434/v1';
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.providerConfig.secret_ref && this.providerConfig.secret_ref !== 'env:NONE') {
      const key = this.providerConfig.secret_ref.startsWith('env:') 
        ? process.env[this.providerConfig.secret_ref.substring(4)] 
        : this.providerConfig.secret_ref;
      
      if (key) {
        headers['Authorization'] = `Bearer ${key}`;
      }
    }
    return headers;
  }

  async list_models(): Promise<string[]> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) return [this.providerConfig.model];
      const data: any = await res.json();
      if (data && data.data && Array.isArray(data.data)) {
        return data.data.map((m: any) => m.id);
      }
      return [this.providerConfig.model];
    } catch {
      return [this.providerConfig.model];
    }
  }

  async health_check(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(3000)
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  }

  async chat(prompt: string, history?: any[], context?: any): Promise<AIProviderResponse> {
    const startTime = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.providerConfig.model,
          messages: [{ role: 'user', content: prompt }]
        }),
        signal: AbortSignal.timeout(this.providerConfig.timeout_seconds * 1000)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data: any = await res.json();
      
      return {
        provider_id: this.providerConfig.id,
        model: this.providerConfig.model,
        request_id: crypto.randomUUID(),
        output_text: data.choices?.[0]?.message?.content || '',
        input_tokens: data.usage?.prompt_tokens,
        output_tokens: data.usage?.completion_tokens,
        latency_ms: Date.now() - startTime,
        finish_reason: data.choices?.[0]?.finish_reason || 'STOP',
        routing_reason: 'DIRECT',
      };
    } catch (err: any) {
      const norm = this.normalize_error(err);
      throw new Error(`[${norm.code}] ${norm.message}`);
    }
  }

  async stream_chat(prompt: string, onChunk: (text: string) => void, history?: any[]): Promise<AIProviderResponse> {
    const startTime = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.providerConfig.model,
          messages: [{ role: 'user', content: prompt }],
          stream: true
        }),
        signal: AbortSignal.timeout(this.providerConfig.timeout_seconds * 1000)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        let done = false;
        while (!done) {
          const chunk = await reader.read();
          done = chunk.done;
          if (chunk.value) {
            const lines = decoder.decode(chunk.value, { stream: true }).split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.slice(6));
                  const textChunk = data.choices?.[0]?.delta?.content || '';
                  fullText += textChunk;
                  if (textChunk) onChunk(textChunk);
                } catch (e) {
                  // ignore parse error on partial chunks
                }
              }
            }
          }
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
      tools: false,
      json_schema: false,
      vision: false
    };
  }

  normalize_error(err: any): { code: string; message: string; } {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      return { code: 'PROVIDER_TIMEOUT', message: 'The request to the provider timed out.' };
    }
    if (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED')) {
      return { code: 'PROVIDER_UNREACHABLE', message: 'Could not connect to the provider endpoint.' };
    }
    return { code: 'OPENAI_COMPAT_ERROR', message: err.message };
  }

  estimate_usage(prompt: string): number {
    return Math.ceil(prompt.length / 4);
  }

  close(): void {}
}
