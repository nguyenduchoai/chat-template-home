import SlideShow from "@/components/SlideShow"
import HeroSection from "@/components/HeroSection"
import FeaturesSectionDental from "@/components/FeaturesSectionDental"
import StatsSectionDental from "@/components/StatsSectionDental"
import { PostsSection } from "@/components/PostsSection"
import { getPublishedPosts, getSiteInfoRecord } from "@/lib/db"

// Force dynamic rendering - không cache static
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPosts() {
  try {
    const posts = await getPublishedPosts(6)
    return posts
  } catch (error) {
    console.error("[getPosts] Error fetching posts:", error)
    return []
  }
}

async function getSiteSettings() {
  try {
    const siteInfo = await getSiteInfoRecord()
    return {
      showSlides: !!siteInfo?.showSlides,
      showBanner: !!siteInfo?.showBanner,
      showFeatures: !!siteInfo?.showFeatures,
      showReasons: !!siteInfo?.showReasons,
      showPosts: !!siteInfo?.showPosts,
    }
  } catch (error) {
    console.error("[getSiteSettings] Error:", error)
    return {
      showSlides: true,
      showBanner: true,
      showFeatures: true,
      showReasons: true,
      showPosts: true,
    }
  }
}

export default async function Home() {
  const [posts, settings] = await Promise.all([getPosts(), getSiteSettings()])

  return (
    <main className="dental-home min-h-screen">
      {settings.showSlides && <SlideShow />}
      {settings.showBanner && <HeroSection />}
      {settings.showFeatures && <FeaturesSectionDental />}
      {settings.showReasons && <StatsSectionDental />}
      {settings.showPosts && <PostsSection posts={posts} />}
    </main>
  )
}
