import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'

export default function RoleSelector() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { API_BASE_URL } = useContext(AppContext)

  async function chooseRole(role) {
    try {
      await fetch(`${API_BASE_URL}/api/set-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
    } catch (e) {
      // no-op minimal UI
    }
    navigate(role === 'educator' ? '/educator' : '/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Choose your role</h2>
        <p className="text-gray-500 text-sm mt-2">Select how you want to use Market.Mastery</p>

        <div className="mt-6 grid grid-cols-1 gap-3">
          <button
            onClick={() => chooseRole('student')}
            className="w-full py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Student
          </button>
          <button
            onClick={() => chooseRole('educator')}
            className="w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Educator
          </button>
        </div>
      </div>
    </div>
  )
}


