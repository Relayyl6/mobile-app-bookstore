export type ReaderTheme = 'original' | 'quiet' | 'paper' | 'bold' | 'calm' | 'focus';
export type ReaderFont  = 'Georgia' | 'Palatino' | 'Athelas' | 'Seravek' | 'San Francisco' | 'Iowan' | 'JetBrainsMono' | 'JetBrainsMonoNL';;
export type PageLayout  = 'default' | 'compact' | 'full';

export interface ReaderSettings {
  fontSize: number;           // 14–28
  lineSpacing: number;        // 1 | 1.5 | 2
  theme: ReaderTheme;
  font: ReaderFont;
  brightness: number;         // 0–100
  pageLayout: PageLayout;
  autoNightMode: boolean;
  boldText: boolean;
  scrollMode: boolean;        // true = scroll, false = page-flip
}
export const FONT_FAMILIES: Record<ReaderFont, string> = {
  Georgia: 'Georgia',
  Palatino: 'Palatino',
  Athelas: 'Athelas',
  Seravek: 'Seravek',
  'San Francisco': 'System',
  Iowan: 'Iowan',

  JetBrainsMono: 'JetBrainsMono-Regular',
  JetBrainsMonoNL: 'JetBrainsMonoNL-Regular',
};

export const THEMES: { key: ReaderTheme; label: string; bg: string; text: string; border: string }[] = [
  { key: 'original', label: 'Original', bg: '#FFFFFF', text: '#1A1A1A', border: '#1A1A1A' },
  { key: 'quiet',    label: 'Quiet',    bg: '#2C2C2E', text: '#F2F2F7', border: '#636366' },
  { key: 'paper',    label: 'Paper',    bg: '#F5F0E8', text: '#2C1810', border: '#C4A882' },
  { key: 'bold',     label: 'Bold',     bg: '#F8F8F8', text: '#000000', border: '#000000' },
  { key: 'calm',     label: 'Calm',     bg: '#F5E6D3', text: '#3D2314', border: '#C8956C' },
  { key: 'focus',    label: 'Focus',    bg: '#1C1C1E', text: '#EBEBF5', border: '#48484A' },
];

export const FONTS: ReaderFont[] = ['Georgia', 'Palatino', 'Athelas', 'Seravek', 'San Francisco', 'Iowan', 'JetBrainsMono', 'JetBrainsMonoNL'];

export const SPACINGS: { value: number; label: string }[] = [
  { value: 1,   label: 'Compact' },
  { value: 1.5, label: 'Normal'  },
  { value: 2,   label: 'Wide'    },
];

export const LAYOUTS: { value: PageLayout; label: string; icon: string }[] = [
  { value: 'default', label: 'Default', icon: '▤' },
  { value: 'compact', label: 'Compact', icon: '▥' },
  { value: 'full',    label: 'Full',    icon: '▦' },
];

