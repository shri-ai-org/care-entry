// The movable time cursor on a list of doctors' days: one minute of the day,
// shared by the axis that carries its handle and every row that draws its line.
// null means "not moved yet" — it then stands at the current clock time.
import { useSyncExternalStore } from 'react'
import type { Span } from './dayModel'

// Where the desk put it (dragging the chip, or the keys) — every doctor's pin —
// and, while the mouse is over one doctor's row, where the mouse is: that
// doctor's pin alone follows it.
let pinned: number | null = null
let hovering: { row: string; minute: number } | null = null
let minute: number | null = null
let leaveTimer: number | undefined
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  minute = hovering?.minute ?? pinned
  for (const listener of listeners) listener()
}

/** Put the cursor at a minute (null: back to the clock). */
export function setTimeCursor(next: number | null): void {
  window.clearTimeout(leaveTimer)
  pinned = next
  hovering = null
  emit()
}

/** The mouse is over one doctor's row at this minute: that doctor's pin follows it. */
export function followPointer(row: string, next: number): void {
  window.clearTimeout(leaveTimer)
  if (hovering?.row === row && hovering.minute === next) return
  hovering = { row, minute: next }
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

/** The time the chip names: the pin being moved, else where the desk put it — null at the clock. */
export function useTimeCursor(): number | null {
  return useSyncExternalStore(subscribe, () => minute)
}

/** One doctor's pin: under the mouse while it is over their row, else where the desk put it — null at the clock. */
export function useRowCursor(row: string): number | null {
  return useSyncExternalStore(subscribe, () => (hovering?.row === row ? hovering.minute : pinned))
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
