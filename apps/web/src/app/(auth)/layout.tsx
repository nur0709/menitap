import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10">
        <Link href="/" className="inline-block">
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent tracking-tight">
            Menitap
          </span>
        </Link>
        <p className="mt-2 text-sm text-zinc-400">
          User-Generated Content & Deals Platform
        </p>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>

      {/* Footer links */}
      <div className="mt-8 text-center text-xs text-zinc-500 relative z-10">
        By continuing, you agree to Menitap&apos;s{' '}
        <Link href="#" className="underline hover:text-zinc-300">Terms of Service</Link>{' '}
        and{' '}
        <Link href="#" className="underline hover:text-zinc-300">Privacy Policy</Link>.
      </div>
    </div>
  )
}
