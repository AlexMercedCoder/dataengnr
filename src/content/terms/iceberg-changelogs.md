---
title: "Iceberg Changelogs"
description: "A guide to Iceberg changelogs, the feature that exposes the precise row-level inserts, updates, and deletes between two snapshots, enabling incremental processing pipelines and downstream system synchronization."
date: 2026-05-17
tags: ["Iceberg Changelogs", "Apache Iceberg", "Change Data Capture", "Data Engineering", "Incremental Processing"]
---

# Reading Only What Changed

A core challenge in data pipeline architecture is efficiency: when a source table changes, how do downstream tables derived from it get updated? The naive approach is a full recalculation: read the entire source table, recompute the aggregations, and overwrite the entire destination table. This is simple but computationally wasteful, scaling poorly as tables grow to terabytes or petabytes.

[Incremental processing](/terms/incremental-processing) is the efficient alternative: process only the data that changed since the last pipeline run, and apply those changes to the destination table. To do this, the pipeline needs a reliable way to ask the source table: "What exactly changed between yesterday's snapshot and today's snapshot?"

[Apache Iceberg](/terms/apache-iceberg)'s Changelog capability (often consumed via the `IcebergSource` in Flink or the `readChangeStream` API in Spark) provides this exact mechanism. It exposes the delta between two snapshots as a stream of row-level change events: INSERTs, UPDATE_BEFOREs, UPDATE_AFTERs, and DELETEs.

## How Iceberg Changelogs Work

Because Iceberg tracks all data files, position delete files, and equality delete files associated with every snapshot, it can compute the precise difference between any two snapshots by analyzing the metadata. 

When a pipeline requests the changelog between Snapshot A and Snapshot B, Iceberg does not need to scan the actual data files to find differences. It examines the manifest files for both snapshots, identifies the files that were added and the delete files that were written, and constructs a logical stream of changes.

For example, if an Iceberg `MERGE INTO` operation updated a customer's address, the changelog will output two records for that customer:
1. `UPDATE_BEFORE`: The old address record (marked as deleted by the MERGE).
2. `UPDATE_AFTER`: The new address record (inserted by the MERGE).

This stream of changes looks conceptually identical to a database CDC (Change Data Capture) stream from Debezium, but it is generated entirely from Iceberg's metadata and immutable Parquet files on [object storage](/terms/object-storage).

![Iceberg Changelogs Architecture](/images/terms/iceberg_changelogs.png)

## Use Cases for Changelogs

**Incremental [Materialized Views](/terms/materialized-views)**: [Dremio](/terms/dremio) and other query engines use Iceberg changelogs to incrementally refresh Data Reflections or materialized views. Instead of recomputing an aggregation reflection over a billion rows, the engine reads the changelog for the 10,000 rows modified since the last refresh, subtracts the deleted values from the aggregate, adds the inserted values, and updates the reflection in seconds.

**Lakehouse to Operational Database Sync ([Reverse ETL](/terms/reverse-etl))**: A pipeline that syncs computed customer scores from an Iceberg table to a production PostgreSQL database or Salesforce CRM can use the Iceberg changelog to send only the scores that changed today, dramatically reducing load on the operational database APIs.

**Audit and History Tables**: Organizations that require complete historical tracking of all changes to a table (SCD Type 4) can build an append-only history table by continuously consuming the changelog of the primary table and writing every INSERT, UPDATE, and DELETE event to the history table, preserving the full audit trail of who changed what, and when.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
