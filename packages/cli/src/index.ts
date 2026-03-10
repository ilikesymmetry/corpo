import { Cli } from 'incur'
import { init } from './commands/init.ts'
import { serve } from './commands/serve.ts'
import { reply } from './commands/reply.ts'
import { threads } from './commands/threads.ts'
import { lint } from './commands/lint.ts'
import { resolve } from './commands/resolve.ts'
import { newFile } from './commands/new.ts'
import { mv } from './commands/mv.ts'
import { update } from './commands/update.ts'
import { comment } from './commands/comment.ts'

Cli.create('corpo', {
  description: 'Git-backed, agent-native file protocol.',
})
  .command('init', init)
  .command('serve', serve)
  .command('reply', reply)
  .command('threads', threads)
  .command('lint', lint)
  .command('resolve', resolve)
  .command('new', newFile)
  .command('mv', mv)
  .command('update', update)
  .command('comment', comment)
  .serve()
