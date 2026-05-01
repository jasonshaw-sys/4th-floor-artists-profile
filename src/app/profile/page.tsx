'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    membership_type: '',
    membership_status: 'pending',
    business_name: '',
    bio: '',
    studio_location: '',
    primary_mediums: '',
    website: '',
    instagram: '',
    facebook_page: '',
    social_sharing_permission: false,
  })

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }
    getProfile()
  }, [])

  useEffect(() => {
    if (error) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [error])

  const handleSave = async () => {
    setMessage('')
    setError('')

    if (!profile.first_name.trim()) { setError('First name is required.'); return }
    if (!profile.last_name.trim()) { setError('Last name is required.'); return }
    if (!profile.phone.trim()) { setError('Phone number is required.'); return }
    if (!profile.membership_type) { setError('Please select a membership type.'); return }

    const digits = profile.phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a complete 10-digit phone number.')
      return
    }

    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() })

    if (error) setError(error.message)
    else setMessage('Profile saved successfully!')
    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  const membershipBanner = () => {
    if (profile.membership_status === 'active') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-green-700 font-medium text-sm">✓ Active Member</p>
            <p className="text-green-600 text-xs mt-0.5">Your membership is active</p>
          </div>
        </div>
      )
    }
    if (profile.membership_status === 'expired') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-red-700 font-medium text-sm">✗ Membership Expired</p>
            <p className="text-red-600 text-xs mt-0.5">Renew your membership to stay active</p>
          </div>
          
            <a href="https://www.4thfloorartists.com/shop/4th-floor-artists-membership"
            target="_blank" className="bg-red-600 text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-red-700">Renew Now</a>
        </div>
      )
    }
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-yellow-700 font-medium text-sm">⚠ No Active Membership</p>
          <p className="text-yellow-600 text-xs mt-0.5">Purchase a membership to become an active member</p>
        </div>
        
          <a href="https://www.4thfloorartists.com/shop/4th-floor-artists-membership"
          target="_blank"
          className="bg-black text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-gray-800">
          Buy Membership
        </a>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Artist Information</h1>
          <button onClick={handleSignOut} className="text-sm text-gray-500 underline">Sign Out</button>
        </div>

        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {membershipBanner()}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">First Name *</label>
              <input
                type="text"
                value={profile.first_name}
                onChange={e => setProfile({...profile, first_name: e.target.value})}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Last Name *</label>
              <input
                type="text"
                value={profile.last_name}
                onChange={e => setProfile({...profile, last_name: e.target.value})}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Phone Number *</label>
            <input
              type="text"
              placeholder="(000) 000-0000"
              value={profile.phone}
              onChange={e => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                let formatted = ''
                if (digits.length <= 3) formatted = digits.length ? `(${digits}` : ''
                else if (digits.length <= 6) formatted = `(${digits.slice(0,3)}) ${digits.slice(3)}`
                else formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
                setProfile({...profile, phone: formatted})
              }}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Membership Type *</label>
            <select
              value={profile.membership_type}
              onChange={e => setProfile({...profile, membership_type: e.target.value})}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select one...</option>
              <option value="artist">Artist</option>
              <option value="collector">Collector</option>
              <option value="gallery">Gallery</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Business Name (if applicable)</label>
            <input
              type="text"
              value={profile.business_name}
              onChange={e => setProfile({...profile, business_name: e.target.value})}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Artist Statement or Bio</label>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={e => setProfile({...profile, bio: e.target.value})}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Studio Location</label>
            <input
              type="text"
              value={profile.studio_location}
              onChange={e => setProfile({...profile, studio_location: e.target.value})}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Primary Mediums</label>
            <input
              type="text"
              placeholder="e.g. Woodworking, Painting, Jewelry, 3D"
              value={profile.primary_mediums}
              onChange={e => setProfile({...profile, primary_mediums: e.target.value})}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Website / Online Portfolio</label>
            <input
              type="text"
              placeholder="https://yourwebsite.com"
              value={profile.website}
              onChange={e => setProfile({...profile, website: e.target.value})}
              onBlur={e => {
                const val = e.target.value.trim()
                if (val && !val.startsWith('http')) {
                  setProfile({...profile, website: `https://${val}`})
                }
              }}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Instagram</label>
            <input
              type="text"
              placeholder="@handle"
              value={profile.instagram}
              onChange={e => setProfile({...profile, instagram: e.target.value})}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Facebook Page</label>
            <input
              type="text"
              placeholder="https://facebook.com/yourpage"
              value={profile.facebook_page}
              onChange={e => setProfile({...profile, facebook_page: e.target.value})}
              onBlur={e => {
                const val = e.target.value.trim()
                if (val && !val.startsWith('http')) {
                  setProfile({...profile, facebook_page: `https://${val}`})
                }
              }}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="sharing"
              checked={profile.social_sharing_permission}
              onChange={e => setProfile({...profile, social_sharing_permission: e.target.checked})}
              className="mt-1"
            />
            <label htmlFor="sharing" className="text-sm text-gray-700">
              I give 4th Floor Artists permission to share my art and events on their Instagram and Facebook accounts. All work will be credited to me and they claim no ownership of any images.
            </label>
          </div>

          <p className="text-xs text-gray-400">* Required fields</p>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 mt-4"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </main>
  )
}