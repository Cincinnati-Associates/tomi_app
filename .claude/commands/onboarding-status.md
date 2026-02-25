Check the status of the onboarding build by querying the GitHub Project board.

Run: `gh project item-list 4 --owner Tomi-Homes --format json --limit 30`

Parse the results and report:
1. **By Status:** How many issues are Todo / In Progress / Done
2. **By Phase:** Count of P1-assessment / P2-board / P3-legal issues and their status
3. **By Agent:** Count of issues per agent label (frontend/backend/ai/infra) and their status
4. **By Priority:** P0 (critical) issues status, any blockers

Format as a concise status report with the most important blockers and next actions highlighted.
