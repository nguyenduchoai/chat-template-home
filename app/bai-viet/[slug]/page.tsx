import Link from "next/link"
import { notFound } from "next/navigation"
import Image from "next/image"
import type { Post } from "@/lib/db"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { getImageUrl, transformHtmlImageUrls } from "@/lib/image-utils"

async function fetchPost(slug: string): Promise<Post | null> {
    try {
        const response = await fetch(`/api/public/posts/${slug}`, { cache: "no-store" })
        if (!response.ok) return null
        const data = await response.json()
        return {
            ...data,
            publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
            createdAt: data.createdAt ? new Date(data.createdAt) : null,
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
        }
    } catch (error: any) {
        console.error("Error fetching post:", error)
        return null
    }
}

export default async function PostDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const post = await fetchPost(slug)

    if (!post) {
        notFound()
    }

    return (
        <main className="flex flex-col items-center justify-center pt-16">
            <div className="container max-w-4xl mx-auto px-4 py-12">
                <nav className="mb-8 flex items-center text-sm text-muted-foreground gap-2">
                    <Link href="/" className="hover:text-foreground transition">Trang chủ</Link>
                    <span>/</span>
                    <Link href="/bai-viet" className="hover:text-foreground transition">Bài viết</Link>
                    <span>/</span>
                    <span className="text-foreground line-clamp-1">{post.title}</span>
                </nav>
                <article>
                    <header className="mb-8">
                        <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                            <span>{post.author?.name || "Admin"}</span>
                            {post.publishedAt && (
                                <>
                                    <span>•</span>
                                    <time dateTime={post.publishedAt.toISOString()}>
                                        {format(new Date(post.publishedAt), "dd MMMM yyyy", { locale: vi })}
                                    </time>
                                </>
                            )}
                        </div>

                        {post.coverImage && (
                            <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
                                <Image
                                    src={getImageUrl(post.coverImage)}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    unoptimized
                                />
                            </div>
                        )}
                    </header>

                    <div
                        className="prose prose-lg dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                            __html: transformHtmlImageUrls(post.content)
                        }}
                    />
                </article>
            </div>
        </main>
    )
}

