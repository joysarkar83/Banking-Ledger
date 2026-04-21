import { apiRequest } from './client'

export const bankingApi = {
  register: (payload) => apiRequest('/api/auth/register', { method: 'POST', body: payload }),
  registerVerifyOtp: (payload) => apiRequest('/api/auth/register-verify-otp', { method: 'POST', body: payload }),
  login: (payload) => apiRequest('/api/auth/login', { method: 'POST', body: payload }),
  loginVerifyOtp: (payload) => apiRequest('/api/auth/login-verify-otp', { method: 'POST', body: payload }),
  forgotPassword: (payload) => apiRequest('/api/auth/forgot-password', { method: 'POST', body: payload }),
  resetPassword: (payload) => apiRequest('/api/auth/reset-password', { method: 'POST', body: payload }),
  me: () => apiRequest('/api/auth/me', { method: 'GET' }),
  editProfile: (payload) => apiRequest('/api/auth/edit-profile', { method: 'PUT', body: payload }),
  logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),

  createAccount: (payload) => apiRequest('/api/account/create', { method: 'POST', body: payload }),
  getAllAccounts: () => apiRequest('/api/account/allAccounts', { method: 'GET' }),
  forgotPin: (payload) => apiRequest('/api/account/forgot-pin', { method: 'POST', body: payload }),
  resetPin: (payload) => apiRequest('/api/account/reset-pin', { method: 'POST', body: payload }),

  getBalance: (payload) => apiRequest('/api/transaction/get-balance', { method: 'POST', body: payload }),
  transfer: (payload) => apiRequest('/api/transaction/transfer', { method: 'POST', body: payload }),
  deposit: (payload) => apiRequest('/api/transaction/deposit', { method: 'POST', body: payload }),
  getTransactionHistory: (payload) => apiRequest('/api/transaction/transaction-history', { method: 'POST', body: payload }),
}
