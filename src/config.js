// Single place to edit developer details and deployment settings.

export const API_URL = (import.meta.env.VITE_API_URL || "https://combofinder.onrender.com").replace(/\/$/, "")

export const DEVELOPER = {
  name: "Rahul Choudhary",
  role: "Full Stack Developer",
  // The GitHub avatar always matches your current profile picture; the Cloudinary image is the fallback.
  avatar: "https://github.com/RahulChoudhary05.png?size=256",
  avatarFallback:
    "https://res.cloudinary.com/dnlrwuxxs/image/upload/fl_preserve_transparency/v1743144349/RahulChoudharyPortfolio/Resume_Pic_sznfx3.jpg?_s=public-apps",
  bio: "I build fast, data-heavy web apps with React and Node.js, from parsing pipelines and search algorithms to polished UIs.",
  links: {
    github: "https://github.com/RahulChoudhary05",
    linkedin: "https://www.linkedin.com/in/rahulchoudhary210505",
    portfolio: "https://rahulchoudhary05.vercel.app",
    twitter: "https://twitter.com/krahul_21",
    email: "rahulchoudhary.sk@gmail.com",
    repo: "https://github.com/RahulChoudhary05/ComboFinder",
  },
  stack: ["React 18", "Vite 7", "Web Workers", "Tailwind CSS", "Framer Motion", "SheetJS", "Papa Parse", "Node.js", "Express", "Nodemailer", "Vitest"],
  highlights: [
    "Branch-and-bound subset-sum search with O(1) prefix-sum pruning",
    "Streaming top-K results via a bounded heap, so memory stays flat with millions of matches",
    "Runs off the main thread in a Web Worker with live progress and cancel",
    "Imports CSV, TSV, Excel, ODS and JSON, and auto-detects columns and currency formats",
  ],
}
