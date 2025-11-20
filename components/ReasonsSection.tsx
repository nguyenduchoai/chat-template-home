import { getActiveReasons, getSiteInfoRecord } from '@/lib/db'
import { cn } from '@/lib/utils'

const FALLBACK_TITLE = 'Số liệu ấn tượng'
const FALLBACK_DESCRIPTION = 'Những con số chứng minh chất lượng dịch vụ của chúng tôi'

export default async function ReasonsSection() {
    const [reasons, siteInfo] = await Promise.all([
        getActiveReasons(),
        getSiteInfoRecord(),
    ])

    if (!reasons.length) return null

    const title = siteInfo?.reasonsTitle || FALLBACK_TITLE
    const description = siteInfo?.reasonsDescription || FALLBACK_DESCRIPTION
    const colClass = reasons.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'

    return (
        <section className="bg-gradient-to-t from-white to-blue-50 w-full py-8 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-12 space-y-3">
                    <h2 className="text-4xl font-bold">{title}</h2>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                        {description}
                    </p>
                </div>

                <div className={cn('grid gap-5 sm:grid-cols-2', colClass)}>
                    {reasons.map((reason) => (
                        <article
                            key={reason.id}
                            className="rounded-2xl bg-white p-6 text-center border border-slate-100 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-wide text-blue-600">{reason.icon}</div>
                            <h3 className="text-xl font-semibold mb-2 text-slate-900">{reason.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{reason.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
