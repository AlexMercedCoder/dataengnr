---
title: "Apache Iceberg"
description: "Apache Iceberg is an open table format for huge analytic datasets. It adds tables to compute engines like Spark, Trino, PrestoDB, Flink, and Hive using a high-performance format that works just like a SQL table."
date: 2026-05-17
tags: ["Table Formats", "Data Lakehouse", "Open Source"]
---

Apache Iceberg is an open table format for huge analytic datasets. It was originally created by Netflix to solve the limitations of the Apache Hive layout and is now a top-level Apache Software Foundation project.

## Key Features

1. **Schema Evolution**: Iceberg supports schema evolution without rewriting data files.
2. **Hidden Partitioning**: Partitioning is managed by Iceberg, not the user, preventing full table scans.
3. **Time Travel**: You can query a table exactly as it existed at a past point in time.

## Architecture

The Iceberg architecture consists of three layers:
- The Iceberg Catalog
- The Metadata Layer (metadata.json, manifest lists, manifest files)
- The Data Layer (Parquet, ORC, or Avro files)
