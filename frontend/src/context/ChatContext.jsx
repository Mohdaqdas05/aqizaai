import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react'
import api from '../api/axios'
import { tokenStorage } from '../utils/tokenStorage'

const ChatContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || '/api'

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef(null)

  const fetchChats = useCallback(async () => {
    try {
      const res = await api.get('/chats')
      setChats(res.data?.chats || res.data || [])
    } catch (err) {
      console.error('fetchChats error:', err)
    }
  }, [])

  const createChat = useCallback(async () => {
    const res = await api.post('/chats')
    const newChat = res.data?.chat || res.data
    setChats((prev) => [newChat, ...prev])
    setCurrentChat(newChat)
    setMessages([])
    return newChat
  }, [])

  const selectChat = useCallback(async (chatId) => {
    setIsLoading(true)
    try {
      const res = await api.get(`/chats/${chatId}`)
      const chatData = res.data?.chat || res.data
      const chatMessages = res.data?.messages || chatData?.messages || []
      setCurrentChat(chatData)
      setMessages(chatMessages)
    } catch (err) {
      console.error('selectChat error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteChat = useCallback(
    async (chatId) => {
      await api.delete(`/chats/${chatId}`)
      setChats((prev) => prev.filter((c) => (c._id || c.id) !== chatId))
      if ((currentChat?._id || currentChat?.id) === chatId) {
        setCurrentChat(null)
        setMessages([])
      }
    },
    [currentChat],
  )

  const updateChatTitle = useCallback(async (chatId, title) => {
    await api.patch(`/chats/${chatId}/title`, { title })
    setChats((prev) =>
      prev.map((c) =>
        (c._id || c.id) === chatId ? { ...c, title } : c,
      ),
    )
    setCurrentChat((prev) =>
      prev && (prev._id || prev.id) === chatId ? { ...prev, title } : prev,
    )
  }, [])

  const sendMessage = useCallback(
    async (content, model = 'gpt-4o-mini') => {
      if (!currentChat) return
      const chatId = currentChat._id || currentChat.id

      // Optimistically add user message
      const tempUserMsg = {
        _id: `temp-user-${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      }
      // Placeholder for assistant response
      const tempAssistantMsg = {
        _id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isStreaming: true,
      }

      setMessages((prev) => [...prev, tempUserMsg, tempAssistantMsg])
      setIsStreaming(true)

      const token = tokenStorage.getToken()
      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ content, model }),
          signal: abortControllerRef.current.signal,
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') {
                setIsStreaming(false)
                break
              }
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  assistantContent += parsed.content
                  const snapshot = assistantContent
                  setMessages((prev) =>
                    prev.map((m) =>
                      m._id === tempAssistantMsg._id
                        ? { ...m, content: snapshot, isStreaming: true }
                        : m,
                    ),
                  )
                }
              } catch {
                // ignore parse errors for partial chunks
              }
            }
          }
        }

        // Finalize the assistant message
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempAssistantMsg._id
              ? { ...m, content: assistantContent, isStreaming: false }
              : m,
          ),
        )

        // Update chat title from first message if untitled
        if (
          currentChat.title === 'New Chat' ||
          currentChat.title === 'Untitled'
        ) {
          const newTitle =
            content.length > 40 ? content.slice(0, 40) + '…' : content
          setCurrentChat((prev) => prev ? { ...prev, title: newTitle } : prev)
          setChats((prev) =>
            prev.map((c) =>
              (c._id || c.id) === chatId ? { ...c, title: newTitle } : c,
            ),
          )
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('sendMessage error:', err)
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempAssistantMsg._id
              ? {
                  ...m,
                  content: 'Sorry, something went wrong. Please try again.',
                  isStreaming: false,
                  error: true,
                }
              : m,
          ),
        )
      } finally {
        setIsStreaming(false)
      }
    },
    [currentChat],
  )

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        messages,
        isLoading,
        isStreaming,
        fetchChats,
        createChat,
        selectChat,
        deleteChat,
        updateChatTitle,
        sendMessage,
        stopStreaming,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used inside ChatProvider')
  return ctx
}
