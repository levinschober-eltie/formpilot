import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import FormPilot from './App.jsx'
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <FormPilot />
    </ErrorBoundary>
  </StrictMode>,
)
