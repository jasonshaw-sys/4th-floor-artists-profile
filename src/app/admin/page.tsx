'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Profile = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  membership_type: string
  membership_status: string
  business_name: string
  bio: string
  studio_location: string
  primary_mediums: string
  website: string
  instagram: string
  facebook_page: string
  social_sharing_permission: boolean
  created_at: string
}

export default function Admin() {
  const supabase = createClient()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) { router.push('/profile'); return }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) setError(error.message)
      else setProfiles(data || [])
      setLoading(false)
    }
    checkAdminAndLoad()
  }, [])

  const handleStatusChange = async (id: string, status: string) => {
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('profiles')
      .update({ membership_status: status })
      .eq('id', id)

    if (error) setError(error.message)
    else {
      setProfiles(profiles.map(p => p.id === id ? { ...p, membership_status: status } : p))
      if (selected?.id === id) setSelected({ ...selected, membership_status: status })
      setMessage('Status updated!')
    }
    setSaving(false)
  }

  const statusColor = (status: string) => {
    if (status === 'active') return 'bg-green-100 text-green-700'
    if (status === 'expired') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <p className="text-sm text-gray-500">{profiles.length} total members</p>
            </div>
            <div className="divide-y overflow-y-auto max-h-[70vh]">
              {profiles.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${selected?.id === p.id ? 'bg-gray-100' : ''}`}
                >
                  <p className="font-medium text-sm">
                    {p.first_name || p.last_name ? `${p.first_name} ${p.last_name}` : 'Unnamed Member'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{p.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(p.membership_status)}`}>
                    {p.membership_status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Member Detail */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
            {!selected ? (
              <p className="text-gray-400 text-sm">Select a member to view details</p>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selected.first_name} {selected.last_name}
                    </h2>
                    <p className="text-sm text-gray-500">{selected.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(selected.id, 'active')}
                      disabled={saving}
                      className="text-xs bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 disabled:opacity-50"
                    >
                      Set Active
                    </button>
                    <button
                      onClick={() => handleStatusChange(selected.id, 'pending')}
                      disabled={saving}
                      className="text-xs bg-yellow-500 text-white px-3 py-1 rounded-full hover:bg-yellow-600 disabled:opacity-50"
                    >
                      Set Pending
                    </button>
                    <button
                      onClick={() => handleStatusChange(selected.id, 'expired')}
                      disabled={saving}
                      className="text-xs bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 disabled:opacity-50"
                    >
                      Set Expired
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-500">Membership Type</p><p className="font-medium capitalize">{selected.membership_type || '—'}</p></div>
                  <div><p className="text-gray-500">Status</p><span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(selected.membership_status)}`}>{selected.membership_status || 'pending'}</span></div>
                  <div><p className="text-gray-500">Phone</p><p className="font-medium">{selected.phone || '—'}</p></div>
                  <div><p className="text-gray-500">Business Name</p><p className="font-medium">{selected.business_name || '—'}</p></div>
                  <div><p className="text-gray-500">Studio Location</p><p className="font-medium">{selected.studio_location || '—'}</p></div>
                  <div><p className="text-gray-500">Primary Mediums</p><p className="font-medium">{selected.primary_mediums || '—'}</p></div>
                  <div><p className="text-gray-500">Website</p><p className="font-medium truncate">{selected.website || '—'}</p></div>
                  <div><p className="text-gray-500">Instagram</p><p className="font-medium">{selected.instagram || '—'}</p></div>
                  <div><p className="text-gray-500">Facebook</p><p className="font-medium truncate">{selected.facebook_page || '—'}</p></div>
                  <div><p className="text-gray-500">Social Sharing</p><p className="font-medium">{selected.social_sharing_permission ? 'Yes' : 'No'}</p></div>
                  <div><p className="text-gray-500">Member Since</p><p className="font-medium">{new Date(selected.created_at).toLocaleDateString()}</p></div>
                </div>

                {selected.bio && (
                  <div>
                    <p className="text-gray-500 text-sm">Bio / Artist Statement</p>
                    <p className="text-sm mt-1">{selected.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}