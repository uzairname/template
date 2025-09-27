

export function nonNullable<T>(value: T, description?: string): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(description || "Value is null or undefined");
  }
  return value;
}
