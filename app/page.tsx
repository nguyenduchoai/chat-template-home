import Banner from "@/components/Banner"
import ChatBar from "@/components/ChatBar"
import PostCard from "@/components/PostCard"
import SlideShow from "@/components/SlideShow"
import FeaturesSection from "@/components/FeaturesSection"
import ReasonsSection from "@/components/ReasonsSection"
import { getPublishedPosts } from "@/lib/db"

async function getPosts() {
  try {
    const posts = await getPublishedPosts(6)
    return posts
  } catch (error) {
    console.error("[getPosts] Error fetching posts:", error)
    return []
  }
}

export default async function Home() {
  const posts = await getPosts()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <SlideShow />
      <Banner />
      <ChatBar />

      <FeaturesSection />
      <ReasonsSection />

      <section className="container py-12 px-4">
        <div className="mb-8 ">
          <h2 className="text-3xl font-bold tracking-tight">Bài viết mới nhất</h2>
          <p className="text-muted-foreground mt-2">
            Khám phá các bài viết về AI và công nghệ
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chưa có bài viết nào. Hãy quay lại sau!</p>
          </div>
        )}

        {posts.length > 0 && (
          <div className="mt-8 text-center">
            <a
              href="/bai-viet"
              className="text-primary hover:underline font-medium"
            >
              Xem tất cả bài viết →
            </a>
          </div>
        )}
      </section>
    </main>
  )
}
