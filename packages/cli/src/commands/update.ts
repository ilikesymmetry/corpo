import pkg from '../../package.json'

export const update = {
  description: 'Update corpo to the latest version from npm.',
  async run() {
    const current = pkg.version
    const name = pkg.name

    const res = await fetch(`https://registry.npmjs.org/${name}/latest`)
    if (!res.ok) throw new Error(`Failed to reach npm registry (${res.status})`)
    const { version: latest } = (await res.json()) as { version: string }

    if (current === latest) {
      return { current, latest, updated: false, message: `Already up to date (${current}).` }
    }

    console.log(`Updating ${name} ${current} → ${latest}`)
    const result = Bun.spawnSync(['npm', 'install', '-g', `${name}@latest`], {
      stdio: 'inherit',
    })
    if (result.exitCode !== 0) throw new Error('Update failed.')

    return { current, latest, updated: true }
  },
}
