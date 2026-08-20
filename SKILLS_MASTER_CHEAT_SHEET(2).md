# SKILLS MASTER CHEAT SHEET — 15 Themes × 3 Platforms

> One page to rule the library. Each theme exists as three identical-content files: `chatgpt/GPT_XX` (paste into ChatGPT), `kimi/KIMI_XX` (Kimi fast trigger + backup prompt), `claude/CLAUDE_XX` (save as `.claude/skills/<name>/SKILL.md` or paste). Pick the platform file, grab ONE skill block, replace the placeholder with your task. Skills only run when you explicitly invoke them — they never auto-fire or chain.

| # | Theme | ChatGPT file | Kimi file | Claude file |
|---|-------|--------------|-----------|-------------|
| 1 | Developing & Coding | GPT_01_Developing_Coding | KIMI_01_Developing_Coding | CLAUDE_01_Developing_Coding |
| 2 | Writing, Planning & Ideas Into Action | GPT_02_Writing_Plan_Action | KIMI_02_Writing_Plan_Action | CLAUDE_02_Writing_Plan_Action |
| 3 | Ideas: Merge, Catch & Improve | GPT_03_Ideas_Merge_Tools | KIMI_03_Ideas_Merge_Tools | CLAUDE_03_Ideas_Merge_Tools |
| 4 | Crypto & Futures Trading: The Holy Grail | GPT_04_Trading_Crypto_Futures | KIMI_04_Trading_Crypto_Futures | CLAUDE_04_Trading_Crypto_Futures |
| 5 | Research & Professional Reports | GPT_05_Research_Reports | KIMI_05_Research_Reports | CLAUDE_05_Research_Reports |
| 6 | Business & Startups | GPT_06_Business_Startups | KIMI_06_Business_Startups | CLAUDE_06_Business_Startups |
| 7 | Documents & Presentations | GPT_07_Documents_Presentations | KIMI_07_Documents_Presentations | CLAUDE_07_Documents_Presentations |
| 8 | Security & Devops | GPT_08_Security_DevOps | KIMI_08_Security_DevOps | CLAUDE_08_Security_DevOps |
| 9 | Marketing, Social & Content | GPT_09_Marketing_Social | KIMI_09_Marketing_Social | CLAUDE_09_Marketing_Social |
| 10 | Data & Finance Analysis | GPT_10_Data_Finance_Analysis | KIMI_10_Data_Finance_Analysis | CLAUDE_10_Data_Finance_Analysis |
| 11 | Testing & Qa | GPT_11_Testing_QA | KIMI_11_Testing_QA | CLAUDE_11_Testing_QA |
| 12 | Personal Productivity | GPT_12_Personal_Productivity | KIMI_12_Personal_Productivity | CLAUDE_12_Personal_Productivity |
| 13 | Legal, Compliance & Saudi Regulations | GPT_13_Legal_Compliance_Saudi | KIMI_13_Legal_Compliance_Saudi | CLAUDE_13_Legal_Compliance_Saudi |
| 14 | E-Commerce, Store, Sales & Retention | GPT_14_Ecommerce_Store | KIMI_14_Ecommerce_Store | CLAUDE_14_Ecommerce_Store |
| 15 | Devices & Creative Media Lab | GPT_15_Devices_Creative_Media | KIMI_15_Devices_Creative_Media | CLAUDE_15_Devices_Creative_Media |

---

## 01 — Developing & Coding

| Skill | Useful for |
|-------|-----------|
| `senior-code-reviewer` | Enforces a rigorous senior-engineer protocol for reviewing, fixing, refactoring, or modifying code — with full file investigation, root-cause analysis, risk assessment, and a mandatory completion checklist |
| `code-vuln-audit` | Scans code for dependency vulnerabilities (npm/pip audit), hardcoded secret leaks (regex + entropy analysis), and OWASP anti-patterns (SQL injection, XSS, command injection, insecure deserialization) |
| `deep-module-refactor` | Explores a codebase to find architectural friction, then designs "deep module" refactors (small interface, large hidden implementation) to improve testability and navigability, delivered as RFC proposals |
| `secure-code-review` | Systematic security review against the full OWASP Top 10 (2021), with vulnerable-code identification, severity classification, ready-to-use fix code, and a complete item-by-item report |
| `tdd-coach` | Guides red-green-refactor TDD with behavior-focused tests, vertical slicing (tracer bullets), and minimal implementations that survive refactoring |
| `api-doc-gen` | Scans route/endpoint definitions in Flask, FastAPI, Django REST, Express, Gin, or Echo source code and generates a standard OpenAPI 3.0.3 (Swagger) specification file |
| `smart-commit-gen` | Analyzes a git diff and generates a specification-compliant Conventional Commits message, with automatic scope detection and intelligent type inference |
| `landing-page-scaffold` | Generates a self-contained, single-file landing page HTML prototype with five standard sections (Hero → Social Proof → Features → Pricing → CTA), all CSS inlined, ready to preview in any browser |
| `design-system-builder` | Extracts a full design system from reference UI images (colors, typography, components, spacing), builds an MVP PRD, and composes an implementation-ready UI design prompt for React/Tailwind builds |
| `timeline-builder` | Generates beautiful, interactive, dependency-free timeline HTML pages from event data, with vertical, horizontal, or dual-side layouts, expandable details, and custom theming |

