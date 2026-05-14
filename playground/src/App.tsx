import { AnimatePresence, motion } from 'framer-motion';
import { Code2, PanelLeft, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ClientConfig } from '@/components/client-config';
import { CodeEditor } from '@/components/code-editor';
import { Header } from '@/components/header';
import { ResultsPanel } from '@/components/results-panel';
import { Button } from '@/components/ui/button';
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
  const [htmlCode, setHtmlCode] = useState(() =>
    loadFromStorage('caniemail-html-v3', SAMPLE_EMAIL)
  );
  const [editorTheme, setEditorTheme] = useState<EditorTheme>(() =>
    loadFromStorage('caniemail-editor-theme-v2', 'github')
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
  useEffect(() => {
    check(debouncedHtml, [...enabledClients]);
  }, [debouncedHtml, enabledClients, check]);

  // Persist state
  useEffect(() => saveToStorage('caniemail-html-v3', htmlCode), [htmlCode]);
  useEffect(() => saveToStorage('caniemail-editor-theme-v2', editorTheme), [editorTheme]);
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

  const handleApplyPreset = useCallback((clients: readonly string[]) => {
    setEnabledClients(new Set(clients));
  }, []);

  // Scoped resets
  const handleResetHtml = useCallback(() => {
    setHtmlCode(SAMPLE_EMAIL);
  }, []);

  const handleResetClients = useCallback(() => {
    setEnabledClients(new Set(CLIENT_NAMES));
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen flex-col bg-background text-foreground">
        {/* Header */}
        <Header />

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
                <ClientConfig
                  enabledClients={enabledClients}
                  onToggleClient={handleToggleClient}
                  onApplyPreset={handleApplyPreset}
                  onReset={handleResetClients}
                  onCollapse={() => setShowSidebar(false)}
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
              {!showSidebar && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowSidebar(true)}
                      className="h-7 w-7 p-0"
                    >
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Show client panel</TooltipContent>
                </Tooltip>
              )}
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">HTML Email Code</h2>
              <span className="text-xs text-muted-foreground">— paste or edit your email HTML</span>

              <div className="ml-auto flex items-center gap-1.5">
                <select
                  value={editorTheme}
                  onChange={(e) => setEditorTheme(e.target.value as EditorTheme)}
                  className="h-7 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Editor theme"
                >
                  {EDITOR_THEMES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleResetHtml}
                      className="h-7 gap-1.5 px-2 text-xs"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset to default
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset HTML to sample email</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <CodeEditor
              value={htmlCode}
              onChange={setHtmlCode}
              editorTheme={editorTheme}
              language="html"
              className="flex-1 min-h-0 overflow-hidden"
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
