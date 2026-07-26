---
title: "Trino"
description: "A guide to Trino (formerly PrestoSQL), the open-source distributed SQL query engine designed for fast interactive analytics across multiple data sources including Iceberg lakehouses, relational databases, and object storage."
date: 2026-05-17
tags: ["Trino", "SQL Query Engine", "Distributed SQL", "Apache Iceberg", "Data Engineering"]
---

## Distributed SQL Without a [Data Warehouse](/terms/data-warehouse)

Trino (formerly known as PrestoSQL, then PrestoSQL, renamed Trino in 2021) is an open-source distributed SQL query engine developed at Facebook in 2012 and now maintained by the Trino Software Foundation. Trino was designed for one specific purpose: execute SQL queries fast across data stored in external systems, without moving the data into a centralized warehouse.

Trino's "query-in-place" architecture connects to data sources through a connector plugin system. A Trino connector translates Trino's distributed query execution against an external system's native API. The Iceberg connector reads Iceberg table metadata from any Iceberg catalog (Hive Metastore, Glue, Nessie, REST Catalog) and executes distributed scan tasks against the Parquet data files in [object storage](/terms/object-storage). The PostgreSQL connector pushes SQL operations to a PostgreSQL database through JDBC. The Kafka connector reads event streams from Kafka topics. Queries joining an Iceberg table with a PostgreSQL table and a Kafka topic are executed in a single SQL statement through Trino's connector-agnostic query planning.

## Trino's Execution Architecture

Trino uses a coordinator-worker architecture. The coordinator receives SQL queries, parses them, plans the distributed execution, and assigns tasks to worker nodes. Worker nodes execute the distributed scan, filter, join, and aggregation tasks, exchanging data through Trino's in-memory shuffle mechanism. Results are streamed back to the coordinator and returned to the client.

Trino's execution is entirely in-memory: data is not written to disk during query execution, eliminating the disk I/O overhead that MapReduce-based systems (early Hive) suffered. Trino uses a pipelined execution model where operators within a stage execute concurrently, enabling high CPU utilization and low query latency for interactive analytics.

For Iceberg queries, Trino's Iceberg connector performs aggressive optimization: pushing predicate filters to the manifest scan level (skipping manifests that cannot contain matching rows), applying column statistics from Parquet row group statistics, and parallelizing data file reads across all available worker nodes. A Trino query against a terabyte Iceberg table typically completes in seconds to minutes on a properly sized cluster.

![Trino Architecture](/images/terms/trino_architecture.png)

## Trino vs. [Dremio](/terms/dremio) and Spark

Trino, Dremio, and Spark occupy different niches in the lakehouse query engine ecosystem.

**Trino** excels at interactive SQL analytics with low query latency and wide connector support. Its open-source self-managed deployment model gives engineering teams full control. Starburst (the commercial Trino distribution) adds enterprise features like RBAC, [data products](/terms/data-products), and managed cloud deployment.

**Dremio** excels at governed, business-facing analytics with its [Semantic Layer](/terms/semantic-layer) (Virtual Datasets, [column masking](/terms/column-masking), [row-level security](/terms/row-level-security)), Data Reflections (transparent query acceleration), and [Arrow Flight](/terms/arrow-flight) high-performance data delivery. Dremio provides a managed SaaS experience with significantly less operational overhead than self-managed Trino, and its native Iceberg integration is more deeply optimized (Arctic catalog, WAP workflow support, reflection-based acceleration).

**[Apache Spark](/terms/apache-spark)** excels at batch data transformation pipelines, ML workloads, and complex multi-step ETL operations. Spark is not primarily an interactive query engine but a general distributed computation platform.

For organizations that want a self-managed, open-source SQL engine for Iceberg queries, Trino is a strong choice. For organizations that want enterprise governance, semantic modeling, and managed cloud deployment, Dremio is the stronger choice.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
