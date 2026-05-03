'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Thread {
  userId: string; name: string; avatar: string | null;
  lastMessage: string; lastTime: Date; unread: number;
}

interface Message {
  id: string; senderId: string; receiverId: string; content: string;
  read: boolean; createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
  receiver: { id: string; name: string; avatar: string | null };
}

function MessagesContent() {
  const { user, token } = useAuthStore()
  const searchParams = useSearchParams()
  const initialUserId = searchParams.get('userId')

  const [threads, setThreads] = useState<Thread[]>([])
  const [activeUserId, setActiveUserId] = useState<string | null>(initialUserId)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingThreads, setLoadingThreads] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchThreads = useCallback(async () => {
    if (!token) return
    const res = await fetch('/api/messages', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setThreads(data.messages || [])
    setLoadingThreads(false)
  }, [token])

  const fetchMessages = useCallback(async () => {
    if (!token || !activeUserId) return
    const res = await fetch(`/api/messages?userId=${activeUserId}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setMessages(data.messages || [])
  }, [token, activeUserId])

  useEffect(() => { fetchThreads() }, [fetchThreads])
  useEffect(() => { fetchMessages() }, [fetchMessages])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeUserId || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({ receiverId: activeUserId, content: newMsg.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, data.message])
        setNewMsg('')
        fetchThreads()
      }
    } finally { setSending(false) }
  }

  const activeThread = threads.find(t => t.userId === activeUserId)
  const activeName = activeThread?.name || (messages[0]?.sender.id !== user?.id ? messages[0]?.sender.name : messages[0]?.receiver.name) || 'User'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Thread list */}
      <div style={{ width: 300, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <h1 className="font-bold text-xl">Messages</h1>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingThreads ? (
            <div className="p-4 flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60 }} />)}
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center p-10 flex flex-col items-center justify-center h-full animate-fadeIn">
              <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>💬</div>
              <h3 className="text-xl font-bold mb-2">No messages yet</h3>
              <p className="text-secondary-color text-sm leading-relaxed font-medium">
                Your conversations will appear here. Start by sending an inquiry to a property owner!
              </p>
            </div>
          ) : (
            threads.map((t) => (
              <div key={t.userId}
                onClick={() => setActiveUserId(t.userId)}
                style={{
                  padding: '0.875rem 1rem',
                  cursor: 'pointer',
                  background: activeUserId === t.userId ? 'rgba(99,102,241,0.1)' : 'transparent',
                  borderLeft: activeUserId === t.userId ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'var(--transition)',
                }}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="avatar avatar-md">{t.name[0]}</div>
                    {t.unread > 0 && <div className="notif-dot" />}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{t.name}</span>
                      {t.unread > 0 && (
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                          {t.unread}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted truncate mt-0.5">{t.lastMessage}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!activeUserId ? (
          <div className="flex items-center justify-center h-full flex-col gap-4 text-muted">
            <div style={{ fontSize: '4rem' }}>💬</div>
            <p className="text-lg">Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}
              className="flex items-center gap-3">
              <div className="avatar avatar-md">{activeName[0]}</div>
              <div>
                <div className="font-semibold">{activeName}</div>
                <div className="text-xs text-muted">Active now</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.length === 0 ? (
                <div className="text-center text-muted text-sm py-8">No messages yet. Say hello! 👋</div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === user?.id
                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                      <div className={`chat-bubble ${isMine ? 'chat-bubble-sent' : 'chat-bubble-received'}`}>
                        {m.content}
                      </div>
                      <span className="text-xs text-muted mt-1">
                        {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a message..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                />
                <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !newMsg.trim()}
                  style={{ whiteSpace: 'nowrap' }}>
                  {sending ? <span className="spinner" /> : 'Send →'}
                </button>
              </div>
              <p className="text-xs text-muted mt-2">Press Enter to send</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  )
}
