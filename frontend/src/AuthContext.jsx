import { createContext, useEffect, useState } from 'react'
import api, { setAuthToken } from './api.js'

const AuthContext = createContext(null)

function replacePath(path) {
  window.history.replaceState(null, '', path)
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('campusfix_user') || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('campusfix_token') || sessionStorage.getItem('campusfix_token'))
  const [user, setUser] = useState(readStoredUser)
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem('campusfix_token')))

  useEffect(() => {
    if (!token) {
      setAuthToken(null)
      if (window.location.pathname === '/staff') {
        replacePath('/login')
      }
      return
    }

    setAuthToken(token)
    api.get('/user')
      .then(({ data }) => {
        setUser(data)
        localStorage.setItem('campusfix_user', JSON.stringify(data))
        if (['/', '/login', '/register', '/staff'].includes(window.location.pathname)) {
          replacePath('/dashboard')
        }
      })
      .catch(() => {
        localStorage.removeItem('campusfix_token')
        localStorage.removeItem('campusfix_user')
        setToken(null)
        setUser(null)
        setAuthToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  async function authenticate(endpoint, credentials) {
    const { data } = await api.post(endpoint, credentials)
    const persistent = endpoint !== '/login' || credentials.remember
    const tokenStorage = persistent ? localStorage : sessionStorage
    localStorage.removeItem('campusfix_token')
    sessionStorage.removeItem('campusfix_token')
    tokenStorage.setItem('campusfix_token', data.token)
    localStorage.setItem('campusfix_user', JSON.stringify(data.user))
    setAuthToken(data.token)
    replacePath('/dashboard')
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function login(credentials) {
    return authenticate('/login', credentials)
  }

  async function register(details) {
    const { data } = await api.post('/register', details)
    return data
  }

  async function updateProfile(details) {
    const isFormData = typeof FormData !== 'undefined' && details instanceof FormData
    let data
    if (isFormData) {
      details.append('_method', 'PATCH')
      ;({ data } = await api.post('/user', details))
    } else {
      ;({ data } = await api.patch('/user', details))
    }
    setUser(data)
    localStorage.setItem('campusfix_user', JSON.stringify(data))
    return data
  }

  async function logout() {
    try {
      await api.post('/logout')
    } finally {
      localStorage.removeItem('campusfix_token')
      sessionStorage.removeItem('campusfix_token')
      localStorage.removeItem('campusfix_user')
      setAuthToken(null)
      replacePath('/login')
      setToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }