'use client'

import { useParams, useRouter } from 'next/navigation'
import { GroupChatView } from '@/components/group-chat/GroupChatView'

export default function GroupChatPage() {
  const params = useParams()
  const router = useRouter()
  const partyId = params.partyId as string

  if (!partyId) {
    router.push('/journey')
    return null
  }

  return (
    <div className="h-[calc(100dvh-64px)]">
      <GroupChatView partyId={partyId} />
    </div>
  )
}
