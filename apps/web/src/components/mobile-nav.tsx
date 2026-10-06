'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/brand-logo'
import {
  Menu,
  X,
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  currentPath?: string
  role?: string | null
}

export function MobileNav({ currentPath: initialPath }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const activePath = pathname || initialPath || ''

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )


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
      label: 'Deals',
      href: '/deals',
      icon: ShoppingBag,
      description: 'Discounts & verified promo codes',
    },
    {
      label: 'Brand Collabs',
      href: '/collabs',
      icon: Package,
      description: 'Brand collaborations & UGC reviews',
    },
    {
      label: 'Creators',
      href: '/creators',
      icon: Users,
      description: 'Standard creator portfolios & directory',
    },
    {
      label: 'Plans',
      href: '/plans',
      icon: CreditCard,
      description: 'Creator memberships & pricing',
    },
    {
      label: 'About',
      href: '/about',
      icon: Info,
      description: 'Learn about our ecosystem',
    },
  ]


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

      {/* Drawer Overlay & Content Portalled to document.body */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu Panel from Left */}
          <div
            id="mobile-navigation-menu"
            className="fixed inset-y-0 left-0 z-10 w-[82%] max-w-xs bg-background border-r border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200"
          >
            {/* Header of Drawer */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <BrandLogo size="sm" />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav Items List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activePath === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium',
                      isActive
                        ? 'ring-2 ring-[#FC801A] text-[#FC801A] bg-[#FC801A]/10 font-bold shadow-xs'
                        : 'text-foreground hover:bg-muted/70 hover:ring-1 hover:ring-[#FC801A]/30'
                    )}
                  >
                    <div
                      className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                        isActive
                          ? 'bg-[#FC801A]/20 text-[#FC801A]'
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
            </div>

            {/* Bottom Footer */}
            <div className="p-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Menitap © 2026
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
