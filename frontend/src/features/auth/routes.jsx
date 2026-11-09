import { Route } from 'react-router-dom'
import LoginPage from './login/LoginPage'
import RegisterPage from './register/RegisterPage'
import VerifyOtpPage from './register/VerifyOtpPage'
import ApprovalPendingPage from './register/ApprovalPendingPage'
import ForgotPasswordPage from './forgot-password/ForgotPasswordPage'
import ResetPasswordPage from './forgot-password/ResetPasswordPage'
import MfaSetupPage from './mfa/MfaSetupPage'
import MfaVerifyPage from './mfa/MfaVerifyPage'

export const AUTH_PATHS = [
  '/',
  '/register',
  '/verify-otp',
  '/approval-pending',
  '/forgot-password',
  '/reset-password',
  '/mfa-verify',
  '/mfa-setup',
]

export const authRoutes = (
  <>
    <Route path="/" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/verify-otp" element={<VerifyOtpPage />} />
    <Route path="/approval-pending" element={<ApprovalPendingPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/mfa-verify" element={<MfaVerifyPage />} />
    <Route path="/mfa-setup" element={<MfaSetupPage />} />
  </>
)
