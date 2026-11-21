import { useState } from "react"
import { Github, Linkedin, Globe, Mail, X } from "lucide-react"
import { DEVELOPER } from "../config"
import Dialog from "./ui/Dialog"

export function Avatar({ className = "" }) {
  const sources = [DEVELOPER.avatar, DEVELOPER.avatarFallback]
  const [i, setI] = useState(0)
  if (i >= sources.length) {
    const initials = DEVELOPER.name.split(" ").map((w) => w[0]).join("").slice(0, 2)
    return <div className={`${className} grid place-items-center bg-ink-700 font-semibold text-zinc-200`}>{initials}</div>
  }
  return <img src={sources[i]} onError={() => setI(i + 1)} alt={DEVELOPER.name} className={`${className} object-cover`} loading="lazy" decoding="async" />
}

export default function DeveloperProfile({ onClose }) {
  const l = DEVELOPER.links
  const links = [
    { href: l.github, icon: Github, label: "GitHub" },
    { href: l.linkedin, icon: Linkedin, label: "LinkedIn" },
    { href: l.portfolio, icon: Globe, label: "Portfolio" },
    { href: `mailto:${l.email}`, icon: Mail, label: "Email" },
  ]
  return (
    <Dialog onClose={onClose} size="md" hideClose labelledBy="dev-name">
      <div className="max-h-[88dvh] overflow-y-auto p-5 sm:p-6">
        {/* Photo sits inline with the name – nothing overlaps or gets clipped. */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 shrink-0 rounded-full border border-white/10 sm:h-20 sm:w-20" />
          <div className="min-w-0 flex-1 pt-1">
            <p className="eyebrow">Developer</p>
            <h2 id="dev-name" className="mt-0.5 text-lg font-semibold tracking-tight sm:text-xl">
              {DEVELOPER.name}
            </h2>
            <p className="text-[13px] text-zinc-400">{DEVELOPER.role}</p>
          </div>
          <button onClick={onClose} className="btn-ghost -mr-2 -mt-1 h-9 w-9 px-0" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-5 text-[14px] leading-relaxed text-zinc-300">{DEVELOPER.bio}</p>

        <div className="divider my-5" />

        <h3 className="text-[13px] font-semibold">What’s interesting in this project</h3>
        <ul className="mt-2 space-y-2 text-[13px] leading-relaxed text-zinc-400">
          {DEVELOPER.highlights.map((h) => (
            <li key={h} className="flex gap-2.5">
              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-zinc-500" />
              {h}
            </li>
          ))}
        </ul>

        <h3 className="mt-5 text-[13px] font-semibold">Built with</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">{DEVELOPER.stack.join(" · ")}</p>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {links.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="btn-secondary h-10 px-3"
            >
              <Icon className="h-4 w-4 text-zinc-400" /> {label}
            </a>
          ))}
        </div>
      </div>
    </Dialog>
  )
}
