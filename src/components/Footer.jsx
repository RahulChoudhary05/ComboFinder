import { Github, Linkedin, Twitter, Mail, Globe, ShieldCheck } from "lucide-react"
import { DEVELOPER } from "../config"

export default function Footer() {
  const l = DEVELOPER.links
  const socials = [
    { href: l.github, icon: Github, label: "GitHub" },
    { href: l.linkedin, icon: Linkedin, label: "LinkedIn" },
    { href: l.twitter, icon: Twitter, label: "Twitter" },
    { href: `mailto:${l.email}`, icon: Mail, label: "Email" },
    { href: l.portfolio, icon: Globe, label: "Portfolio" },
  ]
  return (
    <footer className="mt-12 border-t border-white/[0.06] print-hide">
      <div className="flex flex-col items-center justify-between gap-4 py-8 text-[12px] text-zinc-500 md:flex-row">
        <p className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent/70" />
          Files are parsed in your browser and never uploaded.
        </p>
        <p>
          Built by <span className="text-zinc-300">{DEVELOPER.name}</span> · © {new Date().getFullYear()} ComboFinder
        </p>
        <div className="flex gap-1">
          {socials.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={label}
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/[0.06] hover:text-zinc-100"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
