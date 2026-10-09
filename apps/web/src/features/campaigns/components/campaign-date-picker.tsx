'use client'

import { useState, useMemo } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface CampaignDatePickerProps {
  value: string | null | undefined
  onChange: (newValue: string | null) => void
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function CampaignDatePicker({ value, onChange }: CampaignDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Parse YYYY-MM-DD safely without timezone shifts
  const parsedDate = useMemo(() => {
    if (!value) return null
    const dateStr = value.split('T')[0]
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return { year, month, day }
      }
    }
    return null
  }, [value])

  const today = useMemo(() => {
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
    }
  }, [])

  const [viewYear, setViewYear] = useState<number>(() => parsedDate?.year ?? today.year)
  const [viewMonth, setViewMonth] = useState<number>(() => parsedDate?.month ?? today.month)

  const handleToggleOpen = () => {
    if (!isOpen) {
      // Sync view to current selection or today when opening
      setViewYear(parsedDate?.year ?? today.year)
      setViewMonth(parsedDate?.month ?? today.month)
    }
    setIsOpen((prev) => !prev)
  }

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const handleSelectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    const isoString = `${viewYear}-${m}-${d}T23:59:59Z`
    onChange(isoString)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setIsOpen(false)
  }

  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation()
    const m = String(today.month + 1).padStart(2, '0')
    const d = String(today.day).padStart(2, '0')
    const todayIso = `${today.year}-${m}-${d}T23:59:59Z`
    setViewYear(today.year)
    setViewMonth(today.month)
    onChange(todayIso)
    setIsOpen(false)
  }

  // Days calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  const buttonText = parsedDate
    ? `${SHORT_MONTH_NAMES[parsedDate.month]} ${parsedDate.day}, ${parsedDate.year}`
    : 'Set date'

  return (
    <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-2.5 transition-colors">
      {/* Header row: Due Date on left, Outlined Calendar Button on right */}
      <div
        onClick={handleToggleOpen}
        className="flex items-center justify-between gap-2.5 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Calendar className="h-4 w-4 text-[#FC801A] shrink-0" />
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block truncate">
            Due Date
          </span>
        </div>

        {/* Outlined calendar trigger button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleToggleOpen()
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border border-[#FC801A]/30 bg-[#FC801A]/10 hover:bg-[#FC801A]/20 text-[#FC801A] cursor-pointer shadow-xs transition-colors shrink-0"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>{buttonText}</span>
        </button>
      </div>

      {/* Inline Calendar (expands without opening any pop up) */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pt-2.5 border-t border-border/60 space-y-2.5 animate-in fade-in duration-150"
        >
          {/* Month / Year header navigation */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs font-bold text-foreground">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-muted-foreground">
            {DAY_NAMES.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isSelected =
                parsedDate?.year === viewYear &&
                parsedDate?.month === viewMonth &&
                parsedDate?.day === day
              const isCurrentDay =
                today.year === viewYear && today.month === viewMonth && today.day === day

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#FC801A] text-white font-bold shadow-xs'
                      : isCurrentDay
                        ? 'border border-[#FC801A]/60 text-[#FC801A] font-bold hover:bg-[#FC801A]/10'
                        : 'text-foreground hover:bg-muted/80'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Action buttons: Clear and Today */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-[#FC801A] hover:bg-[#FC801A]/15 rounded-lg transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
