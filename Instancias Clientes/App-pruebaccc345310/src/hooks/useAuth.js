import useAuthStore from '../store/authStore'

export function useAuth() {
  const { user, role, isLoading } = useAuthStore()
  return {
    user,
    role,
    isLoading,
    isAdmin: role === 'admin',
    isClient: role === 'client',
    isAuthenticated: !!user,
  }
}
