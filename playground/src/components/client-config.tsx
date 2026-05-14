import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, PanelLeftClose, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  CLIENT_NAMES,
  CLIENT_PRESETS,
  PLATFORM_LABELS,
  PROVIDER_META,
  groupClientsByProvider
} from '@/lib/caniemail-types';

interface ClientConfigProps {
  enabledClients: Set<string>;
  onToggleClient: (client: string) => void;
  onApplyPreset: (clients: readonly string[]) => void;
  onReset: () => void;
  onCollapse: () => void;
}

function setsMatch(a: Set<string>, b: readonly string[]): boolean {
  if (a.size !== b.length) return false;
  for (const item of b) if (!a.has(item)) return false;
  return true;
}

export function ClientConfig({
  enabledClients,
  onToggleClient,
  onApplyPreset,
  onReset,
  onCollapse
}: ClientConfigProps) {
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());

  const groups = groupClientsByProvider([...CLIENT_NAMES]);
  const totalEnabled = enabledClients.size;
  const totalClients = CLIENT_NAMES.length;

  const activePresetId = useMemo(
    () => CLIENT_PRESETS.find((p) => setsMatch(enabledClients, p.clients))?.id,
    [enabledClients]
  );

  const toggleProvider = (provider: string) => {
    setExpandedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(provider)) {
        next.delete(provider);
      } else {
        next.add(provider);
      }
      return next;
    });
  };

  const toggleAllInProvider = (provider: string) => {
    const providerClients = groups.get(provider) ?? [];
    const allEnabled = providerClients.every((c) => enabledClients.has(c.fullName));
    for (const client of providerClients) {
      if (allEnabled && enabledClients.has(client.fullName)) {
        onToggleClient(client.fullName);
      } else if (!allEnabled && !enabledClients.has(client.fullName)) {
        onToggleClient(client.fullName);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Email Clients</h3>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {totalEnabled}/{totalClients}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="h-7 w-7 p-0"
            aria-label="Collapse panel"
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
            Presets
          </div>
          <div className="flex flex-wrap gap-1">
            {CLIENT_PRESETS.map((preset) => {
              const isActive = preset.id === activePresetId;
              return (
                <Tooltip key={preset.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onApplyPreset(preset.clients)}
                      className={`h-6 rounded-full px-2.5 text-[11px] font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {preset.label}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px]">
                    <p className="text-xs">{preset.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {preset.clients.length} client{preset.clients.length === 1 ? '' : 's'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>

      {/* Provider List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {[...groups.entries()].map(([provider, clients]) => {
            const meta = PROVIDER_META[provider] ?? {
              label: provider,
              icon: '📧',
              color: '#888'
            };
            const isExpanded = expandedProviders.has(provider);
            const enabledCount = clients.filter((c) => enabledClients.has(c.fullName)).length;
            const allEnabled = enabledCount === clients.length;
            const someEnabled = enabledCount > 0 && !allEnabled;

            return (
              <div key={provider} className="rounded-lg overflow-hidden">
                {/* Provider Row */}
                <button
                  onClick={() => toggleProvider(provider)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <span className="text-base leading-none">{meta.icon}</span>
                  <span className="flex-1 text-left text-sm font-medium">{meta.label}</span>
                  <Badge
                    variant={allEnabled ? 'success' : someEnabled ? 'warning' : 'secondary'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {enabledCount}/{clients.length}
                  </Badge>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </motion.div>
                </button>

                {/* Client List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pr-2 pb-2 space-y-0.5">
                        {/* Toggle all for provider */}
                        <button
                          onClick={() => toggleAllInProvider(provider)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-accent/30 hover:text-foreground transition-colors cursor-pointer"
                        >
                          <div
                            className={`w-3 h-3 rounded-sm border flex items-center justify-center ${
                              allEnabled
                                ? 'bg-primary border-primary'
                                : someEnabled
                                  ? 'bg-primary/40 border-primary'
                                  : 'border-muted-foreground/40'
                            }`}
                          >
                            {(allEnabled || someEnabled) && (
                              <Check className="w-2 h-2 text-primary-foreground" />
                            )}
                          </div>
                          Toggle all {meta.label}
                        </button>

                        {clients.map((client) => {
                          const isEnabled = enabledClients.has(client.fullName);
                          return (
                            <motion.div
                              key={client.fullName}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.15 }}
                              className="flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-accent/30 transition-colors"
                            >
                              <label
                                className="flex items-center gap-2 cursor-pointer flex-1 text-xs"
                                htmlFor={`client-${client.fullName}`}
                              >
                                <span className="text-muted-foreground">
                                  {PLATFORM_LABELS[client.platform] ?? client.platform}
                                </span>
                              </label>
                              <Switch
                                id={`client-${client.fullName}`}
                                checked={isEnabled}
                                onCheckedChange={() => onToggleClient(client.fullName)}
                                className="scale-75"
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 w-full justify-center gap-1.5 text-xs"
        >
          <RotateCcw className="w-3 h-3" />
          Reset to default
        </Button>
      </div>
    </div>
  );
}
