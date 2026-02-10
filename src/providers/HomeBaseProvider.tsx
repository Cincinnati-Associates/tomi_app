"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { useAuthContext } from '@/providers/AuthProvider'

interface PartyOption {
  id: string
  name: string
  members: string[]
}

interface HomeBaseContextType {
  activePartyId: string | null
  parties: PartyOption[]
  isLoading: boolean
  setActivePartyId: (id: string) => void
  /** Increment to signal task/document lists to re-fetch */
  refreshKey: number
  triggerRefresh: () => void
}

const HomeBaseContext = createContext<HomeBaseContextType | null>(null)

const STORAGE_KEY = 'homebase_active_party_id'

export function HomeBaseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  const [activePartyId, setActivePartyIdState] = useState<string | null>(null)
  const [parties, setParties] = useState<PartyOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch user's closed parties
  useEffect(() => {
    if (!user) return

    async function fetchParties() {
      try {
        const res = await fetch('/api/homebase/parties')
        if (res.ok) {
          const data = await res.json()
          setParties(data)

          // Restore saved party or default to first
          const savedId =
            typeof window !== 'undefined'
              ? localStorage.getItem(STORAGE_KEY)
              : null
          const validSaved = data.find(
            (p: PartyOption) => p.id === savedId
          )

          if (validSaved) {
            setActivePartyIdState(validSaved.id)
          } else if (data.length > 0) {
            setActivePartyIdState(data[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to fetch parties:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchParties()
  }, [user])

  const setActivePartyId = useCallback((id: string) => {
    setActivePartyIdState(id)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id)
    }
  }, [])

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <HomeBaseContext.Provider
      value={{ activePartyId, parties, isLoading, setActivePartyId, refreshKey, triggerRefresh }}
    >
      {children}
    </HomeBaseContext.Provider>
  )
}

export function useHomeBase() {
  const context = useContext(HomeBaseContext)
  if (!context) {
    throw new Error('useHomeBase must be used within a HomeBaseProvider')
  }
  return context
}
