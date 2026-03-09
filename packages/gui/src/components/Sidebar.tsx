import { Link, useRoute } from 'wouter'
import { useState } from 'react'
import type { Navigation, Node } from '../lib/api'

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

export function Sidebar({ navigation, titles, collapsed, onToggle }: { navigation: Navigation; titles: Record<string, string>; collapsed: boolean; onToggle: () => void }) {
  return (
    <div className="relative group shrink-0">
      <nav className={`h-screen overflow-y-auto border-r border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 ${collapsed ? 'w-0 overflow-hidden p-0 border-r-0' : 'w-64'}`}>
        {!collapsed && navigation.map((node, i) => (
          <NavNode key={i} node={node} titles={titles} />
        ))}
      </nav>
      <button
        onClick={onToggle}
        className="absolute top-1/2 -translate-y-1/2 -right-3 z-10 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </div>
  )
}
