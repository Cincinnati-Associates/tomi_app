#!/usr/bin/env npx tsx

/**
 * gh-to-prp.ts
 *
 * Extracts GitHub issues and converts them to prp.json format for Ralph loop processing.
 * Also creates ADR and implementation-details stub files for each task.
 *
 * Usage:
 *   npx tsx scripts/ralph-loop/gh-to-prp.ts --label ralph-ready
 *   npx tsx scripts/ralph-loop/gh-to-prp.ts --issue 168,182
 *   npx tsx scripts/ralph-loop/gh-to-prp.ts --assignee username --mode backlog
 *   npx tsx scripts/ralph-loop/gh-to-prp.ts --agent frontend-agent
 */

import { execSync } from 'child_process'
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// Types
interface GitHubLabel {
  name: string
}

interface GitHubAssignee {
  login: string
  name?: string
}

interface GitHubMilestone {
  title: string
}

interface GitHubIssue {
  number: number
  title: string
  body: string | null
  labels: GitHubLabel[]
  assignees: GitHubAssignee[]
  state: string
  milestone: GitHubMilestone | null
  url: string
  createdAt: string
  updatedAt: string
}

interface AcceptanceCriterion {
  id: string
  text: string
  met: boolean
}

interface Task {
  id: string
  github_issue: number
  title: string
  description: string
  acceptance_criteria: AcceptanceCriterion[]
  priority: number
  status: 'pending' | 'in_progress' | 'completed'
  depends_on: string[]
  labels: string[]
  agent_owner: string
}

interface PrpJson {
  id: string
  created_at: string
  status: 'active' | 'completed' | 'cancelled'
  mode: 'feature' | 'backlog'
  branch: string
  github: {
    repo: string
    issues: number[]
  }
  iteration: {
    current: number
    max: number
  }
  completion_promise: string
  tasks: Task[]
}

interface CliOptions {
  labels: string[]
  assignee?: string
  issues?: number[]
  agent?: string
  mode: 'feature' | 'backlog'
  output: string
  limit: number
  maxIterations: number
  baseBranch: string
}

// Parse CLI arguments
function parseArgs(): CliOptions {
  const args = process.argv.slice(2)
  const options: CliOptions = {
    labels: [],
    mode: 'feature',
    output: 'prp.json',
    limit: 10,
    maxIterations: 50,
    baseBranch: 'main',
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--label':
        options.labels.push(args[++i])
        break
      case '--assignee':
        options.assignee = args[++i]
        break
      case '--issue':
        options.issues = args[++i].split(',').map(n => parseInt(n.trim()))
        break
      case '--agent':
        options.agent = args[++i]
        break
      case '--mode':
        options.mode = args[++i] as 'feature' | 'backlog'
        break
      case '--output':
        options.output = args[++i]
        break
      case '--limit':
        options.limit = parseInt(args[++i])
        break
      case '--max-iterations':
        options.maxIterations = parseInt(args[++i])
        break
      case '--base-branch':
        options.baseBranch = args[++i]
        break
      case '--help':
        printHelp()
        process.exit(0)
    }
  }

  // When --agent is provided, automatically add agent:<name> and ralph-ready labels
  if (options.agent) {
    if (!options.labels.includes(`agent:${options.agent}`)) {
      options.labels.push(`agent:${options.agent}`)
    }
    if (!options.labels.includes('ralph-ready')) {
      options.labels.push('ralph-ready')
    }
  }

  return options
}