## 02 — Writing, Planning & Ideas Into Action

| Skill | Useful for |
|-------|-----------|
| `content-research-writer` | Acts as your writing partner for research-backed content: collaborative outlining, research with citations, hook improvement, section-by-section feedback, and voice preservation through multiple drafts |
| `product-spec-writer` | Transforms a one-line product idea into a professional PRD with user personas, INVEST user stories, feature decomposition, MoSCoW prioritization, and Given-When-Then acceptance criteria |
| `idea-to-prd` | A streamlined PRD architect for turning quick ideas into structured requirements fast — same rigor (personas, MoSCoW, acceptance criteria) optimized for rapid drafting from minimal input |
| `sprint-plan-builder` | Builds an actionable Sprint plan from team capacity and historical velocity: scope selection, story breakdown and estimation, dependency analysis, workload-balanced assignment, and a risk/commitment check |
| `iteration-planner` | Plans a single iteration by validating scope against capacity, splitting oversized stories, checking dependencies and critical path, and verifying balanced, committed workloads — with a focus on the pitfalls that derail sprints |
| `sop-writer` | Turns a business process — described roughly, pasted as notes, or just named — into a complete SOP document with purpose, scope, RACI matrix, flowchart, detailed steps, exception handling, and metrics |
| `work-report-writer` | Turns scattered work notes and git history into structured weekly or monthly reports in three styles: data-driven, narrative, or OKR-aligned |
| `okr-planner` | Full-cycle OKR coaching: drafting high-quality OKRs, decomposing objectives into executable key results, checking drafts against best practices with scored diagnostics, and running periodic retrospectives |
| `marketing-writer` | Writes or optimizes marketing copy for pages (home, landing, pricing, feature, about, product) — headlines, CTAs, value propositions, taglines, hero content, and full section-by-section page copy with annotated rationale |
| `longread` | Handles files too large to read in one pass — splits prose documents (PDF, DOCX, TXT, MD, PPTX) into overlapping chunks, reads them, and aggregates the findings into one answer |

## 03 — Ideas: Merge, Catch & Improve

| Skill | Useful for |
|-------|-----------|
| `doc-style-remixer` | Extracts the complete visual identity (colors, fonts, layout, tone, table/chart styling) from any reference document and re-applies it to brand-new content |
| `deep-probe` | Grills every detail of your plan or design with a chain of probing questions, walking the decision tree branch by branch until both sides reach consensus |
| `research-advisor` | A systematic dialogue framework (Fischbach & Walsh, Cell 2024) for sharpening research ideas, troubleshooting stuck projects, and navigating strategic decisions |
| `weighted-scorer` | Builds a weighted scoring matrix for technology selection, vendor evaluation, build-vs-buy, or any multi-criteria comparison — with weights, scores, and sensitivity analysis |
| `story-map-builder` | Organizes product requirements into an Epic -> Feature -> Story story map with MoSCoW priorities and release swimlanes, delivered as a self-contained interactive HTML page |
| `user-story-canvas` | A conversational story-mapping guide — interviews you step by step through Epic/Feature/Story breakdown, MoSCoW priorities, and release assignment, then outputs the map data and HTML |
| `project-sizing-guide` | Produces grounded effort estimates using Three-Point Estimation (PERT), T-shirt Sizing, or Function Point Analysis, with confidence intervals and risk adjustments |
| `obsidian-markdown` | Creates and edits valid Obsidian notes using wikilinks, embeds, callouts, properties, tags, comments, and other Obsidian-specific syntax |
| `humanizer` | Detects and rewrites the tell-tale signs of AI-generated text (inflated significance, promo language, vague attribution, em-dash overuse, rule of three, AI vocabulary) so writing reads naturally human |
| `domain-glossary` | Extracts and formalizes domain terminology from your conversation or pasted material into a consistent DDD-style ubiquitous language glossary, flagging ambiguities and proposing canonical terms |

## 04 — Crypto & Futures Trading: The Holy Grail

| Skill | Useful for |
|-------|-----------|
| `holy-grail-mentor` | Activates a veteran trading mentor persona — stocks, forex, and crypto futures — who thinks in probabilities, structure, and risk math, not predictions |
| `market-structure-analyst` | Systematic technical reading — candlesticks, price patterns, S/R, indicators, volume, timeframes — taught as concept → application → numeric example → common mistakes → takeaway |
| `five-strategies-playbook` | Five complete strategies with exact entry/stop/target/invalidation conditions — EMA-pullback swing, range, breakout-retest, VWAP session scalping, conditional DCA |
| `risk-manager` | The survival system — 1-2% rule, position-size formula, stop architectures, R-multiple targets, portfolio heat limits, and trading-psychology traps |
| `backtest-gatekeeper` | The anti-hype filter — mandatory backtest methodology, hard acceptance gates, bias warnings, and the performance-metrics table |
| `signal-lifecycle-auditor` | Makes every signal auditable from birth to death — deterministic first, risk veto, no deleted losses, structured reasoning |
| `technical-indicator-toolkit` | Computes 15+ indicators from OHLCV data and issues a bullish/bearish signal summary with an overall verdict |
| `backtest-discipline` | Turns a strategy description into a rigorous, reproducible backtest — clarification gate, mandatory script, realistic accounting, no-jargon reporting |
| `trading-app-builder` | Architect and build trading tools — layered architecture, testable pure logic, paper-first, full decision logging |
| `trading-ops-operator` | Operates a live paper-trading platform through a strict control-layer — health checks, log diagnosis, safe restarts/deploys, continuous monitoring cycles |

## 05 — Research & Professional Reports

| Skill | Useful for |
|-------|-----------|
| `vc-industry-research` | Generates institutional primary-market (PE/VC) research reports: sector deep-dives, investment memos, and market analysis covering TMT, consumer, healthcare, and industrials |
| `market-research-brief` | Produces data-driven market insight reports modeled on top-tier consulting standards: executive summary, trend analysis, and strategic recommendations with professional charts |
| `market-insight-report` | A consulting-grade market insight report variant emphasizing rigorous chart rendering, assertion-style exhibit titles, and narrative flow from data to strategic recommendation |
| `competitor-analysis` | Analyzes competitors' SEO and GEO (AI-citation) strategies — ranking keywords, content, backlinks, technical health, and AI-answer visibility — to reveal opportunities to outperform them |
| `research-writer` | A writing partner for research-heavy articles: outline co-creation, research with citations, opening hooks, section-by-section feedback, and final polish — while preserving your voice |
| `report-writing` | Orchestrates full professional report creation — research, outline design, multi-chapter writing, review, and assembly — for industry research, market analysis, policy briefs, technical reports, and consulting deliverables |
| `primary-market-research` | Generates institutional-grade primary-market (PE/VC) industry research reports across TMT, consumer, healthcare, and industrial tracks — in a deep-discussion style (15-25 pages) or a traditional data-dense style (30-60 pages) |
| `scholarly-writing-refiner` | Polishes academic English paragraph by paragraph to international journal standards across five dimensions — grammar, word choice, voice/tense, coherence, and sentence structure — with rated reviews, reasoned line edits, and a polished version |
| `research-paper-refiner` | Reviews and rewrites English research-paper excerpts against high-frequency error checklists (grammar, tense, voice, cohesion, sentence variety) and field-specific conventions, outputting annotated corrections plus the refined text |
| `cite-style-converter` | Converts academic citations between APA (7th), MLA (9th), IEEE, and Harvard styles, with auto-detection of the source style, batch processing, and format validation of every entry |

## 06 — Business & Startups

