import { useCallback, useEffect, useRef, useState } from "react"
import { findCombos } from "./comboEngine.js"

/**
 * Runs searches in a dedicated Web Worker. Cancelling terminates the worker (a busy synchronous loop can't
 * receive messages) and a fresh one is created for the next search. Falls back to the main thread if
 * workers are unavailable.
 */
export function useComboSearch() {
  const workerRef = useRef(null)
  const reqId = useRef(0)
  const pending = useRef(null)
  const [state, setState] = useState({ running: false, progress: 0, matches: 0 })

  const getWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current
    if (typeof Worker === "undefined") return null
    const w = new Worker(new URL("./comboWorker.js", import.meta.url), { type: "module" })
    w.onmessage = (e) => {
      const msg = e.data
      const p = pending.current
      if (!p || msg.id !== p.id) return
      if (msg.type === "progress") setState({ running: true, progress: msg.progress, matches: msg.matches })
      else if (msg.type === "done") {
        pending.current = null
        setState({ running: false, progress: 1, matches: msg.result.matches })
        p.resolve(msg.result)
      } else if (msg.type === "error") {
        pending.current = null
        setState({ running: false, progress: 0, matches: 0 })
        p.reject(new Error(msg.message))
      }
    }
    w.onerror = (e) => {
      const p = pending.current
      pending.current = null
      setState({ running: false, progress: 0, matches: 0 })
      p?.reject(new Error(e.message || "Search worker crashed."))
    }
    workerRef.current = w
    return w
  }, [])

  const cancel = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
    if (pending.current) {
      pending.current.reject(Object.assign(new Error("Search cancelled."), { cancelled: true }))
      pending.current = null
    }
    setState({ running: false, progress: 0, matches: 0 })
  }, [])

  const search = useCallback(
    (products, options) => {
      if (pending.current) cancel()
      const id = ++reqId.current
      setState({ running: true, progress: 0, matches: 0 })
      const w = getWorker()
      if (!w) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              const r = findCombos(products, options)
              setState({ running: false, progress: 1, matches: r.matches })
              resolve(r)
            } catch (err) {
              setState({ running: false, progress: 0, matches: 0 })
              reject(err)
            }
          }, 0)
        })
      }
      return new Promise((resolve, reject) => {
        pending.current = { id, resolve, reject }
        w.postMessage({ id, products, options })
      })
    },
    [cancel, getWorker],
  )

  useEffect(() => () => workerRef.current?.terminate(), [])

  return { ...state, search, cancel }
}
