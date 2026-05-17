---
title: "Iceberg Table Tags"
description: "A guide to Apache Iceberg table tags, the immutable named references to specific snapshots that enable point-in-time data access, release marking, audit checkpoints, and regulatory compliance snapshots in the lakehouse."
date: 2026-05-17
tags: ["Iceberg Tags", "Apache Iceberg", "Data Versioning", "Data Governance", "Data Engineering"]
---

# Named Checkpoints in the Snapshot Timeline

Apache Iceberg's snapshot timeline records every commit to a table as a new snapshot with a unique snapshot ID and timestamp. Time travel queries can access any snapshot by ID or timestamp: `SELECT * FROM table FOR VERSION AS OF 1234567890` or `SELECT * FROM table FOR TIMESTAMP AS OF '2024-01-01'`. But snapshot IDs are opaque integers and timestamps are imprecise references to a point in time that may correspond to multiple snapshots within the same second.

Table tags are named, immutable references to specific snapshots, similar to Git tags that mark a specific commit with a meaningful name. A tag named `end_of_q1_2024` points to the snapshot that represented the complete state of the table at the close of Q1 2024. A tag named `before_schema_migration` marks the last snapshot before a schema change was applied. A tag named `gdpr_audit_2024_05` marks the snapshot used for a GDPR compliance audit.

Unlike branches (which are mutable and advance with new commits), tags are immutable once created. A tag always points to the same snapshot it was created with, providing a stable, named reference for point-in-time access that survives snapshot expiration and catalog operations.

## Creating and Using Tags

Tags are created with the `ALTER TABLE ... CREATE TAG` DDL:

```sql
-- Create a tag at the current snapshot
ALTER TABLE catalog.db.sales_data CREATE TAG end_of_q1_2024;

-- Create a tag at a specific historical snapshot
ALTER TABLE catalog.db.sales_data CREATE TAG before_migration 
  AS OF VERSION 9876543210;

-- Create a tag with a retention policy
ALTER TABLE catalog.db.sales_data CREATE TAG q1_audit
  RETAIN 365 DAYS;
```

Reading a snapshot via tag: `SELECT * FROM catalog.db.sales_data FOR VERSION AS OF 'end_of_q1_2024'`. This is significantly more readable and intent-communicating than `FOR VERSION AS OF 9876543210`.

Tags can be configured with a retention policy independent of the table's default snapshot retention. An audit tag that must be retained for 7 years (for regulatory compliance) can be given a `RETAIN 2555 DAYS` retention policy, ensuring that the tagged snapshot and its data files are not cleaned up by the regular snapshot expiration process even after the default retention window has elapsed.

![Iceberg Tags Architecture](/images/terms/iceberg_tags.png)

## Use Cases for Iceberg Tags

**Quarterly close snapshots**: At the close of each fiscal quarter, a tag is created on financial fact tables: `end_of_q1_2024`, `end_of_q2_2024`. Finance teams can always query the exact data state that was used for quarterly reporting, even after many subsequent data loads have added more records. This supports the auditability requirement that reported numbers can be reproduced exactly.

**Pre-migration checkpoints**: Before applying a schema migration or data transformation to a large table, a tag is created: `before_product_category_migration`. If the migration produces incorrect results, rolling back to the tagged snapshot is trivial: `ALTER TABLE ... ROLLBACK TO TAG before_product_category_migration`.

**Regulatory compliance snapshots**: FINRA, GDPR, HIPAA, and other regulatory frameworks require that data used in compliance reporting be reproducible on demand. Tags provide the stable, named references that compliance teams can use to retrieve the exact data state submitted in regulatory filings.

**CI/CD data testing environments**: In data pipeline CI/CD workflows, test data environments are created by branching from a tagged "golden dataset" snapshot: `CREATE BRANCH test_env FROM TAG golden_dataset_v3`. Tests run against the branch, and the branch is discarded after testing, leaving the golden dataset tag intact for the next test run.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
