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
        {open ? '▾' : '▸'} {node.group}
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

export function Sidebar({ navigation, titles }: { navigation: Navigation; titles: Record<string, string> }) {
  return (
    <nav className="w-64 shrink-0 h-screen overflow-y-auto border-r border-gray-200 dark:border-gray-700 p-4">
      <div className="text-lg font-bold mb-4">corpo</div>
      {navigation.map((node, i) => (
        <NavNode key={i} node={node} titles={titles} />
      ))}
    </nav>
  )
}
