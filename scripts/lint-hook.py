#!/usr/bin/env python3
"""
Claude Code PostToolUse hook — runs corpo lint on any edited .corpo/files/*.md file.
Exits 1 with error output if integrity violations are found, so Claude sees them immediately.
"""
import sys
import json
import subprocess
import re
import os

try:
    d = json.load(sys.stdin)
    fp = d.get('file_path', '')
    m = re.search(r'\.corpo/files/([a-f0-9]{32})\.md$', fp)
    if not m:
        sys.exit(0)

    file_id = m.group(1)
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    result = subprocess.run(
        ['bun', 'src/index.ts', 'lint', file_id],
        text=True,
        capture_output=True,
        cwd=project_root,
    )

    if result.returncode != 0:
        print(result.stderr or result.stdout, end='')
        sys.exit(1)

except Exception:
    pass
