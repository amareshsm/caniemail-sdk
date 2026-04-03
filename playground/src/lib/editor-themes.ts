export type EditorTheme = 'github' | 'one-dark' | 'dracula' | 'tokyo-night' | 'solarized';

export const EDITOR_THEMES: { value: EditorTheme; label: string }[] = [
  { value: 'github', label: 'GitHub' },
  { value: 'one-dark', label: 'One Dark' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'tokyo-night', label: 'Tokyo Night' },
  { value: 'solarized', label: 'Solarized' }
];
