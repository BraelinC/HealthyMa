#!/bin/bash
# Quick session setup script for Replit
# Usage: source .claude/quick-session-setup.sh

echo "=== SESSION START $(date) ===" | tee -a .claude/session.log

# Session restoration helper function
update_claude_md() {
    local task_id="$1"
    local message="$2"
    
    echo "" >> CLAUDE.md
    echo "### Session Progress - $(date '+%Y-%m-%d %H:%M')" >> CLAUDE.md
    echo "- Task $task_id: $message" >> CLAUDE.md
    
    if [ -n "$task_id" ]; then
        echo "- Current task status:" >> CLAUDE.md
        task-master show "$task_id" 2>/dev/null | grep -E "(title|status|description)" >> CLAUDE.md || echo "  Task not found" >> CLAUDE.md
    fi
    
    echo "- Git status:" >> CLAUDE.md
    git status --short >> CLAUDE.md
    echo "" >> CLAUDE.md
}

# Task completion helper
complete_task() {
    local task_id="$1"
    echo "Completing task $task_id..." | tee -a .claude/session.log
    task-master set-status --id="$task_id" --status=done
    update_claude_md "$task_id" "✅ COMPLETED"
    echo "Next available task:" | tee -a .claude/session.log
    task-master next | tee -a .claude/session.log
}

# Session end helper
end_session() {
    echo "=== SESSION END $(date) ===" | tee -a .claude/session.log
    task-master list --status=in-progress >> .claude/session.log
    git status >> .claude/session.log
    echo "Session ended. Context saved to CLAUDE.md and .claude/session.log"
}

echo "Session helpers loaded. Available commands:"
echo "  update_claude_md <task_id> <message>"
echo "  complete_task <task_id>"
echo "  end_session"
echo ""

# Quick status check
if command -v task-master >/dev/null 2>&1; then
    echo "Current active tasks:" | tee -a .claude/session.log
    task-master list --status=in-progress,pending | head -5 | tee -a .claude/session.log
else
    echo "Task Master not available - using git status only" | tee -a .claude/session.log
fi

echo ""
echo "Git status:" | tee -a .claude/session.log
git status --short | tee -a .claude/session.log