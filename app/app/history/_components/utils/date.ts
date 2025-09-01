export function addDays(d: Date, n: number) {
  const x = new Date(d); x.setDate(x.getDate() + n); return x
}
export function addHours(d: Date, n: number) {
  const x = new Date(d); x.setHours(x.getHours() + n); return x
}
export function dayKey(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}
export function timeShort(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}
export function groupBy<T>(arr: T[], key: (v: T) => string) {
  return arr.reduce<Record<string, T[]>>((acc, cur) => {
    const k = key(cur); (acc[k] ||= []).push(cur); return acc
  }, {})
}
