import { getSiteInfoRecord } from "./db"

const FALLBACK_SITE_INFO = {
  siteUrl: "https://saigondental.ai",
  title: "AI Platform",
  name: "AI Platform",
  description: "Nền tảng khám phá trí tuệ nhân tạo.",
  author: "AI Platform",
}

export interface SiteInfo {
  siteUrl: string
  title: string
  name?: string
  logo?: string
  bannerTitle?: string
  bannerDescription?: string
  description: string
  keywords?: string
  author: string
  email?: string
  phone?: string
  facebook?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
  address?: string
  contact?: string
  locale?: string
  language?: string
  charset?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  featuresTitle?: string
  featuresDescription?: string
  reasonsTitle?: string
  reasonsDescription?: string
}

// Server-side: Get from database
export async function getSiteInfo(): Promise<SiteInfo> {
  try {
    const siteInfo = await getSiteInfoRecord()
    if (siteInfo) {
      return siteInfo as SiteInfo
    }
    return FALLBACK_SITE_INFO as SiteInfo
  } catch (error) {
    console.warn('Failed to fetch site info from DB, using fallback:', error)
    return FALLBACK_SITE_INFO as SiteInfo
  }
}

// Client-side: Get from API
export async function getSiteInfoClient(): Promise<SiteInfo> {
  try {
    const response = await fetch("/api/public/site-info")
    if (!response.ok) throw new Error('Failed to fetch')
    const data = await response.json()
    return data
  } catch (error) {
    console.warn('Failed to fetch site info from API, using fallback:', error)
    return FALLBACK_SITE_INFO as SiteInfo
  }
}