| Skill | Useful for |
|-------|-----------|
| `business-plan-ppt` | Produces a polished, investor-facing business plan / financing proposal presentation in the style of a professional startup fundraising deck (default 18 slides, white background, navy accents) |
| `investor-pitch-planner` | Turns a one-line project description into a complete fundraising pitch deck outline with six modules — Problem, Solution, Market, Business Model, Team, The Ask — plus data-visualization suggestions for each |
| `pitch-deck-creator` | Creates professional pitch decks and financing proposals in the style of a Chinese startup funding proposal (BP), 18-slide template, white background with navy blue accents; supports Chinese and English content |
| `fundraising-bp-planner` | Generates a complete fundraising BP (business plan) outline covering Problem → Solution → Market → Business Model → Team → The Ask, with concrete data-presentation and visualization guidance per module |
| `investment-memo` | Writes clean, text-centric investment memos (DOCX by default, also PDF/PPTX summary) in two classic styles: narrative/thematic (LP-letter style) and VC deal memo (problem/solution/market structure), plus public-market stock memos and IC materials |
| `saas-analyzer` | Acts as a veteran SaaS CFO advisor: takes raw business data (MRR, customers, CAC inputs), computes ARR, churn, LTV, CAC, NRR and more, benchmarks them, and produces a prioritized health report |
| `pricing-strategy` | Designs, audits, and optimizes SaaS pricing — value metrics, good-better-best tiers, price-point research (Van Westendorp), price increases, and pricing pages |
| `cashflow-valuation` | Runs a discounted cash flow valuation: projects free cash flow, computes terminal value (Gordon Growth), derives enterprise value, equity value and per-share value, and generates a growth-rate × discount-rate sensitivity matrix |
| `discounted-cashflow-model` | Builds a complete DCF valuation model — FCF projections, terminal value, enterprise value, equity bridge to per-share price — with an automatic growth × discount sensitivity analysis and CSV/JSON export options |
| `investor-letter-writer` | Drafts classic investment memos — thematic theses, venture deal memos, public-equity analyses, and IC memos — in the plain, text-first style of top VC deal memos and LP investor letters |

## 07 — Documents & Presentations

| Skill | Useful for |
|-------|-----------|
| `docx` | Creates new .docx documents from scratch or from Markdown, and edits existing Word files while preserving their formatting, comments, and tracked changes |
| `pdf` | Creates polished PDFs from HTML (academic papers, reports, resumes) with math, diagrams, and citations; compiles LaTeX when asked; and processes existing PDFs (extract, merge, split, fill forms) |
| `xlsx` | Creates, analyzes, and validates Excel workbooks (XLSX/CSV) — formulas, formatting, charts, PivotTables — plus finance workflows like three-statement models, DCF, and comps analysis |
| `kimi-slides` | Creates new presentations, edits uploaded PPTX files, and replicates decks from images/PDFs — using a structured page-by-page design workflow with validation and refinement loops |
| `meeting-recap` | Turns meeting transcripts, notes, or chat logs into structured minutes — extracting topics, discussion points, decisions, and action items with owners and deadlines |
| `structured-minutes` | Converts transcripts, notes, or chat logs into professional structured minutes with automatic extraction of topics, decisions, and owner/deadline action items, plus open issues and risk alerts |
| `work-recap-writer` | Turns scattered work notes (and git logs where available) into structured weekly or monthly reports in data-driven, narrative, or OKR-aligned styles |
| `process-doc` | Documents a business process as a complete standard operating procedure — purpose, scope, RACI matrix, process flow, detailed steps, exceptions, and metrics |
| `data-viz-renderer` | Generates fully self-contained HTML/SVG infographics from a JSON configuration — stat cards, comparison bar charts, flow diagrams, and mixed dashboards — with 8 color palettes and 24+ built-in icons, zero external dependencies |
| `keynote-composer` | Turns a one-line brief into a professional, fully annotated speech draft for product launches, galas, TED-style talks, and ceremonial addresses — built on Aristotle's Rhetorical Triangle, with pause/tone/pace cues and automatic delivery-time estimation |

## 08 — Security & Devops

