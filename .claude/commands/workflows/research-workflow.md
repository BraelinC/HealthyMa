# Research Workflow

Systematic approach to technical research and investigation.

Arguments: $ARGUMENTS

## Workflow Steps

### 1. Define Research Scope
First, clarify what we're researching:
- **Technology evaluation?** (new library, framework, approach)
- **Performance investigation?** (optimization opportunities)
- **Architecture exploration?** (design patterns, structures)
- **Best practices research?** (industry standards, conventions)
- **Problem solving?** (finding solutions to specific challenges)

### 2. Context Building
```
/smart-context-builder
"Prepare to research: $ARGUMENTS
Understand:
- Current implementation relevant to research
- Existing constraints or requirements
- Success criteria for research
- How findings will be applied"
```

### 3. Current State Analysis
```
/analyze-nutrima
/understand-feature "related to $ARGUMENTS"
```
Document:
- What we currently have
- Why we need to research
- Constraints to consider
- Goals to achieve

### 4. Research Execution

#### 4a. Internal Analysis
- Review current codebase
- Analyze existing patterns
- Identify pain points
- Document limitations

#### 4b. External Research
- Industry best practices
- Similar implementations
- Academic papers (if relevant)
- Open source examples
- Documentation review

#### 4c. Comparative Analysis
Create comparison matrix:
```markdown
| Approach | Pros | Cons | Effort | Risk |
|----------|------|------|--------|------|
| Current  | ... | ...  | N/A    | Low  |
| Option 1 | ... | ...  | Medium | Med  |
| Option 2 | ... | ...  | High   | Low  |
```

### 5. Proof of Concept (if needed)

For technical evaluations:
1. Create isolated test environment
2. Implement minimal example
3. Measure key metrics
4. Document findings

```typescript
// POC: Testing $ARGUMENTS approach
// Date: [current date]
// Findings: [document here]
```

### 6. Synthesis and Recommendations

#### 6a. Key Findings
1. **Finding 1**: [Description and implications]
2. **Finding 2**: [Description and implications]
3. **Finding 3**: [Description and implications]

#### 6b. Recommendations
Based on research:
- **Recommended approach**: [What and why]
- **Implementation strategy**: [How to adopt]
- **Migration path**: [If replacing existing]
- **Risk mitigation**: [How to handle risks]

### 7. Documentation Creation
```
/update-context "research findings: $ARGUMENTS"
```

Create research document:
```markdown
# Research: $ARGUMENTS

## Executive Summary
[2-3 sentence summary of findings]

## Background
[Why this research was needed]

## Methodology
[How research was conducted]

## Findings
[Detailed findings with evidence]

## Recommendations
[Clear actionable recommendations]

## Implementation Plan
[If proceeding, how to implement]

## Appendix
[Supporting data, links, references]
```

### 8. Decision Making Support

Prepare for decision:
- Cost-benefit analysis
- Risk assessment
- Timeline estimation
- Resource requirements
- Success metrics

## Research Patterns

### Technology Evaluation Pattern
1. Define evaluation criteria
2. Create comparison matrix
3. Build proof of concept
4. Measure against criteria
5. Make recommendation

### Performance Research Pattern
1. Baseline current performance
2. Identify bottlenecks
3. Research solutions
4. Test improvements
5. Document gains

### Architecture Research Pattern
1. Document current architecture
2. Identify pain points
3. Research alternatives
4. Model new approach
5. Plan migration

## Research Tools and Techniques

### Code Analysis
- Static analysis tools
- Performance profilers
- Dependency analyzers
- Complexity metrics

### Benchmarking
```typescript
// Benchmark template
console.time('approach1');
// Test approach 1
console.timeEnd('approach1');

console.time('approach2');
// Test approach 2
console.timeEnd('approach2');
```

### Documentation Sources
- Official documentation
- GitHub repositories
- Stack Overflow patterns
- Blog posts and articles
- Conference talks

## Quality Checklist

### Research Completeness
- [ ] Problem clearly defined
- [ ] Current state documented
- [ ] Multiple options explored
- [ ] Trade-offs analyzed
- [ ] Recommendations clear
- [ ] Implementation path defined

### Evidence Quality
- [ ] Sources cited
- [ ] Data quantified
- [ ] Examples provided
- [ ] Assumptions stated
- [ ] Biases acknowledged

## Common Research Areas

### Performance Optimization
- Database query optimization
- Frontend bundle size
- API response times
- Memory usage
- Rendering performance

### Security Research
- Authentication methods
- Data encryption
- API security
- OWASP compliance
- Security headers

### Scalability Research
- Database scaling
- Caching strategies
- Load balancing
- Microservices
- Event-driven architecture

### Developer Experience
- Build times
- Testing strategies
- CI/CD pipelines
- Development tools
- Code quality tools

## Output Formats

### For Technical Audience
- Detailed technical analysis
- Code examples
- Performance metrics
- Implementation guides

### For Stakeholders
- Executive summary
- Cost-benefit analysis
- Risk assessment
- Timeline estimates
- Resource needs

## Next Steps After Research

1. **If proceeding**: Create implementation task
2. **If not**: Document why and alternatives
3. **If partial**: Define what to adopt
4. **If delayed**: Set review date

Remember: Good research leads to informed decisions!