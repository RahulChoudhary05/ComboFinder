// Runs the combo engine off the main thread so the UI never freezes.
import { findCombos } from "./comboEngine.js"

self.onmessage = (e) => {
  const { id, products, options } = e.data
  try {
    const result = findCombos(products, options, (p) => self.postMessage({ id, type: "progress", ...p }))
    self.postMessage({ id, type: "done", result })
  } catch (err) {
    self.postMessage({ id, type: "error", message: err?.message || String(err) })
  }
}
