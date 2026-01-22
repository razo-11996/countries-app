export function byNameAsc<T extends { name: string }>(a: T, b: T): number {
  return a.name.localeCompare(b.name);
}
