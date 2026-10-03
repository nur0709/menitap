import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GoogleButton } from '@/features/auth/components/google-button'
import { SignUpForm } from '@/features/auth/components/sign-up-form'

export default function SignUpPage() {
  return (
    <Card className="bg-zinc-950 border-white/10 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
        <CardDescription className="text-zinc-400">
          Join Menitap to start creating or discovering deals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleButton />

        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-zinc-950 px-3 text-xs uppercase text-zinc-500 font-medium">
            or with email
          </span>
          <div className="border-t border-white/10 w-full" />
        </div>

        <SignUpForm />
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/5 pt-4">
        <p className="text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-purple-400 hover:text-purple-300 font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
