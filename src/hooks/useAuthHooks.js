import { useMutation } from '@tanstack/react-query'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export const useLogin = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      login(data)
      navigate('/')
    }
  })
}

export const useGuestLogin = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authAPI.guestLogin,
    onSuccess: (data) => {
      login(data)
      navigate('/')
    }
  })
}

export const useSignup = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authAPI.signup,
    onSuccess: (data) => {
      login(data)
      navigate('/')
    }
  })
}

export const useLogout = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      logout()
      navigate('/login')
    }
  })
} 