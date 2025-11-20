"use client"

import { useMemo, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Trash2, MoreHorizontal, Edit, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/lib/db"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewUserModal } from "./view-user-modal"
import { EditUserModal } from "./edit-user-modal"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface UserListTableProps {
  users: User[]
  onDeleteUser: (userId: string) => Promise<void> | void
  onUpdateUser: (userId: string, data: { name?: string; role?: string }) => Promise<void>
  loading: boolean
}

export function UserListTable({ users, onDeleteUser, onUpdateUser, loading }: UserListTableProps) {
  const [confirmingUserId, setConfirmingUserId] = useState<string | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [viewingUserId, setViewingUserId] = useState<string | null>(null)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const handleDelete = async (userId: string) => {
    setDeletingUserId(userId)
    try {
      await onDeleteUser(userId)
    } finally {
      setDeletingUserId(null)
      setConfirmingUserId(null)
    }
  }

  const handleUpdate = async (userId: string, data: { name?: string; role?: string }) => {
    setUpdatingUserId(userId)
    try {
      await onUpdateUser(userId, data)
      setEditingUserId(null)
    } finally {
      setUpdatingUserId(null)
    }
  }

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Tên
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => {
          return <div className="font-medium">{row.original.name || "Không có tên"}</div>
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Email
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => {
          return <div className="text-sm">{row.original.email}</div>
        },
      },
      {
        accessorKey: "role",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Vai trò
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => {
          const role = row.original.role
          return (
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                role === "admin" || role === "superadmin"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              )}
            >
              {role === "admin" ? "Quản trị viên" : role === "superadmin" ? "Superadmin" : "Người dùng"}
            </span>
          )
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Tham gia
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => {
          return (
            <div className="text-sm text-muted-foreground">
              {format(new Date(row.original.createdAt), "dd MMM yyyy", { locale: vi })}
            </div>
          )
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault()
                      setViewingUserId(user.id)
                    }}
                    className="cursor-pointer"
                  >
                    <Eye className="h-4 w-4 mr-2 text-blue-600" />
                    Xem
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault()
                      setEditingUserId(user.id)
                    }}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2 text-blue-600" />
                    Sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault()
                      setConfirmingUserId(user.id)
                    }}
                    className="text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const viewingUser = viewingUserId ? users.find((u) => u.id === viewingUserId) : null
  const editingUser = editingUserId ? users.find((u) => u.id === editingUserId) : null

  if (users.length === 0 && !loading) {
    return (
      <div className="border border-dashed rounded-lg p-12 text-center">
        <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
      </div>
    )
  }

  return (
    <>
      <ConfirmDialog
        open={confirmingUserId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmingUserId(null)
          }
        }}
        title="Xóa người dùng?"
        description={
          confirmingUserId
            ? `Bạn có chắc chắn muốn xóa ${users.find((u) => u.id === confirmingUserId)?.email}? Hành động này không thể hoàn tác.`
            : ""
        }
        confirmText="Xóa"
        destructive
        loading={deletingUserId !== null}
        onConfirm={() => {
          if (confirmingUserId) {
            handleDelete(confirmingUserId)
          }
        }}
      />
      <ViewUserModal
        open={viewingUserId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setViewingUserId(null)
          }
        }}
        user={viewingUser || null}
      />
      <EditUserModal
        open={editingUserId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUserId(null)
          }
        }}
        user={editingUser || null}
        onUpdate={handleUpdate}
        loading={updatingUserId !== null}
      />
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={columns.length}>
                    <div className="flex items-center gap-4 py-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Không có kết quả.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Hiển thị {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} đến{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            trong tổng số {table.getFilteredRowModel().rows.length} người dùng
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
