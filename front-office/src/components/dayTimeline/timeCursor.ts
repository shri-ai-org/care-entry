// The movable time cursor on a list of doctors' days: one minute of the day,
// shared by the axis that carries its handle and every row that draws its line.
// null means "not moved yet" — it then stands at the current clock time.
import { useSyncExternalStore } from 'react'
import type { Span } from './dayModel'

// Where the desk put it (dragging the chip, or the keys) and, while the mouse
// is over the doctors' rows, where the mouse is — the mouse wins while it is there.
let pinned: number | null = null
let hovering: number | null = null
let minute: number | null = null
let leaveTimer: number | undefined
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  const next = hovering ?? pinned
  if (next === minute) return
  minute = next
  for (const listener of listeners) listener()
}

/** Put the cursor at a minute (null: back to the clock). */
export function setTimeCursor(next: number | null): void {
  window.clearTimeout(leaveTimer)
  pinned = next
  hovering = null
  emit()
}

/** The mouse is over a doctor's row at this minute: the cursor follows it. */
export function followPointer(next: number): void {
  window.clearTimeout(leaveTimer)
  hovering = next
  emit()
}

/** The mouse left a row: unless it enters another straight away, the cursor goes back to where it was put. */
export function releasePointer(): void {
  window.clearTimeout(leaveTimer)
  leaveTimer = window.setTimeout(() => {
    hovering = null
    emit()
  }, 200)
}

/** The cursor as moved by the desk or the mouse, or null when it is at the clock. */
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
