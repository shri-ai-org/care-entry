// The movable time cursor on a list of doctors' days: one minute of the day,
// shared by the axis that carries its handle and every row that draws its line.
// null means "not moved yet" — it then stands at the current clock time.
import { useSyncExternalStore } from 'react'
import type { Span } from './dayModel'

let minute: number | null = null
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setTimeCursor(next: number | null): void {
  if (next === minute) return
  minute = next
  for (const listener of listeners) listener()
}

/** The cursor as moved by the desk, or null when it is at the clock. */
export function useTimeCursor(): number | null {
  return useSyncExternalStore(subscribe, () => minute)
}

function clockMinute(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

/** Where the cursor stands on a day's hours: as moved, or at the clock time — kept within the hours. */
export function cursorMinute(moved: number | null, [start, end]: Span): number {
  return Math.min(end, Math.max(start, moved ?? clockMinute()))
}

/** The cursor moves in five-minute steps. */
export const CURSOR_STEP = 5
