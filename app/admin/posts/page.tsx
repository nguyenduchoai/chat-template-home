"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { Plus, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { getImageUrl } from "@/lib/image-utils"
import { Skeleton } from "@/components/ui/skeleton"

interface Post {
    id: string
    title: string
    slug: string
    excerpt?: string | null
    coverImage?: string | null
    published: boolean
    publishedAt: Date | null
    createdAt: Date
}

const PostSkeletonCard = () => (
    <Card className="overflow-hidden animate-pulse">
        <div className="w-full h-40 bg-muted" />
        <CardHeader>
            <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </CardHeader>
        <div className="px-6 pb-6 flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-24" />
        </div>
    </Card>
)

export default function AdminPostsPage() {
    // Auth is already checked in admin layout
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const { showToast } = useToast()

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            const response = await fetch("/api/admin/posts/all")
            if (response.ok) {
                const data = await response.json()
                setPosts(data)
            }
        } catch (error) {
            console.error("Error fetching posts:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingPostId(id)
        try {
            const response = await fetch(`/api/admin/posts/${id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                const result = await response.json()
                setPosts(posts.filter((post) => post.id !== id))
                showToast(
                    "success",
                    `Đã xóa bài viết thành công${result.deletedImagesCount > 0 ? ` và ${result.deletedImagesCount} ảnh` : ""}`
                )
            } else {
                const error = await response.json()
                showToast("error", error.error || "Không thể xóa bài viết")
            }
        } catch (error: any) {
            console.error("Error deleting post:", error)
            showToast("error", error.message || "Có lỗi xảy ra khi xóa bài viết")
        } finally {
            setDeletingPostId(null)
            setConfirmDeleteId(null)
        }
    }



    return (
        <main className="container py-12 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Quản lý bài viết</h1>
                    <p className="text-muted-foreground mt-2">
                        Tạo, chỉnh sửa và xóa bài viết
                    </p>
                </div>
                <Link href="/admin/posts/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tạo bài viết mới
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <PostSkeletonCard key={`post-skeleton-${index}`} />
                    ))}
                </div>
            ) : (
                <>
                    {posts.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        {post.coverImage && (
                                            <div className="relative w-full h-48 overflow-hidden">
                                                <Image
                                                    src={getImageUrl(post.coverImage)}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        )}
                                        <CardHeader>
                                            <div className="space-y-2">
                                                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                                                {post.excerpt && (
                                                    <CardDescription className="line-clamp-2">
                                                        {post.excerpt}
                                                    </CardDescription>
                                                )}
                                                <CardDescription className="text-xs">
                                                    Slug: {post.slug}
                                                    {post.publishedAt && (
                                                        <>
                                                            {" • "}
                                                            {format(new Date(post.publishedAt), "dd MMM yyyy", { locale: vi })}
                                                        </>
                                                    )}
                                                    {!post.published && " • Chưa xuất bản"}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                        <div className="px-6 pb-6 flex gap-2">
                                            <Link href={`/admin/posts/${post.id}`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full gap-2">
                                                    <Edit className="h-4 w-4" />
                                                    Sửa
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="gap-2  text-white"
                                                onClick={() => setConfirmDeleteId(post.id)}
                                                disabled={deletingPostId === post.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                {deletingPostId === post.id ? "..." : "Xóa"}
                                            </Button>
                                        </div>
                                    </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">Chưa có bài viết nào</p>
                            <Link href="/admin/posts/new">
                                <Button>Tạo bài viết đầu tiên</Button>
                            </Link>
                        </div>
                    )}
                </>
            )}

            <ConfirmDialog
                open={confirmDeleteId !== null}
                onOpenChange={(open) => !open && setConfirmDeleteId(null)}
                title="Xác nhận xóa bài viết"
                description="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác và sẽ xóa tất cả ảnh liên quan."
                confirmText="Xóa"
                cancelText="Hủy"
                destructive
                onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                loading={deletingPostId !== null}
            />
        </main>
    )
}

