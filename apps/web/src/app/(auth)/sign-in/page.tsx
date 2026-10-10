import { AuthCard } from '@/features/auth/components/auth-card'
import { safeNextPath } from '@/lib/safe-next-path'

export const metadata = {
  title: 'Sign In | Menitap',
  description: 'Sign in to your Menitap account',
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; redirect?: string }>
}) {
  const params = await searchParams
  const redirectParam = safeNextPath(params.redirectTo) ?? safeNextPath(params.redirect) ?? undefined
  return <AuthCard initialMode="login" redirectParam={redirectParam} />
}
