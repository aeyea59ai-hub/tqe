import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Cloud,
  Cpu,
  Gauge,
  Globe,
  HardDrive,
  Lock,
  Plus,
  RefreshCw,
  Server,
  Settings,
  ShieldCheck,
  Trash2,
  WifiOff,
} from 'lucide-react';
import { AIProvider, RoutingMode } from '../types';

const routingOptions: Array<{ id: RoutingMode; label: string; description: string }> = [
  { id: 'AUTO', label: 'Auto', description: 'Use the best healthy provider allowed by the current task.' },
  { id: 'LOCAL_ONLY', label: 'Local only', description: 'Keep prompts and memory on the phone runtime.' },
  { id: 'CLOUD_ONLY', label: 'Cloud only', description: 'Use configured cloud providers only.' },
  { id: 'PRIVACY_FIRST', label: 'Privacy first', description: 'Prefer local models and fall back only when policy allows.' },
];

function providerIcon(provider: AIProvider) {
  if (provider.privacy_class === 'LOCAL') return HardDrive;
  if (provider.provider_type === 'OLLAMA_CLOUD') return Cloud;
  return Globe;
}

export const SettingsProviders: React.FC = () => {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [routingMode, setRoutingMode] = useState<RoutingMode>('AUTO');
  const [loading, setLoading] = useState(true);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/v1/ai/providers');
      const data = await response.json();
      if (!data.success) return;
      setProviders(data.providers);
      setSelectedProviderId((current) => current || data.providers[0]?.id || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRouting = async () => {
    try {
      const response = await fetch('/api/v1/ai/routing');
      const data = await response.json();
      if (data.success) setRoutingMode(data.routing_mode);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void fetchProviders();
    void fetchRouting();
  }, []);

  const setRouting = async (mode: RoutingMode) => {
    try {
      await fetch('/api/v1/ai/routing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routing_mode: mode }),
      });
      setRoutingMode(mode);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      await fetch(`/api/v1/ai/providers/${id}`, { method: 'DELETE' });
      if (selectedProviderId === id) setSelectedProviderId(null);
      await fetchProviders();
    } catch (error) {
      console.error(error);
    }
  };

  const addPreset = async (type: 'Ollama' | 'Gemini' | 'Custom') => {
    let preset: Partial<AIProvider>;
    if (type === 'Ollama') {
      preset = {
        provider_type: 'OLLAMA_LOCAL',
        display_name: 'Ollama Local',
        enabled: true,
        priority: 10,
        base_url: 'http://127.0.0.1:11434/v1',
        model: 'llama3.2',
        privacy_class: 'LOCAL',
      };
    } else if (type === 'Gemini') {
      preset = {
        provider_type: 'GEMINI',
        display_name: 'Google Gemini',
        enabled: true,
        priority: 5,
        model: 'gemini-2.5-flash',
        secret_ref: 'env:GEMINI_API_KEY',
        privacy_class: 'CLOUD',
      };
    } else {
      preset = {
        provider_type: 'CUSTOM_OPENAI',
        display_name: 'Custom Provider',
        enabled: true,
        priority: 1,
        base_url: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
        privacy_class: 'CLOUD',
      };
    }

    try {
      await fetch('/api/v1/ai/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preset),
      });
      await fetchProviders();
    } catch (error) {
      console.error(error);
    }
  };

  const selectedProvider =
    providers.find((provider) => provider.id === selectedProviderId) || providers[0] || null;
  const healthyProviders = providers.filter((provider) => provider.health_status === 'HEALTHY').length;
  const localProviders = providers.filter((provider) => provider.privacy_class === 'LOCAL').length;

  return (
    <div className="space-y-4 font-mono text-xs text-slate-100">
      <section className="grid grid-cols-2 border border-slate-800/90 bg-[#0a0f19] lg:grid-cols-4">
        {[
          { label: 'Configured', value: providers.length, detail: 'Model provider records', icon: Settings, tone: 'text-slate-100' },
          { label: 'Healthy', value: healthyProviders, detail: 'Available to the router', icon: CheckCircle2, tone: 'text-emerald-300' },
          { label: 'Local', value: localProviders, detail: 'Phone/private runtime', icon: HardDrive, tone: 'text-cyan-300' },
          { label: 'Routing', value: routingMode.replaceAll('_', ' '), detail: 'Current model policy', icon: Gauge, tone: 'text-amber-300' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="border-r border-slate-800/80 p-4 last:border-r-0">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-600">{item.label}</span>
                <Icon className="h-4 w-4 text-slate-700" />
              </div>
              <div className={`mt-2 truncate text-sm font-black ${item.tone}`}>{item.value}</div>
              <div className="mt-1 text-[9px] text-slate-600">{item.detail}</div>
            </article>
          );
        })}
      </section>

      <section className="border border-cyan-500/20 bg-cyan-500/[0.035] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.15em] text-cyan-100">Local AI ready architecture</div>
              <div className="mt-1 max-w-3xl text-[10px] leading-relaxed text-slate-500">
                Ollama on <span className="font-mono text-slate-300">127.0.0.1:11434</span> is the preferred private provider for the Termux deployment. Provider changes do not alter scanner, strategy, risk or paper-engine authority.
              </div>
            </div>
          </div>
          <button
            onClick={() => addPreset('Ollama')}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-[10px] font-black text-cyan-200 hover:bg-cyan-500/15"
          >
            <Server className="h-3.5 w-3.5" /> Add Ollama Local
          </button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)_330px]">
        <aside className="h-fit border border-slate-800/90 bg-[#0a0f19]">
          <div className="border-b border-slate-800/90 px-4 py-3">
            <div className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-600">Model policy</div>
            <div className="mt-1 text-xs font-black text-slate-100">Routing mode</div>
          </div>
          <div className="space-y-1 p-2">
            {routingOptions.map((option) => {
              const active = routingMode === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setRouting(option.id)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left ${
                    active
                      ? 'border-cyan-500/30 bg-cyan-500/10'
                      : 'border-transparent hover:border-slate-800 hover:bg-slate-900/70'
                  }`}
                >
                  <div className={`text-[10px] font-black ${active ? 'text-cyan-200' : 'text-slate-300'}`}>{option.label}</div>
                  <div className="mt-1 text-[9px] leading-snug text-slate-600">{option.description}</div>
                </button>
              );
            })}
          </div>
          <div className="border-t border-slate-800/90 p-3 text-[9px] leading-relaxed text-slate-600">
            <Lock className="mr-1 inline h-3 w-3" />
            Private tasks must remain local when the routing policy requires it.
          </div>
        </aside>

        <section className="min-w-0 border border-slate-800/90 bg-[#0a0f19]">
          <div className="flex flex-col gap-3 border-b border-slate-800/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">Provider registry</div>
              <div className="mt-0.5 text-[9px] text-slate-600">Select a provider to inspect its runtime details.</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => addPreset('Gemini')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-[9px] font-bold text-slate-400 hover:text-slate-100"><Globe className="h-3.5 w-3.5" /> Gemini</button>
              <button onClick={() => addPreset('Custom')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-[9px] font-bold text-slate-400 hover:text-slate-100"><Plus className="h-3.5 w-3.5" /> Custom</button>
            </div>
          </div>

          {loading ? (
            <div className="grid min-h-64 place-items-center text-slate-600">Loading provider registry…</div>
          ) : providers.length ? (
            <div className="divide-y divide-slate-800/70">
              {providers.map((provider) => {
                const Icon = providerIcon(provider);
                const active = selectedProvider?.id === provider.id;
                const healthy = provider.health_status === 'HEALTHY';
                return (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProviderId(provider.id)}
                    className={`grid w-full grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left ${
                      active ? 'bg-cyan-500/[0.06]' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className={`grid h-9 w-9 place-items-center rounded-md border ${provider.privacy_class === 'LOCAL' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' : 'border-violet-500/30 bg-violet-500/10 text-violet-300'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-[10px] font-black text-slate-200">{provider.display_name}</span>
                        <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[8px] font-black text-slate-500">{provider.privacy_class}</span>
                      </div>
                      <div className="mt-1 truncate text-[9px] text-slate-600">{provider.model} · Priority {provider.priority}</div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-[9px] font-bold ${healthy ? 'text-emerald-300' : 'text-slate-600'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${healthy ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                      {provider.health_status}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center px-6 text-center">
              <div>
                <WifiOff className="mx-auto h-7 w-7 text-slate-700" />
                <div className="mt-3 text-xs font-black text-slate-300">No AI providers configured</div>
                <div className="mt-1 text-[10px] text-slate-600">Add Ollama Local for a private on-phone model runtime.</div>
              </div>
            </div>
          )}
        </section>

        <aside className="h-fit border border-slate-800/90 bg-[#0a0f19]">
          <div className="border-b border-slate-800/90 px-4 py-3">
            <div className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-600">Provider inspector</div>
            <div className="mt-1 truncate text-xs font-black text-slate-100">{selectedProvider?.display_name || 'No provider selected'}</div>
          </div>
          {selectedProvider ? (
            <div>
              <dl className="divide-y divide-slate-800/70 px-4">
                {[
                  ['Type', selectedProvider.provider_type],
                  ['Model', selectedProvider.model],
                  ['Priority', String(selectedProvider.priority)],
                  ['Privacy', selectedProvider.privacy_class],
                  ['Streaming', selectedProvider.streaming_enabled ? 'Enabled' : 'Disabled'],
                  ['Tools', selectedProvider.supports_tools ? 'Supported' : 'Unavailable'],
                  ['Latency', `${selectedProvider.average_latency_ms || 0} ms`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-[9px] text-slate-600">{label}</dt>
                    <dd className="max-w-[190px] truncate text-right font-mono text-[9px] font-bold text-slate-300">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="space-y-2 border-t border-slate-800/90 p-3">
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-[9px] font-bold text-slate-300 hover:border-slate-700">
                  <RefreshCw className="h-3.5 w-3.5" /> Test connection
                </button>
                <button
                  onClick={() => deleteProvider(selectedProvider.id)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2 text-[9px] font-bold text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove provider
                </button>
              </div>
            </div>
          ) : (
            <div className="grid min-h-52 place-items-center px-5 text-center text-[10px] text-slate-600">Select a provider to inspect its model and capability state.</div>
          )}
          <div className="border-t border-slate-800/90 p-3 text-[9px] leading-relaxed text-slate-600">
            <ShieldCheck className="mr-1 inline h-3 w-3" />
            Trading calculations remain outside the model provider.
          </div>
        </aside>
      </div>
    </div>
  );
};
