
#!/bin/bash

# Make sure Claude Code is available
export PATH="$HOME/.config/npm/node_global/bin:$PATH"

# Start Claude Code with persistent session
claude --persist-session

echo "Claude Code started with persistent session"
