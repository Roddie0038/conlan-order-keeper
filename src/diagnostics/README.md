# Diagnostics Agent

A lightweight, feature-flagged system for investigating form state loss in the New Order form.

## Enabling the Diagnostics Agent

The diagnostics agent is **disabled by default** in all environments, especially production.

### Development Environment

1. Create or edit `.env.local` in the project root:
```bash
VITE_DIAG_AGENT=true
```

2. Restart the development server:
```bash
npm run dev
# or
pnpm dev
```

3. **Optional**: Add `?debug=1` to the URL to see a visual indicator that diagnostics are active.

### What Gets Logged

The agent captures:

- **Navigation Events**: Route changes, page visibility, browser navigation type
- **Form Lifecycle**: Component mount/unmount events with route context
- **Form State**: Aggregate field counts only (no PII - field values are never logged)
- **Browser Events**: Page hide, before unload, popstate events

### Viewing Diagnostics Data

**Console**: Open browser DevTools → Console. Look for grouped logs starting with `[DIAG][NewOrder]`

**SessionStorage**: 
```javascript
// In browser console
JSON.parse(sessionStorage.getItem('diag:new-order-form'))
```

### Data Structure

Each event follows this structure:
```typescript
{
  kind: 'ROUTE_CHANGE' | 'FORM_MOUNT' | 'FORM_STATE' | ...,
  ts: 1640995200000, // timestamp
  // ... event-specific data
}
```

### Privacy & Security

- **No PII**: Field values, user data, or sensitive information is never logged
- **Aggregate Only**: Form state logs only field counts (e.g., `dirtyFieldsCount: 3`)
- **Ring Buffer**: Maximum 100 events to prevent memory bloat  
- **No Network**: All data stays in browser - no external transmission

### Testing

Run the E2E test to verify the agent:
```bash
npx playwright test e2e/diagnostics/new-order-form.spec.ts
```

### Disabling

Set `VITE_DIAG_AGENT=false` or remove the environment variable entirely, then restart the server.

## Purpose

This diagnostics agent helps identify the root cause of reported form state loss by distinguishing between:
- Hard page reloads
- Client-side navigation issues  
- Component unmounting during routing
- Context provider teardown

The findings will inform Phase 2 implementation strategy for state persistence.