| Skill | Useful for |
|-------|-----------|
| `web-security-audit` | Item-by-item security review of your code against the OWASP Top 10 (2021), with vulnerable-code identification and working fix code for every finding |
| `code-safety-audit` | Scans a codebase with three modules — dependency vulnerability audit, hardcoded secret detection (regex + entropy), and static OWASP anti-pattern detection |
| `iso-27001-evidence-collection` | Systematically collects, names, validates, and indexes audit evidence for ISO 27001:2022 and SOC 2 using API-first CLI commands, producing timestamped auditor-ready packages |
| `k8s-cluster-ops` | Runs Kubernetes cluster management via kubectl — resource queries, deploys, log inspection, in-container debugging, context switching, health monitoring, and operational tasks like scaling and node drains |
| `terraform-deploy-traps` | Diagnoses real-world Terraform deployment failures — provisioner races, SSH conflicts, debconf hangs, volume permissions, DB init gaps, Caddy/Cloudflare TLS issues, multi-environment collisions — each as error → root cause → copy-paste fix |
| `log-diagnostic` | Parses log files (JSON, syslog, Nginx — auto-detected), clusters similar errors by normalizing noise, ranks them by frequency, and charts error distribution by hour and date |
| `log-error-digest` | Turns raw logs into a compact error digest — clustered errors, frequency table, and time distribution — in JSON/syslog/Nginx formats with auto-detection |
| `incident-retrospective` | Guides a six-step SRE incident retrospective — overview, timeline, 5 Whys root cause, SMART action items, lessons — and outputs a professional blameless postmortem document |
| `http-load-tester` | Runs stepped HTTP load tests (wrk or ab), collects p50/p90/p99 latencies per concurrency level, auto-detects performance inflection points, and recommends an optimal concurrency |
| `server-ops-skill-pack` | Teaches the AI a 16-skill governed operations registry — every skill has input/output/permissions/risk/evidence/rollback/test, maturity levels L0-L5, and hard approval gates for high-risk actions |

## 09 — Marketing, Social & Content

