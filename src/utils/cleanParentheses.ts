/**
 * Supprime la partie entre parenthèses d'un mot
 */
export const cleanParentheses = (word: string): string => {
    if (!word) return '';
    return word.replace(/\s*\([^)]*\)/g, '').trim();
  };
