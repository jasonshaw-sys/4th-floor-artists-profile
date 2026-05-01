'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Reset() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setMessage('')
    setError('')
    if (!email.trim()) { setError('Please enter your email.'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: \`\${window.location.origin}/update-password`
    })
    if (error) setError(error.message)
    else setMessage('Check your email for a password reset link!')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Enter your email and we will send you a reset link.
        </p>
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          <a href="/" className="text-black font-medium underline">Back to Sign In</a>
        </p>
      </div>
    </main>
  )
}
