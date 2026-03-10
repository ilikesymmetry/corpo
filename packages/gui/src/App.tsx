import { useState, useEffect, useRef } from 'react'
import { Switch, Route, Redirect, useLocation } from 'wouter'
import { Agentation } from 'agentation'
import { useNavigation } from './hooks/useNavigation'
import { NavigationSidebar } from './components/Sidebar'
import { FileView, type FileViewHandle } from './components/FileView'
import { getFile } from './lib/api'
import { parseFile, parseHeadings } from './lib/parse'
import type { Node } from './lib/api'
import type { Heading } from './lib/parse'

function getAllIds(nodes: Node[]): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    if (typeof node === 'string') ids.push(node)
    else ids.push(...getAllIds(node.children))
  }
  return ids
}

function getFirstFileId(navigation: Node[]): string | null {
  for (const node of navigation) {
    if (typeof node === 'string') return node
    if ('children' in node) {
      const found = getFirstFileId(node.children)
      if (found) return found
    }
  }
  return null
}

function RootRedirect({ firstId }: { firstId: string | null }) {
  useLocation()
  if (firstId) return <Redirect to={`/${firstId}`} />
  return <div className="p-8 text-gray-500">No files.</div>
}

export default function App() {
  const { navigation, error } = useNavigation()
  const [titles, setTitles] = useState<Record<string, string>>({})
  const [fileHeadings, setFileHeadings] = useState<Record<string, Heading[]>>({})
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const fileViewRef = useRef<FileViewHandle>(null)

  useEffect(() => {
    if (!navigation) return
    const ids = getAllIds(navigation)
    Promise.all(
      ids.map(id =>
        getFile(id)
          .then(raw => {
            const { meta, content } = parseFile(raw)
            return { id, title: meta.sidebarTitle ?? meta.title ?? id.slice(0, 8), headings: parseHeadings(content) }
          })
          .catch(() => ({ id, title: id.slice(0, 8), headings: [] as Heading[] }))
      )
    ).then(results => {
      setTitles(Object.fromEntries(results.map(r => [r.id, r.title])))
      setFileHeadings(Object.fromEntries(results.map(r => [r.id, r.headings])))
    })
  }, [navigation])

  if (error) return <div className="p-8 text-red-500">Failed to load: {error}</div>
  if (!navigation) return <div className="p-8 text-gray-500">Loading&hellip;</div>

  const firstId = getFirstFileId(navigation)

  return (
    <div className="relative h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <NavigationSidebar navigation={navigation} titles={titles} fileHeadings={fileHeadings} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} onScrollToSection={(line) => fileViewRef.current?.scrollToHeading(line)} />
      <main className="absolute inset-0 overflow-hidden flex flex-col">
        <Switch>
          <Route path="/">
            <RootRedirect firstId={firstId} />
          </Route>
          <Route path="/:id">
            {(params) => <FileView id={params.id} ref={fileViewRef} />}
          </Route>
        </Switch>
      </main>
      {import.meta.env.DEV && <Agentation endpoint="http://localhost:4747"
  onSessionCreated={(sessionId) => {
    console.log("Session started:", sessionId);
  }} />}
    </div>
  )
}
