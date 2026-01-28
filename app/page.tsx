import Banner from "@/components/Banner"
import SlideShow from "@/components/SlideShow"
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
      showSlides: siteInfo?.showSlides !== false,
      showBanner: siteInfo?.showBanner !== false,
      showPosts: siteInfo?.showPosts !== false,
    }
  } catch (error) {
    console.error("[getSiteSettings] Error:", error)
    // Default to show all sections
    return {
      showSlides: true,
      showBanner: true,
      showPosts: true,
    }
  }
}

export default async function Home() {
  const [posts, settings] = await Promise.all([getPosts(), getSiteSettings()])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      {settings.showSlides && <SlideShow />}
      {settings.showBanner && <Banner />}
      {settings.showPosts && <PostsSection posts={posts} />}
    </main>
  )
}
