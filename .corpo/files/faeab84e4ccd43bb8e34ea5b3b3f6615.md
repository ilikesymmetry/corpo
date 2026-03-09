---
title: "Layout Controls"
description: "Hover-reveal collapse buttons on the sidebar and thread panel. Both panels collapse to zero width via smooth CSS transition. Buttons are absolutely positioned to avoid layout shift on show or hide."
---

Both the navigation sidebar and the thread panel support collapse. The
pattern is identical for both panels.

## Pattern

Each collapsible panel wraps its content in a `relative group` container. A
button is absolutely positioned on the inner edge, hidden by default
(`opacity-0`) and revealed on hover (`group-hover:opacity-100`). Clicking
collapses the panel via a CSS width transition:

```tsx
className={`transition-all duration-200 ${
  collapsed ? 'w-0 overflow-hidden p-0 border-0' : 'w-64'
}`}
```

The button arrow flips (‹/›) to communicate the expand direction when collapsed.

## Sidebar

- Button sits on the **right edge** (`-right-3`) of the sidebar container
- State: `sidebarCollapsed` in `App.tsx`, passed as `collapsed` / `onToggle` props
- Default width: `w-64`

## Thread Panel

- Button sits on the **left edge** (`-left-3`) of the panel container
- State: self-contained in `ThreadPanel` — not lifted to parent
- Default width: `w-72`

## No Layout Shift

Buttons are absolutely positioned outside normal document flow. They don't
affect surrounding layout whether visible or hidden.

## Implementation

`viewer/src/components/Sidebar.tsx`
`viewer/src/components/ThreadPanel.tsx`
`viewer/src/App.tsx` — sidebar collapse state
