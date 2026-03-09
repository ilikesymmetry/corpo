#!/usr/bin/env node
'use strict'

const { spawnSync } = require('child_process')
const path = require('path')

const entry = path.join(__dirname, '..', 'src', 'index.ts')
const result = spawnSync('bun', [entry, ...process.argv.slice(2)], { stdio: 'inherit' })

if (result.error?.code === 'ENOENT') {
  console.error('corpo requires Bun. Install it with:')
  console.error('  curl -fsSL https://bun.sh/install | bash')
  console.error('  # or: npm install -g bun')
  process.exit(1)
}

process.exit(result.status ?? 0)
