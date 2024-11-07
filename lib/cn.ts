import { twMerge } from 'tailwind-merge'
import clsx, { type ClassValue } from 'clsx'

/**
 * Combines clsx and tailwind-merge for efficient class management
 * Allows conditional classes and merges UnoCSS classes without conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
