#!/usr/bin/env node
'use strict'

const { spawnSync } = require('child_process')
const path = require('path')

const entry = path.join(__dirname, '..', 'src', 'index.ts')
const result = spawnSync('bun', [entry, ...process.argv.slice(2)], { stdio: 'inherit' })

if (result.error?.code === 'ENOENT') {
  console.error('corpo requires Bun. Install from https://bun.sh')
  process.exit(1)
}

process.exit(result.status ?? 0)
