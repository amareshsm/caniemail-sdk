import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import type { Extension } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { solarizedDark, solarizedLight } from '@uiw/codemirror-theme-solarized';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import CodeMirror from '@uiw/react-codemirror';
import { useCallback, useMemo } from 'react';

import { useTheme } from '@/components/theme-provider';
import type { EditorTheme } from '@/lib/editor-themes';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'html' | 'css';
  editorTheme: EditorTheme;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'html',
  editorTheme,
  className
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  const theme = useMemo((): Extension => {
    const isDark = resolvedTheme === 'dark';
    switch (editorTheme) {
      case 'github':
        return isDark ? githubDark : githubLight;
      case 'one-dark':
        return oneDark;
      case 'dracula':
        return dracula;
      case 'tokyo-night':
        return tokyoNight;
      case 'solarized':
        return isDark ? solarizedDark : solarizedLight;
      default:
        return isDark ? githubDark : githubLight;
    }
  }, [editorTheme, resolvedTheme]);

  const extensions = useMemo(() => {
    const lang = language === 'css' ? css() : html();
    return [
      lang,
      EditorView.lineWrapping,
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' }
      })
    ];
  }, [language]);

  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  return (
    <div className={className}>
      <CodeMirror
        value={value}
        onChange={handleChange}
        extensions={extensions}
        theme={theme}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
          autocompletion: true,
          closeBrackets: true,
          indentOnInput: true
        }}
      />
    </div>
  );
}
