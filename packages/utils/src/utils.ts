


/**
 * Ensures that a value is not `null` or `undefined`.
 * Throws an error if the value is `null` or `undefined`.
 *
 * @typeParam T - The type of the value to check.
 * @param value - The value to check for non-nullability.
 * @param description - Optional description to include in the error message.
 * @returns The non-nullable value.
 * @throws {Error} If the value is `null` or `undefined`.
 */
export function nonNullable<T>(value: T, description?: string): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(`${description ?? 'Value'} is null or undefined`)
  }
  return value
}


/**
 * Truncates a string to a specified maximum length, showing both start and end with ellipsis in the middle
 * @param str - The string to truncate
 * @param maxLength - Maximum length of the string (default: 50)
 * @returns The truncated string with ellipsis if needed
 */
export function truncateString(str: string, maxLength: number = 50): string {
  if (str.length <= maxLength) {
    return str
  }

  const ellipsis = '...'
  const availableLength = maxLength - ellipsis.length
  const startLength = Math.ceil(availableLength * 0.6) // Show more of the beginning
  const endLength = Math.floor(availableLength * 0.4) // Show less of the end

  return str.slice(0, startLength) + ellipsis + str.slice(-endLength)
}
