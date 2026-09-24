/**
 * lib/readTime.ts — Dynamic Word-Count based Read Time Calculator
 * Accurately calculates reading time from article text or HTML per language.
 */

const DIGITS: Record<string, string[]> = {
  bn: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
  hi: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  ar: ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
};

export function toLocalizedDigits(num: number, lang: string): string {
  const digits = DIGITS[lang];
  if (!digits) return num.toLocaleString(lang);
  return String(num).replace(/\d/g, (d) => digits[Number(d)] || d);
}

export function getWordCount(textOrHtml?: string): number {
  if (!textOrHtml) return 0;
  // Strip HTML tags & entities
  const clean = textOrHtml
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .trim();
  if (!clean) return 0;
  const words = clean.split(/\s+/).filter(Boolean);
  return words.length;
}

export interface ReadTimeResult {
  minutes: number;
  wordCount: number;
  text: string;
  badge: string;
}

/**
 * Calculates reading time based on content words:
 * Average adult reading speed:
 * - Bengali / Hindi / Multilingual: ~170-190 words/min
 */
export function calculateReadTime(textOrHtml?: string, lang = 'bn', wordsPerMinute = 180): ReadTimeResult {
  const wordCount = getWordCount(textOrHtml);
  // Minimum 1 min read if content exists, 0 if empty
  const minutes = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / wordsPerMinute)) : 1;
  const locMinutes = toLocalizedDigits(minutes, lang);
  const locWords = toLocalizedDigits(wordCount, lang);

  let text = '';
  let badge = '';

  switch (lang) {
    case 'bn':
      text = `${locMinutes} মিনিট পাঠ (${locWords} শব্দ)`;
      badge = `${locMinutes} মিনিট পাঠ`;
      break;
    case 'hi':
      text = `${locMinutes} मिनट पठन (${locWords} शब्द)`;
      badge = `${locMinutes} मिनट पठन`;
      break;
    case 'es':
      text = `${minutes} min de lectura (${wordCount} palabras)`;
      badge = `${minutes} min lectura`;
      break;
    case 'ar':
      text = `${locMinutes} دقائق للقراءة (${locWords} كلمة)`;
      badge = `${locMinutes} دقائق للقراءة`;
      break;
    case 'zh':
      text = `${minutes} 分钟阅读 (${wordCount} 字)`;
      badge = `${minutes} 分钟阅读`;
      break;
    case 'ru':
      text = `${minutes} мин чтения (${wordCount} слов)`;
      badge = `${minutes} мин чтения`;
      break;
    case 'fr':
      text = `${minutes} min de lecture (${wordCount} mots)`;
      badge = `${minutes} min lecture`;
      break;
    case 'pt':
      text = `${minutes} min de leitura (${wordCount} palavras)`;
      badge = `${minutes} min leitura`;
      break;
    case 'en':
    default:
      text = `${minutes} min read (${wordCount} words)`;
      badge = `${minutes} min read`;
      break;
  }

  return { minutes, wordCount, text, badge };
}
