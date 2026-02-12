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
import type { Reason } from '@/lib/db'
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
import type { SiteInfo } from '@/lib/site-info'

type ReasonFormValues = {
    icon: string
    title: string
    description: string
    active: boolean
}

function SortableItem({ reason, onEdit, onDelete }: {
    reason: Reason
    onEdit: (reason: Reason) => void
    onDelete: (id: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: reason.id })

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
                    <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-xl px-4 py-2 min-w-[64px] max-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis">
                        {reason.icon}
                    </div>
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-base">{reason.title}</h3>
                            {!reason.active && (
                                <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">Ẩn</span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">{reason.description}</p>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 justify-end sm:justify-start">
                <Button variant="outline" size="sm" onClick={() => onEdit(reason)}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(reason.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

function ReasonSkeleton() {
    return (
        <div className="p-4 border rounded-lg bg-card animate-pulse space-y-4">
            <div className="flex items-center gap-4">
                <div className="h-5 w-5 bg-muted rounded" />
                <div className="h-12 w-12 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                </div>
            </div>
            <div className="h-3 bg-muted rounded w-5/6" />
        </div>
    )
}

export default function ReasonsPage() {
    const [reasons, setReasons] = useState<Reason[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editingReason, setEditingReason] = useState<Reason | null>(null)
    const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null)
    const [isSectionSaving, setIsSectionSaving] = useState(false)
    const {
        control,
        register,
        handleSubmit: submitForm,
        reset,
        watch,
        formState: { errors },
    } = useForm<ReasonFormValues>({
        defaultValues: {
            icon: '',
            title: '',
            description: '',
            active: true,
        },
    })
    const descriptionValue = watch('description')
    const iconValue = watch('icon')

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        fetchReasons()
        fetchSectionInfo()
    }, [])

    const fetchReasons = async () => {
        try {
            const res = await fetch('/api/admin/reasons')
            if (res.ok) {
                const data = await res.json()
                setReasons(data)
            } else {
                toast.error('Không thể tải dữ liệu')
            }
        } catch (error) {
            toast.error('Không thể tải dữ liệu')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchSectionInfo = async () => {
        try {
            const res = await fetch('/api/admin/site-info')
            if (res.ok) {
                const data = await res.json()
                setSiteInfo(data)
            }
        } catch (error) {
            toast.error('Không thể tải nội dung section')
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = reasons.findIndex((r) => r.id === active.id)
            const newIndex = reasons.findIndex((r) => r.id === over.id)

            const newReasons = arrayMove(reasons, oldIndex, newIndex)
            setReasons(newReasons)

            try {
                const res = await fetch('/api/admin/reasons', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reasons: newReasons }),
                })

                if (!res.ok) {
                    toast.error('Không thể sắp xếp')
                    fetchReasons()
                } else {
                    toast.success('Đã sắp xếp lại')
                }
            } catch (error) {
                toast.error('Không thể sắp xếp')
                fetchReasons()
            }
        }
    }

    const onSubmit = async (values: ReasonFormValues) => {
        if (!values.icon) {
            toast.error('Vui lòng nhập số liệu hoặc icon')
            return
        }
        setIsSaving(true)
        try {
            if (editingReason) {
                const res = await fetch(`/api/admin/reasons/${editingReason.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                })

                if (res.ok) {
                    toast.success('Cập nhật thành công')
                    fetchReasons()
                    setIsDialogOpen(false)
                    resetForm()
                } else {
                    const data = await res.json()
                    toast.error(data.error || 'Cập nhật thất bại')
                }
            } else {
                const res = await fetch('/api/admin/reasons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                })

                if (res.ok) {
                    toast.success('Tạo mới thành công')
                    fetchReasons()
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

    const handleEdit = (reason: Reason) => {
        setEditingReason(reason)
        reset({
            icon: reason.icon || '',
            title: reason.title || '',
            description: reason.description || '',
            active: reason.active ?? true,
        })
        setIsDialogOpen(true)
    }

    const confirmDelete = (id: string) => {
        setDeleteId(id)
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            const res = await fetch(`/api/admin/reasons/${deleteId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                toast.success('Đã xóa thành công')
                fetchReasons()
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
        setEditingReason(null)
        reset({
            icon: '',
            title: '',
            description: '',
            active: true,
        })
    }

    const handleSectionInfoChange = (field: 'reasonsTitle' | 'reasonsDescription') => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSiteInfo((prev) => (prev ? { ...prev, [field]: e.target.value } : prev))
    }

    const handleSectionInfoSave = async () => {
        if (!siteInfo) return
        setIsSectionSaving(true)
        try {
            const res = await fetch('/api/admin/site-info', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(siteInfo),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'Không thể lưu nội dung section')
            }

            toast.success('Đã lưu nội dung section')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Không thể lưu nội dung section')
        } finally {
            setIsSectionSaving(false)
        }
    }

    const renderReasonSection = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <ReasonSkeleton key={`reason-skeleton-${index}`} />
                    ))}
                </div>
            )
        }

        if (!reasons.length) {
            return (
                <div className="border rounded-lg bg-card p-10 text-center text-muted-foreground">
                    Chưa có lý do nào. Nhấn "Thêm mới" để bắt đầu.
                </div>
            )
        }

        return (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={reasons.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {reasons.map((reason) => (
                            <SortableItem key={reason.id} reason={reason} onEdit={handleEdit} onDelete={confirmDelete} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        )
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý Lý do chọn</h1>
                    <p className="text-sm text-muted-foreground mt-1">Hiển thị số liệu và thống kê ấn tượng</p>
                </div>
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

            <div className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase">Nội dung section số liệu</p>
                        <p className="text-sm text-muted-foreground">Tiêu đề và mô tả xuất hiện trên trang chủ.</p>
                    </div>
                    <Button type="button" onClick={handleSectionInfoSave} disabled={!siteInfo || isSectionSaving}>
                        {isSectionSaving ? 'Đang lưu...' : 'Lưu nội dung'}
                    </Button>
                </div>
                <div className="grid gap-4">
                    <div className="space-y-1">
                        <Label>Tiêu đề</Label>
                        <Input
                            value={siteInfo?.reasonsTitle ?? ''}
                            onChange={handleSectionInfoChange('reasonsTitle')}
                            placeholder="Số liệu ấn tượng"
                            disabled={!siteInfo}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Mô tả</Label>
                        <Textarea
                            value={siteInfo?.reasonsDescription ?? ''}
                            onChange={handleSectionInfoChange('reasonsDescription')}
                            placeholder="Những con số chứng minh..."
                            rows={3}
                            disabled={!siteInfo}
                        />
                    </div>
                </div>
            </div>

            {renderReasonSection()}

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {editingReason ? 'Sửa lý do chọn' : 'Thêm lý do chọn mới'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitForm(onSubmit)}>
                        <div className="space-y-6">
                            {/* Icon/Number */}
                            <div className="space-y-2">
                                <Label htmlFor="icon">Số liệu hoặc Icon <span className="text-destructive">*</span></Label>
                                <Input
                                    id="icon"
                                    placeholder="Ví dụ: 15K+ hoặc 98%"
                                    className={`text-2xl font-bold ${errors.icon ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    {...register('icon', {
                                        required: 'Số liệu hoặc icon là bắt buộc',
                                        minLength: {
                                            value: 1,
                                            message: 'Số liệu hoặc icon là bắt buộc',
                                        },
                                    })}
                                />
                                {errors.icon && (
                                    <p className="text-sm text-destructive">{errors.icon.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Nhập số liệu thống kê (VD: 15K+, 95%, 300+) hoặc emoji
                                </p>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Tiêu đề <span className="text-destructive">*</span></Label>
                                <Input
                                    id="title"
                                    placeholder="Ví dụ: Bệnh nhân đã tư vấn"
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

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả <span className="text-destructive">*</span></Label>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    placeholder="Mô tả chi tiết về số liệu này..."
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

                            {/* Active Status */}
                            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
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
                                <Label htmlFor="active" className="cursor-pointer">
                                    Hiển thị công khai trên trang chủ
                                </Label>
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
                                    editingReason ? 'Cập nhật' : 'Tạo mới'
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
                            Bạn có chắc chắn muốn xóa lý do này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
