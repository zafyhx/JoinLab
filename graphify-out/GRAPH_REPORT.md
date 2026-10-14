# Graph Report - Software-E  (2026-10-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 409 nodes · 963 edges · 19 communities (11 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `db712f77`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18

## God Nodes (most connected - your core abstractions)
1. `next` - 34 edges
2. `drizzle-orm` - 27 edges
3. `cn()` - 25 edges
4. `db` - 25 edges
5. `getCurrentUser()` - 23 edges
6. `getEffectiveStudent()` - 20 edges
7. `questions` - 19 edges
8. `lucide-react` - 17 edges
9. `compilerOptions` - 16 edges
10. `Badge()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `ErdViewerProps` --references--> `ErdData`  [EXTRACTED]
  src/components/workspace/ErdViewer.tsx → src/lib/domain/erd/ErdBuilder.ts
- `WorkspaceLayoutProps` --references--> `ErdData`  [EXTRACTED]
  src/components/workspace/WorkspaceLayout.tsx → src/lib/domain/erd/ErdBuilder.ts
- `FeedbackPanelProps` --references--> `FeedbackPayload`  [EXTRACTED]
  src/components/workspace/FeedbackPanel.tsx → src/lib/domain/feedback/FeedbackBuilder.ts
- `DiagnosisResult` --references--> `Finding`  [EXTRACTED]
  src/lib/domain/diagnosis/DiagnosisEngine.ts → src/lib/domain/diagnosis/types.ts
- `POST()` --calls--> `setSessionUser()`  [EXTRACTED]
  src/app/api/auth/login/route.ts → src/lib/auth/session.ts

## Import Cycles
- None detected.

## Communities (19 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (66): bcryptjs, drizzle-orm, next, zod, ERROR_PATTERNS_SEED, SCHEMAS_SEED, loginSchema, POST() (+58 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (41): class-variance-authority, clsx, lucide-react, react, tailwind-merge, DashboardPage(), InstructorDashboardPage(), LoginPage() (+33 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (43): node-sql-parser, POST(), FeedbackPanelProps, WorkspaceLayoutProps, Question, SchemaDefinition, ALL_DETECTORS, E01_MissingJoinConditionDetector (+35 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (29): eslintConfig, name, private, version, dotenv, drizzle-kit, eslint, eslint-config-next (+21 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (22): main(), POST(), POST(), globalForSandbox, sandboxPool, hrtimeMs(), mapPostgresError(), RunOptions (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (12): DosenSoalPage(), emptyForm(), Field(), FormState, PreviewResult, QuestionRow, SchemaOption, SoalManager() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (17): devDependencies, drizzle-kit, eslint, eslint-config-next, @playwright/test, tailwindcss, @tailwindcss/postcss, tsx (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (16): dependencies, bcryptjs, class-variance-authority, clsx, dotenv, drizzle-orm, lucide-react, @monaco-editor/react (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (15): scripts, build, db:generate, db:push, db:refresh-expected, db:sandbox-rebuild, db:seed, db:studio (+7 more)

### Community 10 - "Community 10"
Cohesion: 0.27
Nodes (4): ActualResultPayload, ExpectedResultPayload, ResultComparator, ResultNormalizer

## Knowledge Gaps
- **14 isolated node(s):** `next-auth`, `@playwright/test`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss` (+9 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 180 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Community 0` to `Community 1`, `Community 3`, `Community 5`, `Community 12`, `Community 13`, `Community 15`, `Community 17`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **What connects `next-auth`, `@playwright/test`, `react-dom` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07173539518900343 - nodes in this community are weakly interconnected._
- **Why does `drizzle-orm` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08469449485783424 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Community 7` to `Community 3`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06328320802005012 - nodes in this community are weakly interconnected._