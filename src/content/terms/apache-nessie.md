---
title: "Apache Nessie"
description: "A guide to Project Nessie, the open-source transactional catalog for Apache Iceberg that provides Git-like branching and versioning semantics at the catalog level, enabling multi-table atomic transactions and full catalog history."
date: 2026-05-17
tags: ["Apache Nessie", "Catalog", "Apache Iceberg", "Data Versioning", "Data Engineering"]
---

## Git for the Entire Catalog

[Apache Iceberg](/terms/apache-iceberg)'s snapshot model provides table-level version history: each table has its own independent timeline of snapshots. A catalog using standard Iceberg table semantics tracks each table's current metadata pointer independently. There is no built-in mechanism for atomically updating multiple tables' current pointers simultaneously, and there is no catalog-level branch that isolates writes across all tables from reads against the main catalog view.

[Project Nessie](/terms/project-nessie) (developed by [Dremio](/terms/dremio) and donated to the open-source community as a standalone project) addresses these limitations by implementing a Git-like versioning model for the entire catalog. In Nessie, the catalog state is a tree of commits, where each commit records the complete state of all tables in the catalog at a specific point in time. Named branches and tags are references to specific commits, just as Git branches and tags point to commits in the code repository.

This catalog-level version history enables capabilities that table-level snapshots cannot provide: multi-table atomic transactions (a single Nessie commit updates multiple tables' metadata pointers atomically), catalog-level branches (all tables in the catalog can be branched and evolved independently without affecting the main branch), and catalog rollback (the entire catalog state can be rolled back to any historical commit).

## Nessie's Data Model

A Nessie catalog maintains a commit log where each commit contains: a reference to the parent commit, a timestamp, a commit message, and the complete set of content key changes (table metadata pointer updates) made in this commit. Reading the catalog state at any point in time means traversing the commit log to the target commit and reading the table metadata pointers recorded there.

Named branches in Nessie are mutable references to commits that advance with each new commit on the branch. Named tags are immutable references that point to a specific historical commit permanently. The default branch (typically named `main`) is the production catalog state that all engines read by default.

[Multi-table transactions](/terms/multi-table-transactions) in Nessie work by accumulating multiple table metadata updates in memory, then committing them all as a single Nessie commit. Either all the updates commit atomically, or none do. This provides cross-table consistency without distributed locking.

![Apache Nessie Architecture](/images/terms/nessie_architecture.png)

## Nessie Use Cases

**Catalog-level branching for development**: A data engineering team working on a new pipeline creates a Nessie branch from main, creates new tables, modifies existing table schemas, and runs the pipeline against the branch. The entire environment (all tables, all schemas) is isolated from production. After validation, the branch is merged to main, atomically applying all the new table and schema changes.

**Catalog rollback for disaster recovery**: If a pipeline bug corrupts multiple production tables, the entire catalog can be rolled back to the last known-good Nessie commit, atomically restoring all affected tables' metadata pointers to their pre-bug state. Individual table rollback (using Iceberg's `CALL rollback_to_snapshot`) is also still available.

**Audit trail**: The Nessie commit log provides a complete, immutable audit trail of every table creation, modification, and deletion in the catalog, with timestamps and commit messages, enabling compliance with [data governance](/terms/data-governance) requirements for catalog change tracking.

Dremio integrates natively with Project Nessie through its Arctic catalog (a managed Nessie service), providing Nessie's catalog branching capabilities with Dremio's governed query execution and [Semantic Layer](/terms/semantic-layer).

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
