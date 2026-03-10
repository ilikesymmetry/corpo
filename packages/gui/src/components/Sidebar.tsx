import { Link, useRoute } from 'wouter'
import { useState } from 'react'
import type { Navigation, Node } from '../lib/api'
import type { Heading } from '../lib/parse'

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

interface NavFileNodeProps {
  id: string
  titles: Record<string, string>
  fileHeadings: Record<string, Heading[]>
  onScrollToSection?: (line: number) => void
}

function NavFileNode({ id, titles, fileHeadings, onScrollToSection }: NavFileNodeProps) {
  const [, params] = useRoute('/:id')
  const [sectionsOpen, setSectionsOpen] = useState(false)
  const active = params?.id === id
  const label = titles[id] ?? id.slice(0, 8) + '…'
  const headings = (fileHeadings[id] ?? []).filter(h => h.level <= 3)

  function handleClick(e: React.MouseEvent) {
    if (active) {
      e.preventDefault()
      setSectionsOpen(o => !o)
    }
  }

  return (
    <div>
      <Link href={`/${id}`} onClick={handleClick}>
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
      {active && sectionsOpen && headings.length > 0 && (
        <div className="mb-1">
          {headings.map((h, i) => (
            <div
              key={i}
              style={{ paddingLeft: `${h.level * 8}px` }}
              className="text-xs text-gray-500 dark:text-gray-400 py-0.5 px-2 truncate cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
              title={h.text}
              onClick={() => onScrollToSection?.(h.line)}
            >
              {h.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface NavNodeProps {
  node: Node
  titles: Record<string, string>
  fileHeadings: Record<string, Heading[]>
  onScrollToSection?: (line: number) => void
}

function NavNode({ node, titles, fileHeadings, onScrollToSection }: NavNodeProps) {
  const [open, setOpen] = useState(true)

  if (typeof node === 'string') {
    return <NavFileNode id={node} titles={titles} fileHeadings={fileHeadings} onScrollToSection={onScrollToSection} />
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
            <NavNode key={i} node={child} titles={titles} fileHeadings={fileHeadings} onScrollToSection={onScrollToSection} />
          ))}
        </div>
      )}
    </div>
  )
}

interface NavigationSidebarProps {
  navigation: Navigation
  titles: Record<string, string>
  fileHeadings: Record<string, Heading[]>
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onScrollToSection?: (line: number) => void
}

export function NavigationSidebar({ navigation, titles, fileHeadings, collapsed, onCollapsedChange, onScrollToSection }: NavigationSidebarProps) {
  return (
    <Sidebar collapsed={collapsed} onCollapsedChange={onCollapsedChange}>
      <nav className="h-full overflow-y-auto p-4">
        {navigation.map((node, i) => (
          <NavNode key={i} node={node} titles={titles} fileHeadings={fileHeadings} onScrollToSection={onScrollToSection} />
        ))}
      </nav>
    </Sidebar>
  )
}
