import { useCallback, useEffect, useRef, useState } from "react"

/** Debounced copy of a value. */
export function useDebounced(value, delay = 200) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

/** Stable debounced callback. */
export function useDebouncedCallback(fn, delay = 300) {
  const fnRef = useRef(fn)
  fnRef.current = fn
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  return useCallback(
    (...args) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => fnRef.current(...args), delay)
    },
    [delay],
  )
}

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? fallback : JSON.parse(raw)
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false // quota exceeded / private mode
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}

export const isTyping = (el) => {
  if (!el) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable
}

/**
 * Global keyboard shortcuts. `map` keys: "mod+k", "mod+enter", "/", "?", "u", "1"…
 * Plain-letter shortcuts are ignored while the user is typing in a field.
 */
export function useHotkeys(map, enabled = true) {
  const mapRef = useRef(map)
  mapRef.current = map
  useEffect(() => {
    if (!enabled) return
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey
      let key = e.key.toLowerCase()
      if (key === " ") key = "space"
      const combo = `${mod ? "mod+" : ""}${e.shiftKey && key.length > 1 ? "shift+" : ""}${key}`
      const handler = mapRef.current[combo]
      if (!handler) return
      if (!mod && isTyping(document.activeElement)) return
      if (e.altKey) return
      e.preventDefault()
      handler(e)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [enabled])
}

/**
 * Which section is under the "reading line" (35% down the viewport).
 * Scroll handling is throttled to one check per animation frame; sections are looked up
 * on every check, so sections that mount later (results) are picked up automatically.
 */
export function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0])
  const key = ids.join("|")
  useEffect(() => {
    let frame = 0
    const check = () => {
      frame = 0
      const line = window.innerHeight * 0.35
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      // At the very bottom of the page, the last present section wins.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        const last = [...ids].reverse().find((id) => document.getElementById(id))
        if (last) current = last
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    check()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return active
}

export const isMac = typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)
export const modKey = isMac ? "⌘" : "Ctrl"
