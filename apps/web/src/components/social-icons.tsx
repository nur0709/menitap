import React from 'react'

/**
 * Official Google Gmail 4-Color Logo
 */
export function GmailLogo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <path fill="#4caf50" d="M45,16.2l-5,2.75v19.05c0,1.1-.9,2-2,2h-6V24.57L45,16.2z" />
      <path fill="#1e88e5" d="M3,16.2l5,2.75v19.05c0,1.1.9,2,2,2h6V24.57L3,16.2z" />
      <path fill="#e53935" d="M40.2,8.8l-15.6,9.5c-.4.2-.8.2-1.2,0L7.8,8.8C6.6,8.1,5.2,8.7,4.8,10c-.2.6-.1,1.3.3,1.8l7.9,5.7v10.5h22V17.5l7.9-5.7c.4-.3.6-.9.4-1.5C43,9,41.5,8.2,40.2,8.8z" />
      <path fill="#c62828" d="M40.2,8.8L24,18.7L7.8,8.8C5.7,7.5,3,9,3,11.5v4.7l21,13.8l21-13.8v-4.7C45,9,42.3,7.5,40.2,8.8z" />
      <path fill="#fbc02d" d="M45,11.5v4.7l-7,5.1V9.8L40.2,8.8C42.3,7.5,45,9,45,11.5z" />
    </svg>
  )
}

/**
 * Official Instagram Gradient Logo
 */
export function InstagramLogo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="ig-gradient-fill" cx="0.2" cy="1" r="1">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-gradient-fill)" />
      <circle cx="12" cy="12" r="4.3" stroke="#ffffff" strokeWidth="1.8" fill="none" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="#ffffff" strokeWidth="1.8" fill="none" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="#ffffff" />
    </svg>
  )
}

/**
 * Official TikTok Logo with Cyan/Magenta Chromatic Aberration
 */
export function TikTokLogo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#000000" />
      {/* Cyan shadow */}
      <path
        fill="#25F4EE"
        d="M17.3 7.8c-.8-.5-1.4-1.2-1.7-2.1-.1-.3-.2-.7-.2-1h-2.1v10.3c0 1.6-1.3 2.9-2.9 2.9-1.2 0-2.3-.8-2.7-1.9-.5-1.3.1-2.8 1.4-3.4.4-.2.8-.3 1.3-.3v-2.3c-2.4 0-4.5 1.7-4.9 4.1-.5 2.7 1.4 5.2 4.1 5.6 2.7.5 5.2-1.4 5.6-4.1V10c1.2.9 2.7 1.4 4.2 1.4V9.2c-.8 0-1.5-.5-1.9-1.4z"
      />
      {/* Magenta shadow */}
      <path
        fill="#FE2C55"
        d="M16.9 7.4c-.8-.5-1.4-1.2-1.7-2.1-.1-.3-.2-.7-.2-1h-2.1v10.3c0 1.6-1.3 2.9-2.9 2.9-1.2 0-2.3-.8-2.7-1.9-.5-1.3.1-2.8 1.4-3.4.4-.2.8-.3 1.3-.3v-2.3c-2.4 0-4.5 1.7-4.9 4.1-.5 2.7 1.4 5.2 4.1 5.6 2.7.5 5.2-1.4 5.6-4.1V10c1.2.9 2.7 1.4 4.2 1.4V9.2c-.8 0-1.5-.5-1.9-1.4z"
      />
      {/* Crisp White Top Note */}
      <path
        fill="#FFFFFF"
        d="M17.1 7.6c-.8-.5-1.4-1.2-1.7-2.1-.1-.3-.2-.7-.2-1h-2.1v10.3c0 1.6-1.3 2.9-2.9 2.9-1.2 0-2.3-.8-2.7-1.9-.5-1.3.1-2.8 1.4-3.4.4-.2.8-.3 1.3-.3v-2.3c-2.4 0-4.5 1.7-4.9 4.1-.5 2.7 1.4 5.2 4.1 5.6 2.7.5 5.2-1.4 5.6-4.1V10c1.2.9 2.7 1.4 4.2 1.4V9.2c-.8 0-1.5-.5-1.9-1.4z"
      />
    </svg>
  )
}

/**
 * Official YouTube Red & White Logo
 */
export function YouTubeLogo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#FF0000" />
      <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="#FFFFFF" />
    </svg>
  )
}

/**
 * Backwards-compatible Monochrome SVGs
 */
export function InstagramIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <InstagramLogo className={className} />
}

export function TikTokIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <TikTokLogo className={className} />
}

export function YouTubeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <YouTubeLogo className={className} />
}
