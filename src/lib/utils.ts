import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (name: string): string => {
  const noSpace = name.replace(/\s+/g, '');
  return noSpace.slice(0, 2).toUpperCase();
};
