import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import NotFound from "./components/NotFound.jsx"
import ErrorBoundary from "./components/ErrorBoundary.jsx"
import "./index.css"

const path = window.location.pathname.replace(/\/+$/, "")
const known = path === "" || path === "/index.html"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>{known ? <App /> : <NotFound />}</ErrorBoundary>
  </React.StrictMode>,
)
