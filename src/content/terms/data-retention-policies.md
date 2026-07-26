---
title: "Data Retention Policies"
description: "A guide to data retention policies in lakehouses, the governance rules that define how long different categories of data are stored, when data is deleted or archived, and how Apache Iceberg's snapshot expiration supports automated retention enforcement."
date: 2026-05-17
tags: ["Data Retention", "Data Governance", "Apache Iceberg", "Compliance", "Data Engineering"]
---

## Keeping Data Costs and Compliance in Balance

Data that is no longer needed has a cost: storage costs accumulate, metadata management overhead grows, and compliance exposure increases when regulated data is retained longer than required. A GDPR-regulated organization that retains EU citizen personal data indefinitely cannot comply with the regulation's data minimization principle (Article 5(1)(e)), which requires that personal data be "kept in a form which permits identification of data subjects for no longer than is necessary for the purposes for which the personal data are processed."

Data retention policies define the rules for how long data must be retained (to meet operational, legal, and regulatory requirements) and when it must be deleted or archived (to control costs and comply with data minimization requirements). Different data categories have different retention requirements: financial transaction records may need to be retained for seven years for tax compliance, while user session logs may only need to be retained for 90 days.

Implementing retention policies in traditional data warehouses (updating rows in tables) is straightforward but slow at scale. Implementing retention policies in a [data lake](/terms/data-lake) (deleting specific files from [object storage](/terms/object-storage)) requires careful coordination with the table format's metadata to avoid leaving orphaned references.

## Iceberg [Snapshot Expiration](/terms/snapshot-expiration)

[Apache Iceberg](/terms/apache-iceberg) provides built-in snapshot expiration that is the primary mechanism for enforcing time-based retention policies. Each Iceberg snapshot records all the data files that were part of the table at that point in time. When a snapshot is expired (removed from the snapshot timeline), any data files that were exclusively referenced by that snapshot (not referenced by any retained snapshot) are marked for deletion.

The Iceberg `expire_snapshots` procedure accepts a minimum snapshot age or a minimum number of snapshots to retain, and removes all snapshots that fall outside these parameters. Expired snapshots' orphaned data files are either deleted immediately (if the delete function is configured) or marked for cleanup by a subsequent orphan file deletion step.

For retention policy enforcement, `expire_snapshots` is scheduled to run regularly (daily or weekly), configured with a retention cutoff that matches the policy:

```sql
CALL catalog.system.expire_snapshots(
  table => 'db.transactions',
  older_than => TIMESTAMP '2023-01-01 00:00:00',
  retain_last => 10
);
```

This removes all snapshots older than January 1, 2023, retaining at least the 10 most recent snapshots regardless of age.

![Data Retention Architecture](/images/terms/data_retention.png)

## Row-Level Retention

Snapshot expiration handles table-level retention (removing entire snapshots of the table after a time threshold). For row-level retention (removing specific rows that are older than a threshold while retaining the rest of the table), a different approach is needed.

Row-level retention uses the Iceberg `MERGE INTO` or `DELETE FROM` operation to remove rows matching the retention condition: `DELETE FROM db.user_events WHERE event_date < CURRENT_DATE - INTERVAL '90' DAY`. This creates a new Iceberg snapshot with delete files recording the deleted row positions. The actual data file space is reclaimed when the snapshot is compacted (rewriting files to remove the delete-marked rows) and the old snapshot is expired.

For GDPR right-to-erasure compliance, row-level deletion via Iceberg's delete mechanism provides the compliant deletion path: specific rows (identified by a data subject's personal identifier) are deleted, and the deletion is propagated through all retained snapshots through a targeted snapshot cleanup process.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
