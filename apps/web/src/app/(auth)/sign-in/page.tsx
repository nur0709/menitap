import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GoogleButton } from '@/features/auth/components/google-button'
import { SignInForm } from '@/features/auth/components/sign-in-form'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <Card className="bg-card border-border shadow-xl transition-colors">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-foreground">Welcome back</CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign in to your Menitap account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            <p>{error}</p>
            {error.toLowerCase().includes('sign up') && (
              <Link
                href="/sign-up"
                className="mt-2 inline-flex items-center text-xs font-semibold text-[#FC801A] hover:underline"
              >
                Go to Sign Up page →
              </Link>
            )}
          </div>
        )}

        <GoogleButton />

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-card px-3 text-xs uppercase text-muted-foreground font-medium">
            or with email
          </span>
          <div className="border-t border-border w-full" />
        </div>

        <SignInForm />
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border/50 pt-4">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-[#FC801A] hover:text-[#E66F0D] font-medium">
            Sign up free
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
