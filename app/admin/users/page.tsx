"use client"

import { useEffect, useState } from "react"
import { UserListTable } from "./common/user-list-table"
import { UserListHeader } from "./common/user-list-header"
import { Button } from "@/components/ui/button"
import { CreateAdminModal, NewAdminFormState } from "./common/create-admin-modal"
import { User } from "@/lib/db"
import { useToast } from "@/components/ui/toast"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        setUsers(await response.json())
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setUsers((prev) => prev.filter((user) => user.id !== userId))
        showToast("success", "Đã xóa người dùng thành công")
      } else {
        const { error } = await response.json()
        throw new Error(error || "Không thể xóa người dùng")
      }
    } catch (error: any) {
      console.error("Error deleting user:", error)
      showToast("error", error.message || "Không thể xóa người dùng")
    }
  }

  const handleCreateAdmin = async (formData: NewAdminFormState) => {
    setIsCreatingAdmin(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "admin" }),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error || "Không thể tạo admin")
      }

      const createdUser = await response.json()
      setUsers((prev) => [createdUser, ...prev])
      showToast("success", "Đã tạo quản trị viên mới thành công")
      setIsCreateOpen(false)
    } catch (error: any) {
      showToast("error", error.message || "Không thể tạo quản trị viên")
    } finally {
      setIsCreatingAdmin(false)
    }
  }

  const handleUpdateUser = async (userId: string, data: { name?: string; role?: string }) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error || "Không thể cập nhật người dùng")
      }

      const updatedUser = await response.json()
      setUsers((prev) => prev.map((user) => (user.id === userId ? updatedUser : user)))
      showToast("success", "Đã cập nhật thông tin người dùng thành công")
    } catch (error: any) {
      showToast("error", error.message || "Không thể cập nhật người dùng")
      throw error
    }
  }

  return (
    <main className="container py-8 px-4 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <UserListHeader onSearch={setSearchTerm} totalUsers={filteredUsers.length} />
        <Button className="w-full md:w-auto" onClick={() => setIsCreateOpen(true)}>
          Thêm quản trị viên
        </Button>
      </div>
      <UserListTable
        loading={loading}
        users={filteredUsers}
        onDeleteUser={handleDeleteUser}
        onUpdateUser={handleUpdateUser}
      />
      <CreateAdminModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreateAdmin}
        loading={isCreatingAdmin}
      />
    </main>
  )
}
