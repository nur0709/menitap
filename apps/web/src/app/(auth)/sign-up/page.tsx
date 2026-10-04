import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SignUpForm } from '@/features/auth/components/sign-up-form'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role: rawRole } = await searchParams
  const defaultRole = (
    rawRole && ['USER', 'CREATOR', 'BRAND'].includes(rawRole.toUpperCase())
      ? rawRole.toUpperCase()
      : 'USER'
  ) as 'USER' | 'CREATOR' | 'BRAND'

  return (
    <Card className="bg-card border-border shadow-xl transition-colors">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-foreground">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground">
          Join Menitap to start creating or discovering deals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm defaultRole={defaultRole} />
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border/50 pt-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-[#FC801A] hover:text-[#E66F0D] font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
