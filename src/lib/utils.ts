import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function humanDate(iso?: string) {
  if (!iso) return '';
  try {
    return format(new Date(iso), 'eee., dd MMM yyyy', { locale: es });
  } catch {
    return iso;
  }
}

export function humanTime(iso?: string) {
  if (!iso) return '';
  try {
    return format(new Date(iso), 'h:mm aaaa', { locale: es });
  } catch {
    return iso;
  }
}

export function plural(word: string, count: number) {
  let pluralWord;
  if (count === 1) pluralWord = word;
  // termina en vocal → +s
  else if (/[aeiouáéíóú]$/i.test(word)) pluralWord = word + 's';
  // termina en consonante → +es
  else if (/[bcdfghjklmnñpqrstvwxyz]$/i.test(word)) pluralWord = word + 'es';
  else pluralWord = word + 's';

  return `${count.toLocaleString('es-MX')} ${pluralWord}`;
}
