import { mkdir, writeFile, access } from 'node:fs/promises'
import { join } from 'node:path'

const DEPLOY_WORKFLOW = `name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - name: Install dependencies
        run: bun install
        working-directory: packages/gui
      - name: Build
        run: bun run build
        working-directory: packages/gui
        env:
          VITE_GITHUB_OWNER: \${{ github.repository_owner }}
          VITE_GITHUB_REPO: \${{ github.event.repository.name }}
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: packages/gui/dist/
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
        id: deployment
`

export const init = {
  description: 'Initialize a new corpo directory in the current directory.',
  async run() {
    const cwd = process.cwd()
    const configPath = join(cwd, '.corpo', 'config.json')

    try {
      await access(configPath)
      throw new Error('Already initialized (.corpo/config.json exists)')
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e
    }

    await mkdir(join(cwd, '.corpo', 'files'), { recursive: true })
    await writeFile(configPath, JSON.stringify({ navigation: [] }, null, 2))

    // Scaffold the GitHub Pages deploy workflow
    const workflowDir = join(cwd, '.github', 'workflows')
    const workflowPath = join(workflowDir, 'deploy.yml')
    await mkdir(workflowDir, { recursive: true })
    try {
      await access(workflowPath)
      // Already exists — skip to avoid overwriting customizations
    } catch {
      await writeFile(workflowPath, DEPLOY_WORKFLOW)
    }

    return { initialized: true, root: cwd }
  },
}
