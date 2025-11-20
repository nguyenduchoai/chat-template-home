-- Seed data for Features and Reasons sections

-- Insert sample features
INSERT INTO "Features" (id, icon, title, description, "order", active, created_at, updated_at)
VALUES 
    (
        gen_random_uuid(),
        '🕐',
        'Tư vấn 24/7',
        'AI tư vấn cho khoa mục lục, mọi lúc, giải đáp nhanh nhưng vấn đề khi khác hàng hỏi miễn phí trực tuyến hàng ngày',
        1,
        true,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        '🎯',
        'Chính xác cao',
        'Phân tích trả lời chính, dữ liệu từ hệ thống phương án trực tiếp từ chính nha khoa và các chuyên gia nha khoa',
        2,
        true,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        '🛡️',
        'Bảo mật tuyệt đối',
        'Thông tin khác hàng được mã hóa bọn nhằm hoàn toàn bảo mật thông tin riêng tư của quý khách',
        3,
        true,
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- Insert sample reasons
INSERT INTO "Reasons" (id, icon, title, description, "order", active, created_at, updated_at)
VALUES 
    (
        gen_random_uuid(),
        '15K+',
        'Bệnh nhân đã tư vấn',
        'Hơn 15,000 khách hàng đã tin tưởng và sử dụng dịch vụ tư vấn AI của chúng tôi',
        1,
        true,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        '300+',
        'Vấn đề nha khoa',
        'Cơ sở dữ liệu phong phú với hơn 300 vấn đề nha khoa phổ biến',
        2,
        true,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        '95%',
        'Độ chính xác',
        'Độ chính xác cao trong việc tư vấn và giải đáp thắc mắc',
        3,
        true,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        '98%',
        'Khách hàng hài lòng',
        'Tỷ lệ khách hàng hài lòng và quay lại sử dụng dịch vụ',
        4,
        true,
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- Update SiteInfo with section titles
UPDATE "SiteInfo" 
SET 
    "featuresTitle" = 'Tại sao chọn AI nha khoa?',
    "featuresDescription" = 'Nền tảng AI cơ mối phần khoa, tư vấn chăm sóc răng miệng từ đội ngũ bác sĩ chuyên môn',
    "reasonsTitle" = 'Số liệu ấn tượng',
    "reasonsDescription" = 'Những con số chứng minh chất lượng dịch vụ của chúng tôi';
