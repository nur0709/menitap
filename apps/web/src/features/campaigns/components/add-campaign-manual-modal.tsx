'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createManualCampaign } from '../actions'
import { Plus, X, Loader2, Building2, DollarSign, Calendar, Package } from 'lucide-react'

export function AddCampaignManualModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form Fields
  const [brandName, setBrandName] = useState('')
  const [productName, setProductName] = useState('')
  const [compensation, setCompensation] = useState('')
  const [deliverables, setDeliverables] = useState('')
  const [deadline, setDeadline] = useState('')
  const [rawSourceText, setRawSourceText] = useState('')
  const [notes, setNotes] = useState('')

  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData()
    formData.append('brand_name', brandName)
    formData.append('product_name', productName)
    formData.append('compensation', compensation)
    formData.append('deliverables', deliverables)
    formData.append('deadline', deadline)
    formData.append('raw_source_text', rawSourceText)
    formData.append('notes', notes)

    startTransition(async () => {
      const res = await createManualCampaign(null, formData)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
          setBrandName('')
          setProductName('')
          setCompensation('')
          setDeliverables('')
          setDeadline('')
          setRawSourceText('')
          setNotes('')
          router.refresh()
        }, 800)
      }
    })
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        className="bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 font-semibold shadow-xs cursor-pointer text-xs h-8 px-3.5 rounded-xl inline-flex items-center gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>New Campaign</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl text-left max-h-[92vh] flex flex-col">
            {/* Close */}
            <button
              onClick={() => !isPending && setIsOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-bold text-foreground">New Campaign</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Track a brand deal, sponsorship, or deliverables.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            {success ? (
              <div className="p-8 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                ✓ Deal card created successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 overflow-y-auto pr-1 flex-1">
                {/* Brand Name */}
                <div className="space-y-1">
                  <Label htmlFor="deal_brand_name" className="text-xs font-medium text-foreground">
                    Brand Name *
                  </Label>
                  <div className="relative">
                    <Building2 className="h-3.5 w-3.5 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="deal_brand_name"
                      required
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Gymshark, Glossier, Anker"
                      className="pl-8 bg-background border-border text-xs h-9"
                    />
                  </div>
                </div>

                {/* Product Name */}
                <div className="space-y-1">
                  <Label htmlFor="deal_product_name" className="text-xs font-medium text-foreground">
                    Product / Campaign Title
                  </Label>
                  <Input
                    id="deal_product_name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Seamless Training Set, Milk Primer"
                    className="bg-background border-border text-xs h-9"
                  />
                </div>

                {/* Compensation & Due Date Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="deal_compensation" className="text-xs font-medium text-foreground">
                      Agreed Pay / Compensation
                    </Label>
                    <div className="relative">
                      <DollarSign className="h-3.5 w-3.5 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        id="deal_compensation"
                        value={compensation}
                        onChange={(e) => setCompensation(e.target.value)}
                        placeholder="e.g. $350 or Gifted + 15%"
                        className="pl-8 bg-background border-border text-xs h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="deal_deadline" className="text-xs font-medium text-foreground">
                      Due Date / Deadline
                    </Label>
                    <div className="relative">
                      <Calendar className="h-3.5 w-3.5 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        id="deal_deadline"
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="pl-8 bg-background border-border text-xs h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Deliverables */}
                <div className="space-y-1">
                  <Label htmlFor="deal_deliverables" className="text-xs font-medium text-foreground">
                    Deliverables
                  </Label>
                  <div className="relative">
                    <Package className="h-3.5 w-3.5 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="deal_deliverables"
                      value={deliverables}
                      onChange={(e) => setDeliverables(e.target.value)}
                      placeholder="e.g. 1x 30s TikTok UGC Video, raw files, 30-day ads"
                      className="pl-8 bg-background border-border text-xs h-9"
                    />
                  </div>
                </div>

                {/* Raw Brief Text / Email */}
                <div className="space-y-1">
                  <Label htmlFor="deal_raw_text" className="text-xs font-medium text-foreground">
                    Paste Raw Email / Brief Notes (Optional)
                  </Label>
                  <textarea
                    id="deal_raw_text"
                    rows={3}
                    value={rawSourceText}
                    onChange={(e) => setRawSourceText(e.target.value)}
                    placeholder="Paste email conversation, shipping tracking numbers, or brand guidelines here..."
                    className="w-full rounded-xl bg-background border border-border p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-[#08739C] leading-relaxed resize-none font-mono"
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => setIsOpen(false)}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 text-xs font-semibold cursor-pointer rounded-xl h-9 px-4"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Saving...
                      </>
                    ) : (
                      'Save Deal Card'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
