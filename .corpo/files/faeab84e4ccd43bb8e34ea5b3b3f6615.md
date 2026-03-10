---
title: "Layout Controls"
description: "Both sidebars share a base Sidebar component and use a full-height handle strip as the toggle hitbox instead of a tiny floating button. The strip straddles the border (~6px sidebar-side, ~26px content-side) for balanced hover activation. Sidebars overlay content as absolute elements — no layout shift on open or close."
---

Both the navigation sidebar and the thread panel share a base `Sidebar`
component with a unified collapse/expand mechanism.

## Shared Base Component

`Sidebar` accepts a `right` boolean prop and renders two children in a flex
row (or reversed row for right sidebars):

- A **panel** div whose width transitions 0 → `w-72` via `transition-all duration-200`
- A **handle strip** full-height `w-8` div positioned at the border edge

```tsx
<Sidebar right collapsed={collapsed} onCollapsedChange={setCollapsed}>
  {children}
</Sidebar>
```

`NavigationSidebar` wraps `Sidebar` (left, default) with the nav tree.
`ThreadSidebar` wraps `Sidebar right` with thread cards.

## Handle Strip

The toggle hitbox is a full-height transparent strip (`w-8`, 32px) at the
border edge. It straddles the border — ~6px on the sidebar side and ~26px
on the content side — via `ml-[-1.5]` / `mr-[-1.5]` negative margin:

- **Border line**: a `w-px` div inside the strip, 6px from the panel edge.
  Highlights from gray-200 to gray-400 on hover (`group-hover/handle`).
- **Circle**: cosmetic only (`pointer-events-none`), centered on the border
  line. Arrow direction communicates expand/collapse direction. Fades in on
  hover, fades out on leave.

The strip replaces the old `absolute -right-3` / `-left-3` floating button
that sat partially outside the hover zone, requiring the cursor to hunt for it.

## Overlay Layout

Both sidebars are `absolute inset-y-0 z-10`, overlaying content rather than
pushing it in a flex layout. This prevents layout shift when panels open or
close. The outer flex div uses `flex-row` / `flex-row-reverse` to correctly
position the panel and handle strip for left vs. right sidebars.

Root layout:
- `App.tsx`: `relative h-screen` root, `absolute inset-0` main
- `FileView.tsx`: `relative h-full` root, `h-full overflow-y-auto` article

## State

- **Navigation sidebar**: `sidebarCollapsed` in `App.tsx`, passed as
  `collapsed` and `onCollapsedChange` props to `NavigationSidebar`
- **Thread sidebar**: `panelCollapsed` in `FileView.tsx`, passed as
  `collapsed` and `onCollapsedChange` props to `ThreadSidebar`

## Implementation

`gui/src/components/Sidebar.tsx` — base `Sidebar`, `NavigationSidebar`
`gui/src/components/ThreadPanel.tsx` — `ThreadSidebar`
`gui/src/App.tsx` — sidebar collapse state
`gui/src/components/FileView.tsx` — panel collapse state
