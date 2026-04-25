import { FONT_FAMILIES, ReaderFont } from './font';

export const splitIntoParagraphs = (text: string): string[] => {
  const cleaned = text
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const sentences =
    cleaned.match(/[^.!?"]+[.!?"]+[\s]*/g) || [cleaned];

  const result: string[] = [];
  const chunkSize = 3;

  for (let i = 0; i < sentences.length; i += chunkSize) {
    result.push(
      sentences.slice(i, i + chunkSize).join('').trim()
    );
  }

  return result;
};

export const getFont = (font: ReaderFont, bold: boolean) => {
  if (font === 'JetBrainsMono') {
    return bold
      ? 'JetBrainsMono-Bold'
      : 'JetBrainsMono-Regular';
  }

  if (font === 'JetBrainsMonoNL') {
    return bold
      ? 'JetBrainsMonoNL-Bold'
      : 'JetBrainsMonoNL-Regular';
  }

  return FONT_FAMILIES[font];
};
