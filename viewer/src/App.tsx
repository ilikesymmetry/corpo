import { useState, useEffect } from 'react'
import { Switch, Route, Redirect, useLocation } from 'wouter'
import { useNavigation } from './hooks/useNavigation'
import { Sidebar } from './components/Sidebar'
import { FileView } from './components/FileView'
import { getFile } from './lib/api'
import { parseFile } from './lib/parse'
import type { Node } from './lib/api'

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
  return <div className="p-8 text-gray-500">No files in corpus.</div>
}

export default function App() {
  const { navigation, error } = useNavigation()
  const [titles, setTitles] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!navigation) return
    const ids = getAllIds(navigation)
    Promise.all(
      ids.map(id =>
        getFile(id)
          .then(raw => {
            const { meta } = parseFile(raw)
            return { id, title: meta.sidebarTitle ?? meta.title ?? id.slice(0, 8) }
          })
          .catch(() => ({ id, title: id.slice(0, 8) }))
      )
    ).then(results => setTitles(Object.fromEntries(results.map(r => [r.id, r.title]))))
  }, [navigation])

  if (error) return <div className="p-8 text-red-500">Failed to load corpus: {error}</div>
  if (!navigation) return <div className="p-8 text-gray-500">Loading&hellip;</div>

  const firstId = getFirstFileId(navigation)

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar navigation={navigation} titles={titles} />
      <main className="flex-1 overflow-hidden flex flex-col">
        <Switch>
          <Route path="/">
            <RootRedirect firstId={firstId} />
          </Route>
          <Route path="/:id">
            {(params) => <FileView id={params.id} />}
          </Route>
        </Switch>
      </main>
    </div>
  )
}
