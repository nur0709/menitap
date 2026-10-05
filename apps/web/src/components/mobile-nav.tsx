'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Menu,
  X,
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  Info,
  User,
  LogIn,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  currentPath?: string
  role?: string | null
}

export function MobileNav({ currentPath: initialPath, role }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const activePath = pathname || initialPath || ''

  const isCreator = role === 'CREATOR' || role === 'ADMIN'
  const isBrand = role === 'BRAND' || role === 'ADMIN'

  // Close automatically on pathname change without cascading renders
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setIsOpen(false)
  }

  // Close when Escape key is pressed & lock body scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const navItems = [
    {
      label: 'Explore Deals',
      href: '/for-shoppers',
      icon: ShoppingBag,
      visible: true,
      description: 'Discounts & verified promo codes',
    },
    {
      label: 'Campaign Links',
      href: '/for-creators',
      icon: Package,
      visible: isCreator || isBrand,
      description: 'Brand collaborations & UGC reviews',
    },
    {
      label: 'Explore Creators',
      href: '/for-brands',
      icon: Users,
      visible: isBrand,
      description: 'Standard creator portfolios',
    },
    {
      label: 'Plans & Pricing',
      href: '/plans',
      icon: CreditCard,
      visible: true,
      description: 'Creator and brand memberships',
    },
    {
      label: 'About Menitap',
      href: '/about',
      icon: Info,
      visible: true,
      description: 'Learn about our platform',
    },
  ].filter((item) => item.visible)

  return (
    <div className="md:hidden">
      {/* Menu Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-menu"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-9 w-9 p-0 rounded-lg border border-border/70 hover:bg-muted text-foreground transition-colors cursor-pointer"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Drawer Overlay & Content */}
      {isOpen && (
        <div className="fixed inset-0 top-[73px] sm:top-[81px] z-50 flex flex-col">
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 top-[73px] sm:top-[81px] bg-black/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div
            id="mobile-navigation-menu"
            className="relative z-10 w-full bg-background border-b border-border shadow-2xl p-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] animate-in slide-in-from-top-2 duration-200"
          >
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 pt-1 pb-1">
                Navigation
              </p>

              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activePath === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all text-sm font-medium',
                      isActive
                        ? 'bg-[#08739C]/10 text-[#08739C] dark:text-[#38BDF8] border border-[#08739C]/30 font-semibold shadow-xs'
                        : 'text-foreground/80 hover:text-foreground hover:bg-muted/70 border border-transparent'
                    )}
                  >
                    <div
                      className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                        isActive
                          ? 'bg-[#08739C] text-white shadow-xs'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-sm leading-tight">{item.label}</span>
                      <span className="text-[11px] text-muted-foreground leading-tight mt-0.5 font-normal">
                        {item.description}
                      </span>
                    </div>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-[#FC801A] shrink-0" />
                    )}
                  </Link>
                )
              })}

              <div className="my-2 border-t border-border" />

              {/* Bottom Quick Action: My Account or Sign In */}
              {role ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all text-sm font-medium',
                    activePath === '/dashboard'
                      ? 'bg-[#FC801A]/10 text-[#FC801A] border border-[#FC801A]/30 font-semibold'
                      : 'text-foreground/80 hover:text-foreground hover:bg-muted/70 border border-transparent'
                  )}
                >
                  <div className="h-8 w-8 rounded-lg bg-[#FC801A]/10 text-[#FC801A] flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm leading-tight">My Account</span>
                    <span className="text-[11px] text-muted-foreground leading-tight mt-0.5 font-normal">
                      Profile, subscription & settings
                    </span>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl bg-[#FC801A] text-white font-semibold text-sm hover:bg-[#E66F0D] transition-all shadow-xs"
                >
                  <LogIn className="h-4 w-4 shrink-0" />
                  <span>Sign In / Create Account</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
