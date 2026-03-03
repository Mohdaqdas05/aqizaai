import { ChatProvider } from '../context/ChatContext'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import ErrorBoundary from '../components/ErrorBoundary'

export default function Dashboard() {
  return (
    <ChatProvider>
      <div className="flex h-screen bg-surface overflow-hidden">
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>
        <main className="flex-1 min-w-0 overflow-hidden">
          <ErrorBoundary>
            <ChatWindow />
          </ErrorBoundary>
        </main>
      </div>
    </ChatProvider>
  )
}
