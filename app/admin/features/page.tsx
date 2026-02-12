'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { Feature } from '@/lib/db'
import { Pencil, Trash2, GripVertical, Plus } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from '@/components/editor/image-upload'
import Image from 'next/image'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type FeatureFormValues = {
    icon: string
    title: string
    description: string
    active: boolean
}

function SortableItem({ feature, onEdit, onDelete }: {
    feature: Feature
    onEdit: (feature: Feature) => void
    onDelete: (id: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: feature.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex flex-col gap-4 p-4 bg-card border rounded-lg hover:shadow-md transition-shadow sm:flex-row sm:items-center"
        >
            <div className="flex flex-1 gap-4">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-muted-foreground flex-shrink-0 pt-1"
                >
                    <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex gap-3 flex-1">
                    {feature.icon.startsWith('http') || feature.icon.startsWith('/') ? (
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden border flex-shrink-0 bg-muted">
                            <Image
                                src={feature.icon}
                                alt={feature.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <span className="text-3xl">{feature.icon}</span>
                    )}
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-base">{feature.title}</h3>
                            {!feature.active && (
                                <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">Ẩn</span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 justify-end sm:justify-start">
                <Button variant="outline" size="sm" onClick={() => onEdit(feature)}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(feature.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

function FeatureSkeleton() {
    return (
        <div className="p-4 border rounded-lg bg-card animate-pulse space-y-4">
            <div className="flex items-center gap-4">
                <div className="h-5 w-5 bg-muted rounded" />
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                </div>
            </div>
            <div className="h-3 bg-muted rounded w-5/6" />
        </div>
    )
}

export default function FeaturesPage() {
    const [features, setFeatures] = useState<Feature[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null)
    const {
        control,
        register,
        handleSubmit: submitForm,
        reset,
        watch,
        setValue,
        clearErrors,
        formState: { errors },
    } = useForm<FeatureFormValues>({
        defaultValues: {
            icon: '',
            title: '',
            description: '',
            active: true,
        },
    })
    const iconValue = watch('icon')
    const descriptionValue = watch('description')

    useEffect(() => {
        register('icon', {
            required: 'Icon hoặc ảnh là bắt buộc',
        })
    }, [register])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        fetchFeatures()
    }, [])

    const fetchFeatures = async () => {
        try {
            const res = await fetch('/api/admin/features')
            if (res.ok) {
                const data = await res.json()
                setFeatures(data)
            }
        } catch (error) {
            toast.error('Không thể tải dữ liệu')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = features.findIndex((f) => f.id === active.id)
            const newIndex = features.findIndex((f) => f.id === over.id)

            const newFeatures = arrayMove(features, oldIndex, newIndex)
            setFeatures(newFeatures)

            try {
                const res = await fetch('/api/admin/features', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ features: newFeatures }),
                })

                if (!res.ok) {
                    toast.error('Không thể sắp xếp')
                    fetchFeatures()
                }
            } catch (error) {
                toast.error('Không thể sắp xếp')
                fetchFeatures()
            }
        }
    }

    const onSubmit = async (values: FeatureFormValues) => {
        if (!values.icon) {
            toast.error('Vui lòng tải ảnh icon')
            return
        }
        setIsSaving(true)
        try {
            if (editingFeature) {
                const res = await fetch(`/api/admin/features/${editingFeature.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                })

                if (res.ok) {
                    toast.success('Cập nhật thành công')
                    fetchFeatures()
                    setIsDialogOpen(false)
                    resetForm()
                } else {
                    const data = await res.json()
                    toast.error(data.error || 'Cập nhật thất bại')
                }
            } else {
                const res = await fetch('/api/admin/features', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                })

                if (res.ok) {
                    toast.success('Tạo mới thành công')
                    fetchFeatures()
                    setIsDialogOpen(false)
                    resetForm()
                } else {
                    const data = await res.json()
                    toast.error(data.error || 'Tạo mới thất bại')
                }
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra')
        } finally {
            setIsSaving(false)
        }
    }

    const handleEdit = (feature: Feature) => {
        setEditingFeature(feature)
        reset({
            icon: feature.icon || '',
            title: feature.title || '',
            description: feature.description || '',
            active: feature.active ?? true,
        })
        setIsDialogOpen(true)
    }

    const confirmDelete = (id: string) => {
        setDeleteId(id)
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            const res = await fetch(`/api/admin/features/${deleteId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                toast.success('Đã xóa thành công')
                fetchFeatures()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Xóa thất bại')
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra')
        } finally {
            setDeleteId(null)
        }
    }

    const resetForm = () => {
        setEditingFeature(null)
        reset({
            icon: '',
            title: '',
            description: '',
            active: true,
        })
    }

    const handleIconChange = (value: string) => {
        setValue('icon', value, { shouldDirty: true, shouldValidate: true })
        if (value) {
            toast.success('Đã tải icon thành công')
            clearErrors('icon')
        } else {
            toast.info('Đã xóa icon')
        }
    }

    const renderFeatureSection = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <FeatureSkeleton key={`feature-skeleton-${index}`} />
                    ))}
                </div>
            )
        }

        if (!features.length) {
            return (
                <div className="border rounded-lg bg-card p-10 text-center text-muted-foreground">
                    Chưa có tính năng nào. Nhấn "Thêm mới" để bắt đầu.
                </div>
            )
        }

        return (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={features.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {features.map((feature) => (
                            <SortableItem
                                key={feature.id}
                                feature={feature}
                                onEdit={handleEdit}
                                onDelete={confirmDelete}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        )
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý Tính năng</h1>
                <Button
                    onClick={() => {
                        resetForm()
                        setIsDialogOpen(true)
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm mới
                </Button>
            </div>

            {renderFeatureSection()}

            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) resetForm()
                }}
            >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {editingFeature ? 'Sửa tính năng' : 'Thêm tính năng mới'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitForm(onSubmit)}>
                        <div className="space-y-6">
                            {/* Icon/Image Upload */}
                            <div className="space-y-2">
                                <Label>
                                    Icon / Ảnh <span className="text-destructive">*</span>
                                </Label>
                                <ImageUpload
                                    value={iconValue}
                                    onChange={handleIconChange}
                                    label="Ảnh icon"
                                    folder="features"
                                    enableLibrary
                                />
                                {errors.icon && (
                                    <p className="text-sm text-destructive">{errors.icon.message}</p>
                                )}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="title">
                                        Tiêu đề <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="Ví dụ: Tư vấn 24/7"
                                        className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
                                        {...register('title', {
                                            required: 'Tiêu đề là bắt buộc',
                                            minLength: {
                                                value: 3,
                                                message: 'Tiêu đề phải có ít nhất 3 ký tự',
                                            },
                                        })}
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-destructive">{errors.title.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label className="inline-flex items-center gap-2" htmlFor="active">
                                        Hiển thị công khai
                                    </Label>
                                    <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg h-full">
                                        <Controller
                                            name="active"
                                            control={control}
                                            render={({ field: { value, onChange } }) => (
                                                <Checkbox
                                                    id="active"
                                                    checked={value}
                                                    onCheckedChange={(checked) => onChange(checked === true)}
                                                />
                                            )}
                                        />
                                        <div>
                                            <p className="font-medium text-sm">Đang hiển thị trên trang chủ</p>
                                            <p className="text-xs text-muted-foreground">
                                                Tắt để ẩn tính năng này với khách hàng
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Mô tả <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    placeholder="Mô tả chi tiết về tính năng này..."
                                    className={errors.description ? 'border-destructive focus-visible:ring-destructive' : ''}
                                    {...register('description', {
                                        required: 'Mô tả là bắt buộc',
                                        minLength: {
                                            value: 10,
                                            message: 'Mô tả phải có ít nhất 10 ký tự',
                                        },
                                    })}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{descriptionValue?.length || 0} ký tự</span>
                                    {errors.description && (
                                        <span className="text-destructive">{errors.description.message}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-6 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={isSaving}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        Đang lưu...
                                    </>
                                ) : (
                                    editingFeature ? 'Cập nhật' : 'Tạo mới'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa tính năng này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
