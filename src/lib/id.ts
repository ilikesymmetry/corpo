import { randomUUID } from 'node:crypto'

export const generateId = () => randomUUID().replace(/-/g, '')
