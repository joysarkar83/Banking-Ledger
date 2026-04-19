const links = [
  {
    name: 'GitHub',
    href: 'https://github.com/joysarkar83',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2C6.48 2 2 6.58 2 12.22c0 4.5 2.87 8.31 6.84 9.66.5.09.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.21-3.37-1.21-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .08 1.53 1.05 1.53 1.05.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.35 9.35 0 0 1 12 6.8c.85 0 1.72.12 2.52.36 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.95-2.35 4.81-4.59 5.07.36.32.67.95.67 1.93 0 1.39-.01 2.51-.01 2.85 0 .27.18.59.69.49A10.24 10.24 0 0 0 22 12.22C22 6.58 17.52 2 12 2z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/joy-sarkar-169059306',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6.94 8.5H3.56V21h3.38V8.5zM5.25 3C4.14 3 3.25 3.9 3.25 5.02c0 1.1.89 2 2 2 1.11 0 2-.9 2-2A2 2 0 0 0 5.25 3zM20.75 13.84c0-3.31-1.77-5.84-5.15-5.84-1.48 0-2.48.82-2.9 1.4V8.5H9.31V21h3.39v-6.18c0-1.63.3-3.2 2.3-3.2 1.96 0 1.99 1.84 1.99 3.3V21h3.39v-7.16z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: 'X',
    href: 'https://x.com/joyxdev',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M18.24 2h3.37l-7.37 8.42L23 22h-6.83l-5.35-7-6.13 7H1.31l7.89-9.02L1 2h7l4.84 6.39L18.24 2zm-1.18 18h1.86L6.99 3.9H5l12.06 16.1z"
          fill="currentColor"
        />
      </svg>
    ),
  },
]

const SocialFooter = () => {
  return (
    <footer className="global-footer">
      <div className="global-footer-inner">
        <div className="social-links" aria-label="Social profiles">
          {links.map((link) => (
            <a
              key={link.name}
              className="social-link"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.name}
              title={link.name}
            >
              <span className="social-icon" aria-hidden="true">{link.icon}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default SocialFooter
