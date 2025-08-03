# Update Context Documentation

Automatically updates the CLAUDE.md documentation files based on code changes. Run this after completing significant features or refactoring.

## Usage:
`/update-context "description of changes made"`

## Steps:

### 1. Analyze Recent Changes

1. **Git Status Check**
   ```bash
   git status --short
   git diff --name-only
   ```

2. **Categorize Changes**
   - Frontend changes (client/*)
   - Backend changes (server/*)
   - API changes (routes.ts)
   - New components or services
   - Deleted files

### 2. Update Relevant Documentation

#### For Frontend Changes:
1. **New Components**
   - Add to `/client/src/components/CLAUDE.md`
   - Document props, purpose, and usage
   - Note any new patterns introduced

2. **New Pages**
   - Update routing section in `/client/CLAUDE.md`
   - Document page purpose and data flow

3. **API Integration Changes**
   - Update `/client/src/lib/CLAUDE.md`
   - Document new API functions
   - Note any breaking changes

#### For Backend Changes:
1. **New Services**
   - Add to `/server/CLAUDE.md`
   - Document algorithms and integrations
   - Update service architecture section

2. **API Endpoint Changes**
   - Update API routes section
   - Document request/response formats
   - Note authentication requirements

3. **Database Changes**
   - Update schema in `/ARCHITECTURE.md`
   - Document new tables or columns
   - Note migration requirements

### 3. Update Supporting Files

1. **CHANGELOG.md**
   ```markdown
   ## [Unreleased]
   
   ### Added
   - [New feature/component]
   
   ### Changed
   - [Modified behavior]
   
   ### Fixed
   - [Bug fixes]
   ```

2. **PLAN.md**
   - Mark completed tasks
   - Add new technical debt items
   - Update priorities based on changes

3. **ARCHITECTURE.md**
   - Update system diagrams if needed
   - Document new architectural decisions
   - Update performance metrics

### 4. Validate Documentation

1. **Cross-Reference Check**
   - Ensure all new files are documented
   - Verify documentation matches implementation
   - Check for outdated references

2. **Pattern Consistency**
   - New code follows documented patterns
   - Update patterns if better approach found
   - Document any exceptions

### 5. Generate Update Summary

```markdown
## Context Documentation Updated

### Files Modified:
- ✅ `/CLAUDE.md` - Added new API endpoints
- ✅ `/client/CLAUDE.md` - Updated component list
- ✅ `/CHANGELOG.md` - Added today's changes
- ⏭️ `/PLAN.md` - No updates needed

### Key Changes Documented:
1. [Change 1]
2. [Change 2]

### New Patterns/Conventions:
- [Pattern if any]

### Documentation Health:
- Coverage: 95% (3 undocumented functions)
- Accuracy: High (last updated: today)
- Completeness: Good

### Recommendations:
- [ ] Document function X in Y.ts
- [ ] Update example for feature Z
```

## Automation Rules:

### Auto-Document These Changes:
1. **New Files**: Add to relevant CLAUDE.md
2. **New Functions**: Document purpose and parameters
3. **New API Endpoints**: Add to routes documentation
4. **Breaking Changes**: Highlight in CHANGELOG
5. **Performance Improvements**: Note in ARCHITECTURE

### Smart Detection:
- Detect new React components by file pattern
- Identify new API routes from routes.ts
- Find new services by naming convention
- Detect breaking changes from type modifications

## Integration with Development Flow:

### Pre-Commit Hook Suggestion:
```bash
# Add to .git/hooks/pre-commit
echo "Remember to run /update-context after significant changes!"
```

### Post-Task Checklist:
1. ✅ Code implementation complete
2. ✅ Tests written and passing
3. ✅ Run `/update-context "task description"`
4. ✅ Review documentation updates
5. ✅ Commit code and documentation together

## Quick Commands:

- `/update-context --quick` - Fast update for minor changes
- `/update-context --full` - Complete documentation scan
- `/update-context --check` - Verify documentation accuracy
- `/update-context --auto` - Auto-detect and update