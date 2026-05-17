---
title: "Trino"
description: "A guide to Trino (formerly PrestoSQL), the distributed SQL query engine that enables federated analytics across multiple heterogeneous data sources through a single ANSI SQL interface."
date: 2026-05-17
tags: ["Trino", "Federated Query", "SQL", "Data Engineering", "Analytics"]
---

# Federated SQL at Scale

Trino (formerly known as PrestoSQL until the rename in 2021) is an open-source distributed SQL query engine originally developed at Facebook in 2012 to address the company's need for interactive analytical queries across petabytes of data stored in multiple heterogeneous systems. Facebook needed to query data stored in Hive on HDFS, data in MySQL operational databases, data in Cassandra, and data in other proprietary systems through a single SQL interface without moving the data into a central warehouse first.

Trino's architecture separates query parsing, planning, and coordination (handled by the Trino coordinator) from query execution (handled by distributed Trino worker nodes). The coordinator receives a SQL query, plans an optimized distributed execution strategy, and distributes execution tasks to worker nodes. Worker nodes execute their assigned tasks in parallel, reading data from the relevant source systems through Trino's connector framework, performing local computation, and returning results to the coordinator for final assembly.

This architecture enables Trino to function as a universal SQL interface across dozens of different data sources simultaneously. A single Trino query can join data from an Iceberg table in S3, a live MySQL operational database, a Kafka topic, and an Elasticsearch index, with Trino's distributed engine handling the cross-system join logic transparently.

## Trino's Connector Architecture

Trino's connector API is the mechanism that enables federated querying. Each connector implements a set of interfaces that tell Trino how to discover available tables, read table schema, split the table's data into parallel-readable chunks (splits), and read data records from those splits. Connectors exist for Apache Iceberg (Hive and REST catalogs), Delta Lake, Hudi, Hive, PostgreSQL, MySQL, Cassandra, Kafka, Elasticsearch, BigQuery, and many other systems.

The Iceberg connector for Trino provides native support for Iceberg's ACID semantics, schema evolution, hidden partitioning, and time travel. Trino can execute Iceberg MERGE INTO, DELETE, and UPDATE statements, read from any historical Snapshot using FOR VERSION AS OF or FOR TIMESTAMP AS OF syntax, and automatically benefit from Iceberg's partition pruning and file-level statistics without any user-side awareness of the Iceberg metadata structure.

When multiple connectors are configured simultaneously, Trino enables cross-catalog joins. An analyst can write a single SQL query that joins a customer dimension table from the Iceberg catalog with a real-time customer activity table from MySQL and a product recommendation table from an Elasticsearch index, and Trino will plan and execute the join efficiently across all three systems.

![Trino Federated Query Architecture](/images/terms/trino_federated_architecture.png)

## Trino vs. Dremio: Complementary Approaches

Trino and Dremio occupy overlapping but distinct positions in the lakehouse query landscape. Both provide distributed SQL query execution against Iceberg and other data sources. The key architectural distinctions are in their optimization strategies and governance models.

Trino excels at federated ad-hoc queries across many heterogeneous systems simultaneously, with its connector model providing the broadest source compatibility of any query engine in the ecosystem. Trino's query optimizer is highly capable and continues to improve, but it does not implement a query acceleration layer equivalent to Dremio's Data Reflections.

Dremio's Data Reflections provide transparent query acceleration through pre-computed materializations that can deliver sub-second query performance for BI workloads. Dremio's Semantic Layer provides a governed, business-friendly abstraction layer for analytical consumers that Trino does not natively provide. For governed BI and data science access where performance predictability and access control are critical, Dremio's architecture provides distinct advantages.

Many enterprise lakehouses deploy both: Trino for exploratory data engineering queries across many systems, and Dremio as the governed performance layer for production BI workloads on top of the Iceberg lakehouse.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
