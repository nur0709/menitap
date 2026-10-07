import { AuthCard } from '@/features/auth/components/auth-card'

export const metadata = {
  title: 'Sign In | Menitap',
  description: 'Sign in to your Menitap account',
}

export default async function SignInPage() {
  return <AuthCard initialMode="login" />
}
