import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`
  else delete api.defaults.headers.common.Authorization
}

setAuthToken(localStorage.getItem('campusfix_token') || sessionStorage.getItem('campusfix_token'))

export default api