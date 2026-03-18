// ═══ FormPilot — Public API for embedding ═══
// Use these exports to integrate FormPilot into a host application.

// Main App (full standalone experience)
export { default as FormPilot } from './App';

// Context Providers (for embedding with external auth)
export { AuthProvider, useAuth } from './contexts/AuthContext';
export { DataProvider, useData } from './contexts/DataContext';

// Key Components (for granular embedding)
export { FormFiller } from './components/filler/FormFiller';
export { TemplateSelector } from './components/filler/TemplateSelector';

// Shared Utilities
export { ErrorBoundary } from './components/common/ErrorBoundary';
export { GlobalDialog } from './components/common/GlobalDialog';
export { dialog } from './lib/dialogService';

// Theme & Config
export { S, CATEGORY_COLORS, STATUS_COLORS, STATUS_LABELS } from './config/theme';
