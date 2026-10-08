export interface MatchableCategory {
  id: number
  name: string
  slug: string
}

const SYNONYM_MAP: Record<string, string[]> = {
  'beauty-skincare': [
    'beauty',
    'skincare',
    'skin',
    'cosmetics',
    'makeup',
    'hair',
    'haircare',
    'fragrance',
    'wellness',
    'beekman',
    'glossier',
    'sephora',
    'lotion',
    'serum',
  ],
  'tech-electronics': [
    'tech',
    'technology',
    'electronics',
    'gadgets',
    'apple',
    'audio',
    'software',
    'saas',
    'phone',
    'headphones',
    'airpods',
    'anker',
    'hardware',
    'computer',
  ],
  'fashion-apparel': [
    'fashion',
    'apparel',
    'clothing',
    'shoes',
    'sneakers',
    'activewear',
    'gymshark',
    'nike',
    'wear',
    'fitness',
    'athletic',
    'dress',
    'hoodie',
  ],
  'home-kitchen': [
    'home',
    'kitchen',
    'cooking',
    'furniture',
    'decor',
    'bedding',
    'appliances',
    'dining',
  ],
  'travel-lifestyle': [
    'travel',
    'lifestyle',
    'outdoor',
    'luggage',
    'hotel',
    'flight',
    'adventure',
  ],
  'beauty-wellness-brands': [
    'beauty',
    'skincare',
    'wellness',
    'cosmetics',
    'makeup',
    'beekman',
    'glossier',
  ],
  'ecommerce-brands': [
    'ecommerce',
    'e-commerce',
    'apparel',
    'brand',
    'fashion',
    'retail',
    'gymshark',
    'nike',
    'fitness',
    'clothing',
    'shop',
  ],
  'tech-saas': [
    'tech',
    'saas',
    'software',
    'ai',
    'platform',
    'app',
    'cloud',
    'digital',
  ],
  'beauty-wellness': [
    'beauty',
    'skincare',
    'skin',
    'cosmetics',
    'makeup',
    'hair',
    'haircare',
    'fragrance',
    'wellness',
    'bodycare',
    'lotion',
    'serum',
    'glossier',
    'sephora',
    'ulta',
  ],
  'tech-gadgets': [
    'tech',
    'technology',
    'gadgets',
    'electronics',
    'software',
    'saas',
    'app',
    'ios',
    'android',
    'ai',
    'audio',
    'headphones',
    'anker',
    'hardware',
    'accessory',
  ],
  'fashion-style': [
    'fashion',
    'apparel',
    'clothing',
    'style',
    'outfit',
    'shoes',
    'sneakers',
    'activewear',
    'streetwear',
    'gymshark',
    'nike',
    'wear',
    'jewelry',
    'accessories',
  ],
  'tiktok-ugc': [
    'tiktok',
    'ugc',
    'video',
    'shortform',
    'short-form',
    'creator',
    'influencer',
  ],
  'instagram-reels': [
    'instagram',
    'reels',
    'insta',
    'stories',
    'photo',
  ],
  'youtube-longform': [
    'youtube',
    'longform',
    'long-form',
    'video',
    'vlog',
  ],
}

/**
 * Robust Category Matcher
 * Matches AI suggested category or keywords to the available categories in the database.
 */
export function matchCategory<T extends MatchableCategory>(
  suggested: string | undefined | null,
  categories: T[]
): T | null {
  if (!suggested || !categories || categories.length === 0) return null

  const clean = suggested.toLowerCase().trim()

  // 1. Exact match by name or slug
  const exact = categories.find(
    (c) => c.name.toLowerCase() === clean || c.slug.toLowerCase() === clean
  )
  if (exact) return exact

  // 2. Substring match (e.g., "Beauty" matches "Beauty & Skincare", or "Beauty & Skincare" contains "Beauty")
  const substring = categories.find(
    (c) =>
      c.name.toLowerCase().includes(clean) ||
      clean.includes(c.name.toLowerCase()) ||
      c.slug.toLowerCase().includes(clean)
  )
  if (substring) return substring

  // 3. Synonym and Keyword heuristic
  for (const cat of categories) {
    const synonyms = SYNONYM_MAP[cat.slug] || []
    if (synonyms.some((syn) => clean.includes(syn) || syn.includes(clean))) {
      return cat
    }
  }

  // 4. Default to first category if single option, otherwise null
  return null
}
