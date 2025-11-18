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
