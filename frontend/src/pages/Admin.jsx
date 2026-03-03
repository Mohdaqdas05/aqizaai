import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, MessageSquare, BarChart2, Activity,
  Search, ChevronLeft, ChevronRight, ArrowLeft,
  Shield, ToggleLeft, ToggleRight,
} from 'lucide-react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface-card border border-border">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-txt-primary">{value ?? '—'}</p>
        <p className="text-sm text-txt-secondary">{label}</p>
      </div>
    </div>
  )
}

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()
  const PER_PAGE = 10

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data?.stats || res.data)
    } catch {
      // stats might not be available
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users', {
        params: { page, limit: PER_PAGE, search: search || undefined },
      })
      setUsers(res.data?.users || [])
      setTotal(res.data?.total || 0)
    } catch (err) {
      addToast('Failed to load users.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, addToast])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300)
    return () => clearTimeout(t)
  }, [fetchUsers])

  const toggleActive = async (userId, current) => {
    try {
      await api.patch(`/admin/users/${userId}`, { isActive: !current })
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !current } : u)),
      )
      addToast(`User ${!current ? 'activated' : 'deactivated'}.`, 'success')
    } catch {
      addToast('Failed to update user.', 'error')
    }
  }

  const changeRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}`, { role: newRole })
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
      )
      addToast('Role updated.', 'success')
    } catch {
      addToast('Failed to update role.', 'error')
    }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="min-h-screen bg-surface text-txt-primary">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center gap-4 bg-surface-sidebar">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-txt-secondary hover:text-txt-primary transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-400" />
          <h1 className="font-semibold text-txt-primary">Admin Panel</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}        label="Total Users"    value={stats?.totalUsers}    color="bg-brand-500" />
          <StatCard icon={MessageSquare} label="Total Chats"   value={stats?.totalChats}    color="bg-purple-600" />
          <StatCard icon={BarChart2}    label="Total Messages" value={stats?.totalMessages} color="bg-blue-600" />
          <StatCard icon={Activity}     label="Active Today"   value={stats?.activeToday}   color="bg-green-600" />
        </div>

        {/* Users table */}
        <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-txt-primary">Users</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search users…"
                className="pl-9 pr-4 py-2 rounded-lg bg-surface-input border border-border text-sm text-txt-primary placeholder-txt-muted outline-none focus:border-brand-500 transition-colors w-56"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-txt-muted uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-txt-muted uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-txt-muted uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-txt-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-txt-muted uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-txt-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-txt-muted">
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-txt-muted">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-500/80 flex items-center justify-center text-xs font-bold text-white">
                            {user.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-txt-primary">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-txt-secondary">{user.email}</td>
                      <td className="px-6 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => changeRole(user._id, e.target.value)}
                          className="bg-surface-input border border-border rounded-lg px-2 py-1 text-xs text-txt-secondary outline-none focus:border-brand-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-txt-muted text-xs">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => toggleActive(user._id, user.isActive)}
                          className="text-txt-muted hover:text-brand-400 transition-colors"
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? (
                            <ToggleRight className="w-5 h-5 text-green-400" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-xs text-txt-muted">
                Page {page} of {totalPages} ({total} users)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-border text-txt-secondary hover:text-txt-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-border text-txt-secondary hover:text-txt-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
