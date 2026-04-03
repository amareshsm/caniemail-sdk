import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, FileCode2, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CanIEmailResult, IssueGroup } from '@/lib/caniemail-types';
import { PLATFORM_LABELS, PROVIDER_META } from '@/lib/caniemail-types';

interface ResultsPanelProps {
  result: CanIEmailResult | null;
  groupedErrors: IssueGroup[];
  groupedWarnings: IssueGroup[];
  isChecking: boolean;
  error: string | null;
  duration: number;
  enabledClientsCount: number;
}

function parseClientLabel(client: string): string {
  const [provider, platform] = client.split('.');
  const meta = PROVIDER_META[provider];
  const providerLabel = meta?.label ?? provider;
  const platformLabel = PLATFORM_LABELS[platform] ?? platform;
  return `${providerLabel} ${platformLabel}`;
}

function IssueCard({ group, type }: { group: IssueGroup; type: 'error' | 'warning' }) {
  const { issue, clients } = group;
  const pos = issue.position;
  const isError = type === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group rounded-lg border p-3 transition-colors hover:bg-accent/30 ${
        isError ? 'border-destructive/20 bg-destructive/3' : 'border-warning/20 bg-warning/3'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          {isError ? (
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{issue.title}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {clients.map((client) => (
                <Badge
                  key={client}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 font-normal"
                >
                  {parseClientLabel(client)}
                </Badge>
              ))}
            </div>
            {issue.notes.length > 0 && (
              <div className="mt-2 space-y-1">
                {issue.notes.map((note, i) => (
                  <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">
                    💡 {note}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        {pos && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0 font-mono">
                  {pos.start.line}:{pos.start.column}
                </code>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Line {pos.start.line}, Column {pos.start.column}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({
  icon: Icon,
  message
}: {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground max-w-60">{message}</p>
    </motion.div>
  );
}

function StatsBar({
  result,
  groupedErrors,
  groupedWarnings,
  duration
}: {
  result: CanIEmailResult;
  groupedErrors: IssueGroup[];
  groupedWarnings: IssueGroup[];
  duration: number;
}) {
  const errorCount = groupedErrors.length;
  const warningCount = groupedWarnings.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/30"
    >
      {/* Status */}
      <div className="flex items-center gap-1.5">
        {result.success ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <CheckCircle2 className="w-4 h-4 text-success" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <AlertCircle className="w-4 h-4 text-destructive" />
          </motion.div>
        )}
        <span className="text-xs font-semibold">{result.success ? 'PASS' : 'FAIL'}</span>
      </div>

      <div className="h-3.5 w-px bg-border" />

      {/* Counts */}
      {errorCount > 0 && (
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
          {errorCount} {errorCount === 1 ? 'error' : 'errors'}
        </Badge>
      )}
      {warningCount > 0 && (
        <Badge variant="warning" className="text-[10px] px-1.5 py-0">
          {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
        </Badge>
      )}
      {errorCount === 0 && warningCount === 0 && (
        <Badge variant="success" className="text-[10px] px-1.5 py-0">
          No issues
        </Badge>
      )}

      <div className="flex-1" />

      {/* Duration */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Clock className="w-3 h-3" />
        {duration}ms
      </div>
    </motion.div>
  );
}

export function ResultsPanel({
  result,
  groupedErrors,
  groupedWarnings,
  isChecking,
  error,
  duration,
  enabledClientsCount
}: ResultsPanelProps) {
  // Loading state
  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-6 h-6 text-muted-foreground" />
        </motion.div>
        <p className="text-xs text-muted-foreground mt-3">Checking compatibility…</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return <EmptyState icon={AlertCircle} message={error} />;
  }

  // No result yet
  if (!result) {
    return (
      <EmptyState
        icon={FileCode2}
        message={
          enabledClientsCount === 0
            ? 'Enable at least one email client to check compatibility'
            : 'Paste your email HTML in the editor and click Check to see results'
        }
      />
    );
  }

  const errorCount = groupedErrors.length;
  const warningCount = groupedWarnings.length;

  return (
    <div className="flex flex-col h-full">
      <StatsBar
        result={result}
        groupedErrors={groupedErrors}
        groupedWarnings={groupedWarnings}
        duration={duration}
      />

      <Tabs defaultValue="errors" className="flex flex-col flex-1 min-h-0">
        <div className="px-4 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="errors" className="flex-1 gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Errors
              {errorCount > 0 && (
                <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0">
                  {errorCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="warnings" className="flex-1 gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Warnings
              {warningCount > 0 && (
                <Badge variant="warning" className="ml-1 text-[10px] px-1.5 py-0">
                  {warningCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="errors" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              <AnimatePresence mode="popLayout">
                {errorCount === 0 ? (
                  <motion.div
                    key="no-errors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-4 rounded-lg bg-success/5 border border-success/20"
                  >
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <p className="text-sm text-success">No compatibility errors found!</p>
                  </motion.div>
                ) : (
                  groupedErrors.map((group, i) => (
                    <IssueCard
                      key={`${group.issue.title}-${group.issue.position?.start.line}-${i}`}
                      group={group}
                      type="error"
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="warnings" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              <AnimatePresence mode="popLayout">
                {warningCount === 0 ? (
                  <motion.div
                    key="no-warnings"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-4 rounded-lg bg-success/5 border border-success/20"
                  >
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <p className="text-sm text-success">No compatibility warnings found!</p>
                  </motion.div>
                ) : (
                  groupedWarnings.map((group, i) => (
                    <IssueCard
                      key={`${group.issue.title}-${group.issue.position?.start.line}-${i}`}
                      group={group}
                      type="warning"
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
