import Link from "next/link"
import Image from "@/components/ui/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { getImageUrl } from "@/lib/image-utils"

interface PostCardProps {
    post: {
        id: string
        title: string
        slug: string
        excerpt?: string | null
        coverImage?: string | null
        publishedAt?: Date | null
        author?: {
            name?: string | null
        }
    }
}

export default function PostCard({ post }: PostCardProps) {
    return (
        <Link href={`/bai-viet/${post.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                {post.coverImage && (
                    <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
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
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    {post.excerpt && (
                        <CardDescription className="line-clamp-3">
                            {post.excerpt}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{post.author?.name || "Admin"}</span>
                        {post.publishedAt && (
                            <span>
                                {format(new Date(post.publishedAt), "dd MMM yyyy", { locale: vi })}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

