import { useCallback, useRef, useState } from 'react';

import type { CanIEmailResult, IssueGroup } from '@/lib/caniemail-types';

// Dynamic import of the browser bundle
let _lib: typeof import('caniemail') | null = null;
async function getLib() {
  if (!_lib) {
    _lib = await import('caniemail');
  }
  return _lib;
}

interface CheckState {
  result: CanIEmailResult | null;
  groupedErrors: IssueGroup[];
  groupedWarnings: IssueGroup[];
  isChecking: boolean;
  error: string | null;
  duration: number;
}

export function useCanIEmail() {
  const [state, setState] = useState<CheckState>({
    result: null,
    groupedErrors: [],
    groupedWarnings: [],
    isChecking: false,
    error: null,
    duration: 0
  });

  const abortRef = useRef(0);

  const check = useCallback(async (html: string, enabledClients: string[]) => {
    const id = ++abortRef.current;

    if (!html.trim() || enabledClients.length === 0) {
      setState({
        result: null,
        groupedErrors: [],
        groupedWarnings: [],
        isChecking: false,
        error: enabledClients.length === 0 ? 'No email clients selected' : null,
        duration: 0
      });
      return;
    }

    setState((prev) => ({ ...prev, isChecking: true, error: null }));

    try {
      const lib = await getLib();
      const start = performance.now();

      const result = lib.caniemail({
        clients: enabledClients as never[],
        html
      });

      const duration = Math.round(performance.now() - start);

      // Don't update if a newer check was triggered
      if (id !== abortRef.current) return;

      const groupedErrors = lib.sortIssues(lib.groupIssues(result.issues.errors));
      const groupedWarnings = lib.sortIssues(lib.groupIssues(result.issues.warnings));

      setState({
        result: result as CanIEmailResult,
        groupedErrors: groupedErrors as IssueGroup[],
        groupedWarnings: groupedWarnings as IssueGroup[],
        isChecking: false,
        error: null,
        duration
      });
    } catch (err) {
      if (id !== abortRef.current) return;
      setState({
        result: null,
        groupedErrors: [],
        groupedWarnings: [],
        isChecking: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        duration: 0
      });
    }
  }, []);

  return { ...state, check };
}
