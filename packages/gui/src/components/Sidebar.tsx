import { Link, useRoute } from 'wouter'
import { useState } from 'react'
import type { Navigation, Node } from '../lib/api'

interface SidebarProps {
  right?: boolean
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  children: React.ReactNode
}

export function Sidebar({ right = false, collapsed, onCollapsedChange, children }: SidebarProps) {
  const expandChevron = right ? '‹' : '›'
  const collapseChevron = right ? '›' : '‹'

  return (
    <div className={`absolute inset-y-0 z-10 flex ${right ? 'right-0 flex-row-reverse' : 'left-0 flex-row'}`}>
      {/* Panel */}
      <div className={`h-full bg-white dark:bg-gray-900 transition-all duration-200 overflow-hidden ${collapsed ? 'w-0' : 'w-72'}`}>
        {!collapsed && children}
      </div>
      {/* Handle strip — full-height click zone straddling the border edge (~6px sidebar-side, ~26px content-side) */}
      <div
        className={`relative h-full w-8 flex-shrink-0 cursor-pointer group/handle ${right ? '-mr-1.5' : '-ml-1.5'}`}
        onClick={() => onCollapsedChange(!collapsed)}
      >
        {/* Border line — positioned 6px from the sidebar edge, highlights on hover */}
        <div className={`absolute inset-y-0 ${right ? 'right-1.5' : 'left-1.5'} w-px bg-gray-200 dark:bg-gray-700 group-hover/handle:bg-gray-400 dark:group-hover/handle:bg-gray-500 transition-colors`} />
        {/* Cosmetic circle centered on the border line, pointer-events disabled */}
        <div className={`absolute top-1/2 ${right ? 'right-1.5 translate-x-1/2' : 'left-1.5 -translate-x-1/2'} -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 group-hover/handle:text-gray-700 dark:group-hover/handle:text-gray-200 flex items-center justify-center opacity-0 group-hover/handle:opacity-100 transition-opacity shadow-sm text-sm select-none pointer-events-none`}>
          {collapsed ? expandChevron : collapseChevron}
        </div>
      </div>
    </div>
  )
}

function NavNode({ node, titles }: { node: Node; titles: Record<string, string> }) {
  const [open, setOpen] = useState(true)
  const [, params] = useRoute('/:id')

  if (typeof node === 'string') {
    const active = params?.id === node
    const label = titles[node] ?? node.slice(0, 8) + '…'
    return (
      <Link href={`/${node}`}>
        <span
          className={`block px-2 py-1 rounded text-sm cursor-pointer truncate ${
            active
              ? 'bg-blue-100 dark:bg-blue-900 font-semibold'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title={label}
        >
          {label}
        </span>
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        <span className="text-base">{open ? '▾' : '▸'}</span> {node.group}
      </button>
      {open && (
        <div className="ml-2">
          {node.children.map((child, i) => (
            <NavNode key={i} node={child} titles={titles} />
          ))}
        </div>
      )}
    </div>
  )
}

interface NavigationSidebarProps {
  navigation: Navigation
  titles: Record<string, string>
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

export function NavigationSidebar({ navigation, titles, collapsed, onCollapsedChange }: NavigationSidebarProps) {
  return (
    <Sidebar collapsed={collapsed} onCollapsedChange={onCollapsedChange}>
      <nav className="h-full overflow-y-auto p-4">
        {navigation.map((node, i) => (
          <NavNode key={i} node={node} titles={titles} />
        ))}
      </nav>
    </Sidebar>
  )
}
