import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppContextProvider } from './context/AppContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'

// Clerk Publishable Key from Vite env
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const container = document.getElementById('root')
const root = createRoot(container)

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#fff7ed', color: '#7c2d12', padding: 24
        }}>
          <div style={{maxWidth: 720}}>
            <h1 style={{fontSize: 20, marginBottom: 8}}>The app encountered an error</h1>
            <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace', background: '#fffbeb', padding: 12, borderRadius: 8, border: '1px solid #fef3c7'}}>
              {String(this.state.error)}
            </pre>
            <p style={{marginTop: 8, opacity: 0.8}}>Check the browser console for details.</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

if (!PUBLISHABLE_KEY) {
  root.render(
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      color: '#111827',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif'
    }}>
      <div style={{textAlign: 'center'}}>
        <h1 style={{fontSize: 24, marginBottom: 8}}>Configuration required</h1>
        <p style={{opacity: 0.8}}>Missing environment variable: VITE_CLERK_PUBLISHABLE_KEY</p>
        <p style={{marginTop: 8, opacity: 0.7}}>Create a .env file in the client folder and set the key, then restart the dev server.</p>
      </div>
    </div>
  )
} else {
  root.render(
    <ErrorBoundary>
      <BrowserRouter>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
          <AppContextProvider>
            <App />
          </AppContextProvider>
        </ClerkProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
