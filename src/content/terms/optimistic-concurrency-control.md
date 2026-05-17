---
title: "Optimistic Concurrency Control"
description: "A guide to Optimistic Concurrency Control (OCC) in Apache Iceberg, the conflict detection strategy that enables high-throughput parallel writes to the same table without distributed locking, detecting and resolving conflicts at commit time."
date: 2026-05-17
tags: ["Optimistic Concurrency Control", "Apache Iceberg", "ACID", "Concurrency", "Data Engineering"]
---

# Locks Are Expensive

Pessimistic concurrency control - the approach used by most relational databases - acquires locks before modifying data. A writer acquires a write lock on the table (or rows), performs its modifications, then releases the lock. While the write lock is held, no other writer can modify the table. This prevents conflicts but serializes all writes, making it impossible to scale write throughput by adding more concurrent writers.

In distributed data systems processing high-volume event streams, serialized writes through a locking mechanism become a catastrophic bottleneck. A Flink job processing 1 million events per second needs to write to an Iceberg table continuously; waiting to acquire a write lock before each micro-batch write would reduce throughput to whatever rate the lock manager can grant locks.

Optimistic Concurrency Control (OCC) takes a different approach: allow multiple writers to proceed simultaneously without locking, detect conflicts at commit time, and retry or fail conflicting commits. OCC is "optimistic" because it assumes that conflicts between concurrent writers will be rare - most of the time, concurrent writers are modifying different parts of the data, and conflicts are only detected occasionally.

## OCC in Apache Iceberg

Apache Iceberg implements Optimistic Concurrency Control through its atomic metadata swap mechanism. Each write operation proceeds in three phases:

**1. Read the current table state**: The writer reads the current metadata file pointer from the catalog (e.g., from the Hive Metastore or REST Catalog) to get the current snapshot.

**2. Prepare the new snapshot**: The writer creates new data files, builds new manifest and metadata files reflecting the new state of the table (the current snapshot plus the new changes), and writes these files to object storage. The writer does not yet update the catalog pointer.

**3. Atomic commit**: The writer attempts to atomically update the catalog's metadata pointer from the version it read in step 1 to the new metadata file. This is a conditional atomic operation: "Update the pointer IF AND ONLY IF it still points to the version I read in step 1."

If the catalog pointer has not changed since step 1 (no other writer committed between steps 1 and 3), the commit succeeds atomically. If another writer committed between steps 1 and 3 (the catalog pointer changed), the commit fails with a conflict. The failed writer reads the new current state, evaluates whether its changes are still valid (conflict resolution), rewrites its metadata to apply its changes on top of the new state, and retries the commit.

![Optimistic Concurrency Control](/images/terms/occ_iceberg.png)

## Conflict Resolution

When an OCC commit conflict is detected, the Iceberg writer applies conflict resolution logic to determine whether the conflict is resolvable or irresolvable.

**Non-conflicting concurrent writes**: Two Spark jobs writing to different partitions of the same Iceberg table have non-conflicting changes. Even if both jobs started from the same snapshot and both attempted to commit simultaneously, Iceberg can resolve the conflict by applying both sets of changes: the second writer reads the first writer's commit, sees that it modified different partitions, and rebases its commit on top of the first writer's commit, then retries. Both commits succeed.

**Conflicting concurrent writes**: If two writers both attempt to overwrite the same partition (complete partition overwrite), their changes conflict: both cannot succeed, as the second overwrite would eliminate the first's changes. In this case, Iceberg fails the second commit and requires the writer to decide how to handle the conflict (typically by retrying from scratch after reading the new state).

**Append-only conflicts**: Pure append operations (inserting new rows, creating new data files) almost never conflict in Iceberg, because appending new files does not modify existing files. Multiple Flink streaming jobs can write simultaneously to the same Iceberg table using append operations with high throughput and very low conflict rates.

The OCC model enables Apache Iceberg to support high-throughput concurrent writes from multiple engines (multiple Flink jobs, a Spark job and a Flink job) simultaneously against the same table, without the distributed locking overhead that would serialize all writes.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
