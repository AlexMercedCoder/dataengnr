---
title: "Optimistic Concurrency Control (OCC)"
description: "A guide to Optimistic Concurrency Control in Apache Iceberg and modern data lakehouses, the mechanism that enables safe concurrent writes without distributed locks by detecting conflicts at commit time."
date: 2026-05-17
tags: ["Apache Iceberg", "Concurrency", "ACID", "Data Lakehouse"]
---

# Concurrency Without Locks

When multiple processes attempt to write to the same data store simultaneously, the system must prevent them from corrupting each other's work. Traditional relational databases handle this through pessimistic locking: before a transaction reads or writes data, it acquires a lock that prevents other transactions from accessing the same rows. While effective, pessimistic locking creates severe throughput bottlenecks when many concurrent writers compete for the same locks, and it is impractical in distributed systems where obtaining a distributed lock across multiple nodes requires expensive network coordination.

Object storage services like Amazon S3 do not support distributed locks at all. S3's consistency model provides strongly consistent PUT and GET operations for individual objects, but there is no native mechanism for atomic multi-object transactions or distributed locking across writers. This means that any transactional guarantees for data stored in S3-backed lakehouses must be implemented entirely in the metadata layer above the storage.

Apache Iceberg uses Optimistic Concurrency Control (OCC) to achieve ACID-compliant concurrent writes on top of object storage without requiring distributed locks. OCC's core insight is that most write operations in analytical workloads do not actually conflict with each other. If Writer A is updating records in the March partition while Writer B is inserting records into the April partition, they are completely independent operations with no possibility of interference. OCC allows both writers to proceed concurrently without blocking each other, checking only at commit time whether their changes actually conflict.

## How OCC Works in Iceberg

The OCC workflow in Apache Iceberg follows a three-phase pattern: read, write, and commit.

**Read Phase**: The writer reads the current table state by reading the current metadata file and identifying the current Snapshot. The writer records the Snapshot ID it is working against.

**Write Phase**: The writer performs its data work, writing new Parquet data files to object storage. This write phase is completely independent of any other concurrent writers. Multiple writers can be in this phase simultaneously, all reading and writing their respective files without any coordination.

**Commit Phase**: The writer attempts to commit by writing a new metadata file that references both the new data files it produced and the Snapshot it read in the read phase. This commit attempt uses a conditional write operation. In practice, Iceberg uses the catalog (Hive Metastore, AWS Glue, or a REST catalog like Apache Polaris) to perform an atomic compare-and-swap: the new metadata file is only accepted if the current table Snapshot still matches the Snapshot the writer read in the read phase. If another writer committed in the interim (changing the current Snapshot), the compare-and-swap fails.

When a commit fails due to a concurrent modification, the writer does not give up immediately. Iceberg implements retry logic with conflict analysis. The writer re-reads the new current Snapshot, determines whether its changes are compatible with the intervening commit (do the newly committed files overlap with the partition range this writer was modifying?), and if there is no actual conflict, automatically rebases its commit against the new Snapshot and retries. Only if the retry analysis reveals a genuine conflict (both writers modified the same data files) does the retry fail permanently, requiring the application to resolve the conflict explicitly.

![OCC Concurrent Write Flow](/images/terms/occ_concurrent_writes.png)

## Conflict Analysis and Isolation Levels

Iceberg's conflict analysis during retry is nuanced and supports different isolation levels.

**Serializable Isolation**: The strongest isolation level. A write fails if any other write committed to the same table since the read phase, regardless of whether the committed data physically overlaps. This level guarantees complete serializability but produces the most retries in high-concurrency environments.

**Snapshot Isolation**: Iceberg's default. A write succeeds on retry if the intervening commits do not modify the same data files that the current writer modified. Two writers updating different date partitions of the same table can both commit successfully under snapshot isolation, even though they ran concurrently. This level provides practical, high-throughput concurrent writes while still preventing the data corruption that would result from two writers modifying the same files simultaneously.

The partition-based conflict detection under snapshot isolation aligns naturally with the Medallion Architecture pattern of ingesting data into distinct time-partitioned batches. Multiple ingestion jobs writing to different daily partitions of the same Bronze or Silver Iceberg table can all run concurrently under snapshot isolation without coordination overhead.

## OCC in the Broader Lakehouse Context

Delta Lake implements a similar OCC mechanism through its transaction log: a commit is accepted only if the transaction log version the writer read is still the current version. If another commit advanced the log, Delta Lake's conflict checker analyzes whether the concurrent commit touched the same data files, applying retry logic analogous to Iceberg's.

Dremio's write operations against Iceberg tables, including Data Reflection refreshes and MERGE INTO operations executed through the Semantic Layer, all use Iceberg's OCC mechanism. When Dremio runs a large Reflection refresh concurrently with an ongoing streaming ingestion job writing to the same table, the OCC layer ensures both operations complete correctly without data corruption, automatically retrying any commits that encounter benign concurrent modifications.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
