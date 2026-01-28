import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import {
    getAllColorConfigs,
    getColorConfigByKey,
    upsertColorConfig,
    deleteColorConfig,
    type ColorConfig,
} from "@/lib/db"
import { oklchToHex } from "@/lib/color-utils"

export async function GET() {
    try {
        const colorConfigs = await getAllColorConfigs()
        return NextResponse.json(colorConfigs)
    } catch (error) {
        console.error("Error fetching color configs:", error)
        return NextResponse.json(
            { error: "Failed to fetch color configs" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        await requireAdmin()
        const payload = await request.json()

        if (!payload.key || !payload.value) {
            return NextResponse.json(
                { error: "key và value là bắt buộc" },
                { status: 400 }
            )
        }

        // Tự động tính toán rgbValue từ OKLCH nếu chưa có
        let rgbValue = payload.rgbValue
        if (!rgbValue && payload.value && payload.value.startsWith("oklch(")) {
            rgbValue = oklchToHex(payload.value)
        }

        const config = await upsertColorConfig({
            key: payload.key,
            value: payload.value,
            rgbValue: rgbValue,
            description: payload.description,
        })

        if (!config) {
            return NextResponse.json(
                { error: "Failed to create/update color config" },
                { status: 500 }
            )
        }

        return NextResponse.json(config)
    } catch (error) {
        console.error("Error creating/updating color config:", error)
        return NextResponse.json(
            { error: "Failed to create/update color config" },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        await requireAdmin()
        
        const payload = await request.json()

        if (!Array.isArray(payload)) {
            return NextResponse.json(
                { error: "Payload phải là một mảng các color config" },
                { status: 400 }
            )
        }

        const results = await Promise.allSettled(
            payload.map((item) => {
                // Tự động tính toán rgbValue từ OKLCH nếu chưa có
                let rgbValue = item.rgbValue
                if (!rgbValue && item.value && item.value.startsWith("oklch(")) {
                    rgbValue = oklchToHex(item.value)
                }
                return upsertColorConfig({
                    key: item.key,
                    value: item.value,
                    rgbValue: rgbValue,
                    description: item.description,
                })
            })
        )

        const successful = results
            .filter((r) => r.status === "fulfilled" && r.value !== null)
            .map((r) => (r as PromiseFulfilledResult<ColorConfig>).value)

        const failed = results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && r.value === null))

        if (failed.length > 0) {
            console.error("Some color configs failed to save:", failed)
        }

        if (successful.length === 0) {
            return NextResponse.json(
                { error: "Không có màu sắc nào được lưu thành công" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            saved: successful.length,
            total: payload.length,
            data: successful,
        })
    } catch (error) {
        console.error("Error updating color configs:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to update color configs"
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    try {
        await requireAdmin()
        const { searchParams } = new URL(request.url)
        const key = searchParams.get("key")

        if (!key) {
            return NextResponse.json(
                { error: "key là bắt buộc" },
                { status: 400 }
            )
        }

        const success = await deleteColorConfig(key)

        if (!success) {
            return NextResponse.json(
                { error: "Failed to delete color config" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting color config:", error)
        return NextResponse.json(
            { error: "Failed to delete color config" },
            { status: 500 }
        )
    }
}