| Skill | Useful for |
|-------|-----------|
| `ad-copywriter` | Generates high-converting ad headlines, descriptions, and primary text at scale for Google Ads, Meta, LinkedIn, TikTok, and X — from scratch or by iterating on your live performance data |
| `copywriting` | Writes or rewrites persuasive marketing copy for homepages, landing pages, pricing, feature, about, and product pages — clear, specific, action-driving |
| `seo-content-writer` | Creates keyword-optimized articles, guides, and landing pages via a 12-step workflow — title/meta optimization, H1-H6 hierarchy, FAQ for featured snippets, and a 16-item CORE-EEAT quality checklist |
| `seo-analyzer` | Diagnoses technical and on-page SEO issues across crawlability, indexation, Core Web Vitals, content, and authority — delivering findings with impact ratings and a prioritized fix plan |
| `x-thread-crafter` | Converts articles, blog posts, or notes into engaging Twitter/X threads — sub-280-char tweets, scroll-stopping hook, single-action CTA close |
| `email-newsletter-builder` | Builds professional HTML email newsletters that render reliably in Gmail, Outlook, and Apple Mail — table-based layouts, inline CSS, modular sections driven by a JSON config |
| `campaign-planner` | Produces a complete campaign plan — SMART objectives, audience, core messaging, channel strategy, weekly content calendar, asset list, KPIs, budget split, and risks |
| `audience-adapter` | Rewrites one message for different audiences — CEO, VP, tech lead, or operations — adjusting granularity, language, data depth, and emphasis, with ready-made structure templates per role |
| `short-video-script` | Writes TikTok/Reels/Shorts scripts on the golden structure — 3-second hook, conflict, twist, CTA — with shot-by-shot storyboard and precise timing control |
| `humanizer` | Detects and rewrites signs of AI-generated text (based on Wikipedia's "Signs of AI writing") and injects genuine human voice — opinions, rhythm, specificity |

## 10 — Data & Finance Analysis

| Skill | Useful for |
|-------|-----------|
| `financial-statement-analyzer` | Structured analysis of income statement, balance sheet, and cash flow data — YoY/QoQ changes, key ratios, and 10 built-in anomaly-detection rules with risk explanations |
| `financial-report-reader` | Plain-language deep reading of the three financial statements — same YoY/QoQ engine and 10-rule anomaly scan, tuned toward interpretation: what the numbers mean, not just what they are |
| `stock-finance-profiler` | Computes 20+ fundamental ratios across profitability, solvency, liquidity, efficiency, per-share, cash flow, and growth — plus a three-factor DuPont ROE decomposition — from user-provided statements |
| `equity-research-report` | Produces sell-side-style investment research reports (Goldman/Morgan Stanley/JPMorgan look) with dense cover pages, Exhibit-numbered charts and tables, glossary, and disclosures — for equity, fixed income, strategy, sector, ETF, derivatives, or quant topics |
| `sql-insight` | Translates natural language into SQL using live schema context, detects 13 SQL anti-patterns, and interprets EXPLAIN plans for SQLite and PostgreSQL — read-only and injection-safe |
| `data-viz-gen` | Generates fully self-contained HTML/SVG infographics from JSON config — KPI stat cards, grouped bar comparisons, process flows, and mixed dashboards — with 8 color palettes and 24 built-in icons, zero external dependencies |
| `chart-gen` | Renders high-quality PNG/SVG chart images from JSON data via Vega-Lite — line, bar, area, scatter, candlestick, pie/donut, heatmap, multi-series, stacked, dual-axis — built for headless servers, offline, sub-500ms |
| `auto-stat-test` | Automatically picks the right hypothesis test from data characteristics (group count, normality, pairing, variable types), then reports statistic, p-value, effect size, and plain-language interpretation |
| `regression-modeler` | Fits linear (OLS) or logistic (Logit) regression on tabular data — coefficients, p-values, R-squared, odds ratios, VIF multicollinearity checks — with plain-language interpretation; auto-switches to Logit for binary targets |
| `dataset-quality-audit` | Runs 12 quality dimensions over tabular files (missing values, duplicates, outliers, formats, types, and more), scoring each 0-100, assigning an A+ to F grade, and listing prioritized fixes |

## 11 — Testing & Qa

| Skill | Useful for |
|-------|-----------|
| `software-testing-guide` | Sets up a complete QA process for any software project based on Google testing standards and OWASP best practices: test strategy, AAA-pattern test cases, P0-P4 bug tracking, quality metrics/gates, daily/weekly reports, and third-party handoff docs |
| `test-suite-architect` | Designs the test suite architecture for a project and drives autonomous LLM-driven test execution: master prompts that auto-execute test cases, auto-track results, auto-file bugs, auto-generate reports, and auto-escalate P0s across multi-week plans |
| `auto-hypothesis-test` | Automatically picks and explains the right hypothesis test for your data — t-test, Welch's t, Mann-Whitney U, ANOVA, Kruskal-Wallis, chi-square, paired t-test, or Wilcoxon — based on group count, normality, and data type, with plain-language interpretations |
| `auto-stat-test` | Runs a complete hypothesis-testing analysis and produces a structured report — test statistic, p-value, effect size, group statistics, normality checks, selection rationale, and plain-language conclusions — exportable as JSON |
| `split-test-evaluator` | Full statistical analysis of A/B test data: conversion-rate differences and relative lift, two-proportion Z-test, chi-square cross-check, confidence intervals, power analysis, and minimum sample size — ending in a clear ship/don't-ship recommendation |
| `dataset-health-audit` | Audits tabular data (CSV/TSV/Excel/JSON) across 12 quality dimensions, scores each 0-100 plus an overall grade (A+ to F), and lists concrete issues with fix suggestions and a prioritized cleaning plan |
| `outlier-scan` | Scans numeric columns for anomalies using three methods — Z-score, IQR, and moving-average deviation — then classifies each anomaly as "explainable" or "needs attention" with the reasoning, plus per-column statistics |
| `regression-insight` | Builds linear (OLS) or logistic regression models on your tabular data and returns the full statistical picture — coefficients, R-squared, p-values, VIF multicollinearity checks, odds ratios — with plain-language interpretation of every number |
| `incident-review-guide` | Guides you through a six-step SRE incident review — overview and severity grading, minute-by-minute timeline, 5 Whys root cause analysis, SMART action items, lessons learned — and produces a professional blameless postmortem document |
| `cross-examine` | Interviews you relentlessly about a plan or design — one question at a time — walking every branch of the decision tree, resolving dependencies between decisions, and offering a recommended answer for each question until you reach a genuinely shared understanding |

## 12 — Personal Productivity

| Skill | Useful for |
|-------|-----------|
| `adhd-assistant` | ADHD-friendly external scaffolding for executive function: task breakdown into micro-steps, time-blindness support, prioritization, body doubling, dopamine menus, and warm emotional support — all evidence-based and non-judgmental |
| `adhd-daily-planner` | Structured ADHD-friendly planning rituals: morning check-ins that pick 1-3 realistic priorities and build a buffered time-block schedule, end-of-day shutdown reviews, and weekly retrospectives that tune your systems |
| `anki-card-maker` | Extracts key knowledge from your study materials (text, Markdown, notes) and generates front-question/back-answer flashcards, formatted as a CSV ready for direct import into Anki |
| `flashcard-studio` | A card-crafting studio for spaced repetition: intelligently distills study materials into well-designed flashcards — atomic questions, precise answers, topic tags, and coverage across definitions, formulas, causes, and comparisons — delivered as an Anki-ready CSV |
| `workload-calculator` | Estimates software project effort using three-point estimation (PERT), T-shirt sizing, or function point analysis — breaking work into packages, computing optimistic/most-likely/pessimistic hours, standard deviation, confidence intervals, and risk buffers |
| `email-manager` | Operates a real mailbox over IMAP/SMTP: checks unread mail, searches by sender/subject/date, fetches full messages, downloads attachments, marks read/unread, and sends plain-text or HTML mail with attachments |
| `email-to-calendar` | Extracts calendar events and action deadlines from emails, presents them for your confirmation, and creates calendar entries — with duplicate detection, day-of-week verification, deadline reminders, and undo support |
| `pro-email-composer` | Writes polished business emails for nine scenarios — reminder, follow-up, decline, thank-you, apology, notice, request, introduction, complaint — with tone auto-calibrated to the recipient (boss, peer, subordinate, client, vendor, stranger) and a pre-send checklist |
| `interview-simulator` | Simulates a real interviewer across behavioral, technical, and case interviews: 3-5 progressive follow-up questions (one at a time), then a structured evaluation — STAR diagnosis for behavioral, correctness/depth scoring for technical, framework assessment for case — with grades and improved sample answers |
| `cv-tailor` | Optimizes your resume for a specific job description in five phases: JD keyword match analysis with coverage scoring, STAR-method quantified rewriting of experience bullets, ATS compatibility check with a scorecard, and a final before/after optimized resume — with zero fabrication |

## 13 — Legal, Compliance & Saudi Regulations

| Skill | Useful for |
|-------|-----------|
| `saudi-income-advisor` | Analyzes Saudi salary certificates, payroll, GOSI records, and bank statements to identify the highest genuinely documentable income, then builds evidence plans, affordability scenarios, and bank complaint drafts under Saudi Central Bank (SAMA) rules |
| `technical-audit-report` | Produces plain, minimal, text-dense technical documents: audit reports with severity-ranked findings and fix checklists, research comparison guides with tables, and structured technical analysis with code snippets and ASCII architecture diagrams |
| `legal-contract-gen` | Collects key variables through interactive Q&A and generates structured first drafts of common legal documents: NDA, service agreement, privacy policy, or cooperation framework agreement |
| `legal-risk-analyzer` | Scores legal risks on a severity-by-likelihood matrix (1-25), assigns a GREEN/YELLOW/ORANGE/RED level, and recommends concrete actions — from accept-and-monitor up to immediate escalation and outside counsel |
| `legal-risk-assessment` | Documents legal risks formally using the severity-by-likelihood framework — producing structured risk assessment memos and risk register entries with mitigation options, residual risk, monitoring plans, and owners |
| `tos-clause-scanner` | Systematically audits Terms of Service, user agreements, and privacy policies from the consumer's standpoint across seven risk categories, producing a star-rated report with quoted clauses, plain-language analysis, and consumer action items |
| `tos-risk-checker` | A fast consumer-rights check of a Terms of Service, user agreement, or privacy policy: scans seven risk categories, rates severity/concealment/actionability per finding, and returns a compact risk verdict with prioritized actions |
| `compliance-review-planner` | Turns a described business scenario into a structured compliance checklist — applicable laws, check items with legal basis, high/medium/low risk levels, current status, and a P0-P3 remediation roadmap |
| `regulatory-audit-generator` | Generates a full regulatory audit for a business scenario: applicable-regulation mapping, a check-item table with legal citations and risk ratings, risk counts, and a prioritized remediation roadmap with plain-language explanations |
| `translation-craft` | Delivers professional bidirectional Chinese-English translation across academic, business, technical, and legal domains using the Faithfulness-Expressiveness-Elegance framework, with terminology tables and back-translation quality checks |

## 14 — E-Commerce, Store, Sales & Retention

| Skill | Useful for |
|-------|-----------|
| `ecom-copy-assistant` | Writes complete e-commerce product detail-page copy — title, key selling points, specification table, and FAQ — tailored to the style rules of Taobao, JD.com, and Amazon |
| `ecom-listing-copywriter` | Delivers a full, ready-to-upload listing package per platform — optimized title formula, 5 ranked FAB selling points, structured specification table, and platform-toned FAQ — with a compliance and quality scorecard |
| `pricing-advisor` | Designs and optimizes pricing systems — value metrics, three-tier packaging, price points, pricing pages, and price-increase campaigns — grounded in value-based pricing and conversion benchmarks |
| `churn-prevention` | Reduces voluntary churn (cancel flow, exit survey, reason-matched save offers, win-back emails) and involuntary churn (smart payment retries, card updater, dunning email sequences), with benchmarks and red-flag diagnostics |
| `retention-manager` | Runs the full customer-retention program: exit-intelligence surveys, a save-offer playbook with when/when-not rules, post-cancel reactivation and win-back sequences, payment-recovery systems, and a retention metrics dashboard |
| `saas-metrics-coach` | Takes raw revenue, customer, and cost numbers; computes ARR, MRR growth, churn, CAC, LTV, LTV:CAC, payback, NRR, and Quick Ratio; benchmarks against segment/stage standards; and delivers a prioritized SaaS Health Report |
| `ad-creative` | Generates platform-compliant ad creative at scale (headlines, descriptions, primary text) organized by persuasion angles, and iterates new variations from real performance data with a documented iteration log |
| `whatsapp-integration` | Operates WhatsApp through the Membrane CLI — sending text/media/template/interactive messages, managing contacts and business profile, reading chats — with Membrane handling all authentication |
| `customer-reply-craft` | Generates professional, warm customer-service replies for pre-sales, after-sales, complaints, and returns/exchanges — with first/follow-up/escalation scripts, a five-level emotion-soothing strategy, and forbidden-phrase replacements |
| `brand-name-forge` | Generates 8 brand name candidates — one per classic naming method (portmanteau, metaphor, onomatopoeia, acronym, foreign borrowing, eponym/toponym, coined word, wordplay) — each with meaning, rationale, and domain suggestions, plus a quality-checked top recommendation |

## 15 — Devices & Creative Media Lab

| Skill | Useful for |
|-------|-----------|
| `huawei-watch-designer-pro` | Turns any source artwork into a store-quality HUAWEI WATCH GT 6 Pro face across 5 layout archetypes (poster / cards / chips / hud / split) in 3 output modes, with automated QA gates that block known failure classes |
| `huawei-watch-skins` | A complete studio for designing and producing Huawei watch faces — from idea to an installable .hwt — including a catalog of 10 ready skins with image-generation prompts, a guide to 40+ supporting tools, official technical specs, and a background-prep script |
| `huawei-h1` | The comprehensive verification and QA companion to the watch-face design skill — a documented fact registry for the GT 6 Pro with confidence levels, a full test suite (specs, visual, AOD, hallucination, pre-publish), and an automated output checker |
| `excellence-engine` | Drives any deliverable to a 9.9/10 standard through requirement discovery, domain quality bars, evidence-based rubric scoring, and iterative revision before anything is delivered |
| `edge-tts` | Converts text to high-quality spoken audio using Microsoft Edge's neural TTS via the node-edge-tts package — multiple voices and languages, adjustable rate/pitch/volume, and subtitle generation |
| `speech-synthesis` | Converts text into high-quality speech supporting multiple languages and voice profiles, with adjustable rate, pitch, and volume, subtitle generation, and MP3 output — ideal for reading articles aloud or producing voiceovers for videos and presentations |
| `retro-tech-illustration` | Creates retro tech art style visual content — images, illustrations, and design documents — covering Synthwave, Vaporwave, Cyberpunk, retro comics, and retro-futuristic aesthetics |
| `photo-magazine` | Creates premium landscape documents with magazine-quality editorial design — bold typography, full-bleed photography, data visualization cards, and narrative layouts blending storytelling with data |
| `fashion-sketch` | Creates professional apparel technical specification packages (tech packs) with collection overviews, style specs, construction details, measurement charts, fabric libraries, bills of materials, quality standards, and sign-off pages |
| `journalistic-portrait` | Creates magazine-style HTML pages replicating the visual design of a Southern People Weekly–style Chinese weekly magazine — cover pages with red border frames, table-of-contents pages with portrait photography, and dual-column inner pages with editorial section headers |

✅ END OF CHEAT SHEET — 15 themes, 150 skills, 45 platform files.
