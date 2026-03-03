import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { tokenStorage } from '../utils/tokenStorage'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const { addToast } = useToast()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userRaw = params.get('user')

    if (!token) {
      addToast('Authentication failed. Please try again.', 'error')
      navigate('/login', { replace: true })
      return
    }

    try {
      tokenStorage.setToken(token)
      if (userRaw) {
        const user = JSON.parse(decodeURIComponent(userRaw))
        tokenStorage.setUser(user)
        updateUser(user)
      }
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('AuthCallback error:', err)
      addToast('Authentication failed. Please try again.', 'error')
      navigate('/login', { replace: true })
    }
  }, [navigate, updateUser, addToast])

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-txt-secondary text-sm">Completing sign-in…</p>
      </div>
    </div>
  )
}
