import Image from 'next/image'
import { getActiveFeatures, getSiteInfoRecord } from '@/lib/db'

const FALLBACK_TITLE = 'Tại sao chọn AI nha khoa?'
const FALLBACK_DESCRIPTION = 'Nền tảng AI cơ mối phần khoa, tư vấn chăm sóc răng miệng từ đội ngũ bác sĩ chuyên môn'

export default async function FeaturesSection() {
    const [features, siteInfo] = await Promise.all([
        getActiveFeatures(),
        getSiteInfoRecord(),
    ])

    if (!features.length) return null

    const title = siteInfo?.featuresTitle || FALLBACK_TITLE
    const description = siteInfo?.featuresDescription || FALLBACK_DESCRIPTION

    return (
        <section className="bg-gradient-to-b from-white to-blue-50 w-full py-8 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">{title}</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        {description}
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {features.map((feature) => (
                        <article
                            key={feature.id}
                            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                {feature.icon?.startsWith('http') ? (
                                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-blue-50 flex-shrink-0">
                                        <Image
                                            src={feature.icon}
                                            alt={feature.title}
                                            fill
                                            sizes="56px"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                                        {feature.icon || '✨'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed flex-1">{feature.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