function printHelp(): void {
  console.log(`
gh-to-prp.ts - Extract GitHub issues to prp.json for Ralph loop

Usage:
  npx tsx scripts/ralph-loop/gh-to-prp.ts [options]

Options:
  --label <name>        Filter issues by label (can use multiple times)
  --assignee <user>     Filter issues by assignee
  --issue <n,n,n>       Specific issue numbers (comma-separated)
  --agent <name>        Filter by agent label (adds --label agent:<name> + ralph-ready)
  --mode <type>         'feature' or 'backlog' (default: feature)
  --output <file>       Output file path (default: prp.json)
  --limit <n>           Max issues to fetch (default: 10)
  --max-iterations <n>  Max Ralph loop iterations (default: 50)
  --base-branch <name>  Base branch for feature branch (default: main)
  --help                Show this help message

Examples:
  npx tsx scripts/ralph-loop/gh-to-prp.ts --label ralph-ready
  npx tsx scripts/ralph-loop/gh-to-prp.ts --agent frontend-agent
  npx tsx scripts/ralph-loop/gh-to-prp.ts --agent backend-agent --mode backlog
  npx tsx scripts/ralph-loop/gh-to-prp.ts --issue 321,323,326 --mode feature
  npx tsx scripts/ralph-loop/gh-to-prp.ts --assignee codyzanderson --limit 5
`)
}

// Fetch issues from GitHub
function fetchIssues(options: CliOptions): GitHubIssue[] {
  // If specific issues requested, fetch them individually
  if (options.issues && options.issues.length > 0) {
    return options.issues.map(num => {
      const result = execSync(
        `gh issue view ${num} --json number,title,body,labels,assignees,state,milestone,url,createdAt,updatedAt`,
        { encoding: 'utf-8' }
      )
      return JSON.parse(result)
    })
  }

  // Otherwise, list issues with filters
  const args = ['gh', 'issue', 'list', '--state', 'open']

  options.labels.forEach(label => {
    args.push('--label', label)
  })

  if (options.assignee) {
    args.push('--assignee', options.assignee)
  }

  args.push('--json', 'number,title,body,labels,assignees,state,milestone,url,createdAt,updatedAt')
  args.push('-L', String(options.limit))

  const result = execSync(args.join(' '), { encoding: 'utf-8' })
  return JSON.parse(result)
}

// Get repository info
function getRepoInfo(): string {
  const result = execSync('gh repo view --json nameWithOwner -q .nameWithOwner', {
    encoding: 'utf-8',
  })
  return result.trim()
}

// Parse markdown checkboxes from text
function parseCheckboxes(text: string): string[] {
  const pattern = /^[-*]\s*\[[ x]\]\s*(.+)$/gm
  const items: string[] = []
  let match
  while ((match = pattern.exec(text)) !== null) {
    items.push(match[1].trim())
  }
  return items
}

// Extract a section from markdown by header name
function extractSection(body: string, sectionName: string): string {
  const pattern = new RegExp(`^##\\s*${sectionName}\\s*$([\\s\\S]*?)(?=^##|$)`, 'mi')
  const match = body.match(pattern)
  return match ? match[1].trim() : ''
}

// Get priority from labels (lower number = higher priority)
function getPriority(labels: GitHubLabel[]): number {
  const priorityLabel = labels.find(l => l.name.startsWith('priority:'))
  if (!priorityLabel) return 3 // Default medium priority

  const level = priorityLabel.name.replace('priority:', '')
  switch (level) {
    case 'critical':
      return 1
    case 'high':
      return 2
    case 'medium':
      return 3
    case 'low':
      return 4
    default:
      return 3
  }
}

// Extract agent owner from labels
function extractAgentOwner(labels: GitHubLabel[]): string {
  const agentLabel = labels.find(l => l.name.startsWith('agent:'))
  if (!agentLabel) return 'unassigned'
  return agentLabel.name.replace('agent:', '')
}

// Extract dependencies (issue references) from text
function extractDependencies(body: string, issueNumbers: number[]): string[] {
  const deps: string[] = []

  // Pattern for explicit dependency mentions
  const depPattern = /(?:depends?\s*on|blocked\s*by|requires?|after)\s*#(\d+)/gi
  let match
  while ((match = depPattern.exec(body)) !== null) {
    const num = parseInt(match[1])
    if (issueNumbers.includes(num)) {
      const depId = `GH-${num}`
      if (!deps.includes(depId)) {
        deps.push(depId)
      }
    }
  }

  // Also check Dependencies section
  const depsSection = extractSection(body, 'Dependencies')
  const issueRefPattern = /#(\d+)/g
  while ((match = issueRefPattern.exec(depsSection)) !== null) {
    const num = parseInt(match[1])
    if (issueNumbers.includes(num)) {
      const depId = `GH-${num}`
      if (!deps.includes(depId)) {
        deps.push(depId)
      }
    }
  }

  return deps
}

