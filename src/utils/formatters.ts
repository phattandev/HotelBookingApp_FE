/**
 * Utilities for string and validation formatting
 */

/**
 * Format a string to Sentence Case (Capitalize the first letter of each word, lowercase the rest)
 */
export const toSentenceCase = (str: string): string => {
  if (!str) return '';
  return str
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Validates tax code
 * Must be 10 digits or 13 characters where first 10 are digits, then '-', then 3 digits
 */
export const isValidTaxCode = (taxCode: string): boolean => {
  const regex = /^(\d{10}|\d{10}-\d{3})$/;
  return regex.test(taxCode);
};

/**
 * Validates phone number
 * Must be 10 or 11 digits and contain no characters
 */
export const isValidPhone = (phone: string): boolean => {
  const regex = /^[0-9]+$/;
  if (!regex.test(phone)) return false;
  if (phone.length < 10 || phone.length > 11) return false;
  return true;
};

/**
 * Validate name (does not contain numbers or special characters other than space)
 * Note: allows Vietnamese characters
 */
export const isValidName = (name: string): boolean => {
  // Regex allows letters (including Vietnamese), and spaces. 
  // It disallows numbers and special characters like @, !, #, etc.
  const regex = /^[\p{L}\s]+$/u;
  return regex.test(name);
};

/**
 * Trích xuất message lỗi từ Axios error hoặc lỗi JS.
 * Ưu tiên: Errors[] > Message > fallback
 */
export function extractErrorMessage(err: unknown, fallback = 'Có lỗi xảy ra.'): string {
  const data = (err as any)?.response?.data;
  if (data?.Errors?.length > 0) return (data.Errors as string[]).join('\n');
  if (data?.Message) return data.Message as string;
  if (err instanceof Error) return err.message;
  return fallback;
}
