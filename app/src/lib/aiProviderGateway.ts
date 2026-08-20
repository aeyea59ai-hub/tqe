import { AIProvider, AIProviderResponse, RoutingMode } from '../types';
import { db } from './db';
import crypto from 'crypto';

import { GeminiAdapter } from './adapters/geminiAdapter';
import { OpenAiCompatibleAdapter } from './adapters/openAiCompatibleAdapter';

export class AIProviderFactory {
  static createAdapter(provider: AIProvider): ProviderAdapter {
    switch (provider.provider_type) {
      case 'GEMINI':
        return new GeminiAdapter(provider);
      case 'OPENAI':
      case 'CUSTOM_OPENAI':
      case 'OLLAMA_LOCAL':
      case 'LLAMACPP_LOCAL':
      case 'OLLAMA_CLOUD':
      case 'KIMI_CLOUD':
      case 'MOCK':
      default:
        return new OpenAiCompatibleAdapter(provider);
    }
  }

  static async getEligibleProvider(privacyRequired: boolean): Promise<ProviderAdapter | null> {
    const providers = AIProviderGateway.getProviders();
    const routingMode = AIProviderGateway.getRoutingMode();
    
    let candidates = providers.filter(p => p.enabled);

    if (routingMode === 'LOCAL_ONLY') {
      candidates = candidates.filter(p => p.privacy_class === 'LOCAL');
    } else if (routingMode === 'CLOUD_ONLY') {
      candidates = candidates.filter(p => p.privacy_class === 'CLOUD');
    } else if (privacyRequired || routingMode === 'PRIVACY_FIRST') {
      const localCandidates = candidates.filter(p => p.privacy_class === 'LOCAL');
      if (localCandidates.length > 0) {
        candidates = localCandidates;
      }
    }

    if (candidates.length === 0) return null;
    
    // Sort by priority
    candidates.sort((a, b) => b.priority - a.priority);

    // Naive selection for now, could be improved with health checks and fallbacks
    return this.createAdapter(candidates[0]);
  }
}


export interface ProviderAdapter {
  list_models(): Promise<string[]>;
  health_check(): Promise<boolean>;
  chat(prompt: string, history?: any[], context?: any): Promise<AIProviderResponse>;
  stream_chat(prompt: string, onChunk: (text: string) => void, history?: any[]): Promise<AIProviderResponse>;
  capabilities(): Record<string, boolean>;
  normalize_error(err: any): { code: string, message: string };
  estimate_usage(prompt: string): number;
  close(): void;
}

export class AIProviderGateway {
  static getProviders(): AIProvider[] {
    const stmt = db.prepare('SELECT * FROM ai_providers ORDER BY priority DESC');
    const rows = stmt.all() as any[];
    return rows.map(r => ({
      ...r,
      enabled: r.enabled === 1,
      streaming_enabled: r.streaming_enabled === 1,
      supports_chat: r.supports_chat === 1,
      supports_tools: r.supports_tools === 1,
      supports_json_schema: r.supports_json_schema === 1,
      supports_vision: r.supports_vision === 1,
      supports_embeddings: r.supports_embeddings === 1,
    }));
  }

  static getRoutingMode(): RoutingMode {
    const stmt = db.prepare("SELECT routing_mode FROM ai_routing_policy WHERE id = 'default'");
    const res = stmt.get() as { routing_mode: RoutingMode };
    return res ? res.routing_mode : 'AUTO';
  }

  static addProvider(provider: Partial<AIProvider>) {
    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO ai_providers (
        id, provider_type, display_name, enabled, priority, base_url, model, secret_ref,
        routing_eligibility, privacy_class, timeout_seconds, max_retries, streaming_enabled,
        supports_chat, supports_tools, supports_json_schema, supports_vision, supports_embeddings,
        context_window, max_output_tokens, health_status, created_at_utc, updated_at_utc
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    
    const now = new Date().toISOString();
    stmt.run(
      id, provider.provider_type, provider.display_name, provider.enabled ? 1 : 0, 
      provider.priority || 0, provider.base_url, provider.model, provider.secret_ref,
      provider.routing_eligibility || 'ALL', provider.privacy_class || 'CLOUD',
      provider.timeout_seconds || 30, provider.max_retries || 2, provider.streaming_enabled ? 1 : 0,
      provider.supports_chat ? 1 : 0, provider.supports_tools ? 1 : 0, provider.supports_json_schema ? 1 : 0,
      provider.supports_vision ? 1 : 0, provider.supports_embeddings ? 1 : 0,
      provider.context_window || 8192, provider.max_output_tokens || 4096, 
      'UNKNOWN', now, now
    );
    return id;
  }
}