// Convert GitHub issue to Task
function convertToTask(issue: GitHubIssue, allIssueNumbers: number[]): Task {
  const body = issue.body || ''

  // Extract description from Description section or use full body
  let description = extractSection(body, 'Description')
  if (!description) {
    // If no Description section, use body up to first ## header or first 500 chars
    const firstHeader = body.indexOf('##')
    description =
      firstHeader > 0 ? body.substring(0, firstHeader).trim() : body.substring(0, 500).trim()
  }
  if (!description) {
    description = issue.title
  }

  // Extract acceptance criteria
  let criteriaText = extractSection(body, 'Acceptance Criteria')
  if (!criteriaText) {
    criteriaText = extractSection(body, 'Requirements')
  }

  let criteriaItems = parseCheckboxes(criteriaText)
  if (criteriaItems.length === 0) {
    // Try parsing checkboxes from entire body
    criteriaItems = parseCheckboxes(body)
  }

  const acceptanceCriteria: AcceptanceCriterion[] = criteriaItems.map((text, index) => ({
    id: `ac-${index + 1}`,
    text,
    met: false,
  }))

  // Extract dependencies
  const dependsOn = extractDependencies(body, allIssueNumbers)

  // Get labels as strings
  const labels = issue.labels.map(l => l.name)

  // Extract agent owner from labels
  const agentOwner = extractAgentOwner(issue.labels)

  return {
    id: `GH-${issue.number}`,
    github_issue: issue.number,
    title: issue.title,
    description,
    acceptance_criteria: acceptanceCriteria,
    priority: getPriority(issue.labels),
    status: 'pending',
    depends_on: dependsOn,
    labels,
    agent_owner: agentOwner,
  }
}

// Generate unique loop ID
function generateLoopId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6)
  return `ralph-${timestamp}-${random}`
}

// Generate branch name from issues
function generateBranchName(issues: number[], agent?: string): string {
  if (agent) {
    return `ralph/${agent}`
  }
  if (issues.length === 1) {
    return `ralph/gh-${issues[0]}`
  }
  if (issues.length <= 3) {
    return `ralph/gh-${issues.join('-')}`
  }
  return `ralph/batch-${Date.now().toString(36)}`
}

// Read template file
function readTemplate(templateName: string): string {
  const templatePath = join(process.cwd(), 'PRPs', 'templates', templateName)
  if (!existsSync(templatePath)) {
    console.error(`Template not found: ${templatePath}`)
    process.exit(1)
  }
  return readFileSync(templatePath, 'utf-8')
}

// Create ADR stub file for a task
function createAdrStub(task: Task): void {
  const template = readTemplate('adr-template.md')
  const adrDir = join(process.cwd(), 'PRPs', 'adr')

  if (!existsSync(adrDir)) {
    mkdirSync(adrDir, { recursive: true })
  }

  const content = template
    .replace(/\{\{issue_number\}\}/g, String(task.github_issue))
    .replace(/\{\{title\}\}/g, task.title)
    .replace(/\{\{description\}\}/g, task.description)
    .replace(/\{\{labels\}\}/g, task.labels.join(', ') || 'none')
    .replace(/\{\{priority\}\}/g, getPriorityName(task.priority))
    .replace(/\{\{depends_on\}\}/g, task.depends_on.join(', ') || 'none')
    .replace(/\{\{agent_owner\}\}/g, task.agent_owner)
    .replace(/\{\{timestamp\}\}/g, new Date().toISOString())

  const filePath = join(adrDir, `GH-${task.github_issue}-adr.md`)
  writeFileSync(filePath, content)
  console.log(`  Created: PRPs/adr/GH-${task.github_issue}-adr.md`)
}

