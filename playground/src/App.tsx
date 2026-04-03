import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Code2,
  PanelLeft,
  PanelLeftClose,
  Play,
  RotateCcw,
  Settings2
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ClientConfig } from '@/components/client-config';
import { CodeEditor } from '@/components/code-editor';
import { Header } from '@/components/header';
import { ResultsPanel } from '@/components/results-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCanIEmail } from '@/hooks/use-caniemail';
import { CLIENT_NAMES } from '@/lib/caniemail-types';
import { EDITOR_THEMES, type EditorTheme } from '@/lib/editor-themes';
import { SAMPLE_EMAIL } from '@/lib/sample-email';

// ─── Debounce Hook ────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Persist State Helpers ────────────────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {
    /* noop */
  }
  return fallback;
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

// ─── App Component ────────────────────────────────────────────────────────────

export default function App() {
  // Editor state
  const [htmlCode, setHtmlCode] = useState(() => loadFromStorage('caniemail-html', SAMPLE_EMAIL));
  const [editorTheme, setEditorTheme] = useState<EditorTheme>(() =>
    loadFromStorage('caniemail-editor-theme', 'one-dark')
  );

  // Client selection state
  const [enabledClients, setEnabledClients] = useState<Set<string>>(() => {
    const stored = loadFromStorage<string[] | null>('caniemail-clients', null);
    return stored ? new Set(stored) : new Set(CLIENT_NAMES);
  });

  // Sidebar state
  const [showSidebar, setShowSidebar] = useState(true);

  // Auto-check with debounce
  const debouncedHtml = useDebounce(htmlCode, 500);
  const { result, groupedErrors, groupedWarnings, isChecking, error, duration, check } =
    useCanIEmail();

  // Run check when debounced HTML or clients change
  const isFirstRender = useRef(true);
  useEffect(() => {
    // Always run on first render with sample code
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    check(debouncedHtml, [...enabledClients]);
  }, [debouncedHtml, enabledClients, check]);

  // Persist state
  useEffect(() => saveToStorage('caniemail-html', htmlCode), [htmlCode]);
  useEffect(() => saveToStorage('caniemail-editor-theme', editorTheme), [editorTheme]);
  useEffect(() => saveToStorage('caniemail-clients', [...enabledClients]), [enabledClients]);

  // Client toggle handlers
  const handleToggleClient = useCallback((client: string) => {
    setEnabledClients((prev) => {
      const next = new Set(prev);
      if (next.has(client)) {
        next.delete(client);
      } else {
        next.add(client);
      }
      return next;
    });
  }, []);

  const handleEnableAll = useCallback(() => {
    setEnabledClients(new Set(CLIENT_NAMES));
  }, []);

  const handleDisableAll = useCallback(() => {
    setEnabledClients(new Set());
  }, []);

  // Reset to sample
  const handleReset = useCallback(() => {
    setHtmlCode(SAMPLE_EMAIL);
    setEnabledClients(new Set(CLIENT_NAMES));
  }, []);

  // Manual check
  const handleRunCheck = useCallback(() => {
    check(htmlCode, [...enabledClients]);
  }, [htmlCode, enabledClients, check]);

  // Counts for header badges
  const errorCount = groupedErrors.length;
  const warningCount = groupedWarnings.length;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen flex-col bg-background text-foreground">
        {/* Header */}
        <Header />

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-center gap-2 border-b bg-card/50 px-4 py-2"
        >
          {/* Left: Editor theme selector */}
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <select
              value={editorTheme}
              onChange={(e) => setEditorTheme(e.target.value as EditorTheme)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {EDITOR_THEMES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Center: Action buttons */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" onClick={handleRunCheck} disabled={isChecking} className="gap-1.5">
                <Play className="h-3.5 w-3.5" />
                Check
              </Button>
            </TooltipTrigger>
            <TooltipContent>Run compatibility check</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={handleReset} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to sample email</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          {/* Status badges */}
          <div className="flex items-center gap-1.5">
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5"
              >
                {errorCount > 0 && (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    {errorCount} {errorCount === 1 ? 'error' : 'errors'}
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge variant="warning" className="gap-1 text-xs">
                    {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
                  </Badge>
                )}
                {errorCount === 0 && warningCount === 0 && (
                  <Badge variant="success" className="gap-1 text-xs">
                    All clear!
                  </Badge>
                )}
              </motion.div>
            )}
            {isChecking && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <BarChart3 className="h-3 w-3 animate-pulse" />
                Checking…
              </Badge>
            )}
          </div>

          {/* Right: Client count & sidebar toggle */}
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal">
              {enabledClients.size}/{CLIENT_NAMES.length} clients
            </Badge>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="h-8 w-8 p-0"
                >
                  {showSidebar ? (
                    <PanelLeftClose className="h-4 w-4" />
                  ) : (
                    <PanelLeft className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showSidebar ? 'Hide' : 'Show'} client panel</TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Client Config */}
          <AnimatePresence mode="popLayout">
            {showSidebar && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="flex flex-col overflow-hidden border-r bg-card/30"
              >
                <div className="flex items-center gap-2 border-b px-3 py-2">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium">Email Clients</h2>
                </div>
                <ClientConfig
                  enabledClients={enabledClients}
                  onToggleClient={handleToggleClient}
                  onEnableAll={handleEnableAll}
                  onDisableAll={handleDisableAll}
                />
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Center: Code Editor */}
          <motion.div
            layout
            transition={{ duration: 0.25 }}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">HTML Email Code</h2>
              <span className="text-xs text-muted-foreground">— paste or edit your email HTML</span>
            </div>
            <CodeEditor
              value={htmlCode}
              onChange={setHtmlCode}
              editorTheme={editorTheme}
              language="html"
              className="flex-1 overflow-hidden"
            />
          </motion.div>

          {/* Right: Results Panel */}
          <motion.div
            layout
            transition={{ duration: 0.25 }}
            className="flex w-105 flex-col overflow-hidden border-l"
          >
            <ResultsPanel
              result={result}
              groupedErrors={groupedErrors}
              groupedWarnings={groupedWarnings}
              isChecking={isChecking}
              error={error}
              duration={duration}
              enabledClientsCount={enabledClients.size}
            />
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
