-- Backfill default copy for Features & Reasons sections in SiteInfo

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "SiteInfo") THEN
        INSERT INTO "SiteInfo" (
            "featuresTitle",
            "featuresDescription",
            "reasonsTitle",
            "reasonsDescription"
        )
        VALUES (
            'Tại sao chọn AI nha khoa?',
            'Nền tảng AI cơ mối phần khoa, tư vấn chăm sóc răng miệng từ đội ngũ bác sĩ chuyên môn',
            'Số liệu ấn tượng',
            'Những con số chứng minh chất lượng dịch vụ của chúng tôi'
        );
    ELSE
        UPDATE "SiteInfo"
        SET
            "featuresTitle" = CASE
                WHEN COALESCE("featuresTitle", '') = '' THEN 'Tại sao chọn AI nha khoa?'
                ELSE "featuresTitle"
            END,
            "featuresDescription" = CASE
                WHEN COALESCE("featuresDescription", '') = '' THEN 'Nền tảng AI cơ mối phần khoa, tư vấn chăm sóc răng miệng từ đội ngũ bác sĩ chuyên môn'
                ELSE "featuresDescription"
            END,
            "reasonsTitle" = CASE
                WHEN COALESCE("reasonsTitle", '') = '' THEN 'Số liệu ấn tượng'
                ELSE "reasonsTitle"
            END,
            "reasonsDescription" = CASE
                WHEN COALESCE("reasonsDescription", '') = '' THEN 'Những con số chứng minh chất lượng dịch vụ của chúng tôi'
                ELSE "reasonsDescription"
            END;
    END IF;
END $$;

