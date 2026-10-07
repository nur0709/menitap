import { AuthCard, type AccountType } from '@/features/auth/components/auth-card'

export const metadata = {
  title: 'Sign Up | Menitap',
  description: 'Create an account on Menitap',
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role: rawRole } = await searchParams
  const defaultRole = (
    rawRole && ['USER', 'CREATOR'].includes(rawRole.toUpperCase())
      ? rawRole.toUpperCase()
      : 'USER'
  ) as AccountType

  return <AuthCard initialMode="signup" initialRole={defaultRole} />
}