// Create implementation details stub file for a task
function createImplementationStub(task: Task): void {
  const template = readTemplate('implementation-template.md')
  const implDir = join(process.cwd(), 'PRPs', 'implementation-details')

  if (!existsSync(implDir)) {
    mkdirSync(implDir, { recursive: true })
  }

  // Format acceptance criteria as markdown checkboxes
  const criteriaMarkdown =
    task.acceptance_criteria.length > 0
      ? task.acceptance_criteria.map(c => `- [ ] ${c.text}`).join('\n')
      : '- [ ] [No acceptance criteria defined in issue]'

  const content = template
    .replace(/\{\{issue_number\}\}/g, String(task.github_issue))
    .replace(/\{\{title\}\}/g, task.title)
    .replace(/\{\{description\}\}/g, task.description)
    .replace(/\{\{acceptance_criteria\}\}/g, criteriaMarkdown)
    .replace(/\{\{agent_owner\}\}/g, task.agent_owner)
    .replace(/\{\{timestamp\}\}/g, new Date().toISOString())

  const filePath = join(implDir, `GH-${task.github_issue}-implementation.md`)
  writeFileSync(filePath, content)
  console.log(`  Created: PRPs/implementation-details/GH-${task.github_issue}-implementation.md`)
}

// Get human-readable priority name
function getPriorityName(priority: number): string {
  switch (priority) {
    case 1:
      return 'critical'
    case 2:
      return 'high'
    case 3:
      return 'medium'
    case 4:
      return 'low'
    default:
      return 'medium'
  }
}

// Main function
function main(): void {
  const options = parseArgs()

  console.log('Fetching GitHub issues...')
  const issues = fetchIssues(options)

  if (issues.length === 0) {
    console.error('No issues found matching criteria')
    process.exit(1)
  }

  console.log(`Found ${issues.length} issue(s)`)

  // Get repo info
  const repoInfo = getRepoInfo()
  console.log(`Repository: ${repoInfo}`)

  // Get all issue numbers for dependency resolution
  const issueNumbers = issues.map(i => i.number)

  // Convert to tasks
  const tasks = issues.map(issue => convertToTask(issue, issueNumbers))

  // Sort by priority (lower number = higher priority)
  tasks.sort((a, b) => a.priority - b.priority)

  // Generate loop ID and branch name
  const loopId = generateLoopId()
  const branchName = generateBranchName(issueNumbers, options.agent)

  // Build prp.json
  const prp: PrpJson = {
    id: loopId,
    created_at: new Date().toISOString(),
    status: 'active',
    mode: options.mode,
    branch: branchName,
    github: {
      repo: repoInfo,
      issues: issueNumbers,
    },
    iteration: {
      current: 1,
      max: options.maxIterations,
    },
    completion_promise: 'TASK_COMPLETE',
    tasks,
  }

  // Write prp.json
  writeFileSync(options.output, JSON.stringify(prp, null, 2))
  console.log(`\nCreated: ${options.output}`)

  // Create ADR and implementation stubs for each task
  console.log('\nCreating documentation stubs...')
  for (const task of tasks) {
    createAdrStub(task)
    createImplementationStub(task)
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('RALPH LOOP INITIALIZED')
  console.log('='.repeat(60))
  console.log(`Loop ID:     ${loopId}`)
  console.log(`Branch:      ${branchName}`)
  console.log(`Mode:        ${options.mode}`)
  console.log(`Issues:      ${issueNumbers.map(n => `#${n}`).join(', ')}`)
  console.log(`Tasks:       ${tasks.length}`)
  console.log(`Max Iters:   ${options.maxIterations}`)
  if (options.agent) {
    console.log(`Agent:       ${options.agent}`)
  }
  console.log('='.repeat(60))
  console.log('\nNext steps:')
  console.log('  1. Run: ./scripts/ralph-loop/init-loop.sh')
  console.log('  2. Or manually: git checkout -b ' + branchName)
  console.log('  3. Start Claude Code session with /ralph-loop:continue')
}

main()
