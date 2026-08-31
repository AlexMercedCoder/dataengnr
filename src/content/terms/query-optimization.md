---
title: "Query Optimization"
description: "Query optimization in data lakehouses covers the techniques that reduce query execution time and resource usage through predicate pushdown, partition pruning, column pruning, join ordering, and pre-computed materialization."
date: 2026-05-17
tags: ["Query Optimization", "Dremio", "Apache Iceberg", "Performance", "Data Engineering"]
---

## The Art of Computing Less

A query's execution time is fundamentally determined by how much data must be processed. A query that reads 1TB of data to answer a question that could have been answered by reading 10GB is wasting 99% of its compute. Query optimization is the discipline of transforming a logical query (what the user asked for) into an efficient physical execution plan (how the engine will answer it) that processes the minimum necessary data.

Query optimization in lakehouses operates at multiple levels: at the metadata level (avoiding reading data files whose content cannot contribute to the result), at the file level (avoiding reading entire files when only some rows or columns are needed), and at the query plan level (reordering joins and operations to minimize intermediate result sizes).

## [Predicate Pushdown](/terms/predicate-pushdown)

Predicate pushdown moves filter conditions (WHERE clause predicates) as close to the data source as possible in the query plan, reducing the amount of data that flows through subsequent operators. Without predicate pushdown, a query `SELECT * FROM events WHERE region = 'US-WEST' AND date > '2024-01-01'` would scan all events data, apply filters in memory, then return results. With predicate pushdown, the filter is pushed to the file scan: only files that can contain rows matching the filter are read.

In Iceberg, predicate pushdown operates at three levels: **partition pruning** (skipping entire partitions that cannot match the predicate), **file-level statistics** (skipping files whose manifest metadata reports min/max values incompatible with the predicate), and **row group statistics** (skipping Parquet row groups whose column statistics cannot contain matching values). This three-level pushdown can reduce data scanned by 99%+ for selective queries on well-organized tables.

## Column Pruning (Projection Pushdown)

Column pruning ensures that only the columns actually needed by the query are read from the data files. A query `SELECT event_date, user_id, revenue FROM sales_events` does not need to read the 40 other columns in the sales_events table. The query engine pushes the column projection down to the file scan, reading only the three needed columns from the Parquet file's columnar format.

For wide tables with many columns, column pruning can reduce data read by 10-20x compared to reading all columns. Parquet's columnar format makes column pruning efficient: each column's data is stored separately and can be read independently, so skipping unneeded columns is simply a matter of not reading those column chunks.

## Join Ordering and Cost-Based Optimization

For queries joining multiple tables, the order in which joins are performed dramatically affects performance. A join between a billion-row fact table and a 100-row lookup table should filter the fact table first using the lookup values, not join all billion rows before filtering. A [cost-based optimizer](/terms/cost-based-optimizer) (CBO) uses table statistics (row counts, column cardinality, value distributions) to estimate the cost of different join orders and select the most efficient plan.

[Dremio](/terms/dremio)'s adaptive query optimizer collects table and column statistics from Iceberg table metadata and query execution history to build accurate cost models for join ordering decisions. Dremio also supports adaptive execution: the query plan can be revised mid-execution based on observed intermediate result sizes, correcting for cases where statistics-based estimates are inaccurate.

## Dremio Data Reflections for Query Acceleration

For repeated queries against large tables, pre-computed materializations (Dremio Data Reflections) eliminate the need to scan and aggregate raw Iceberg data on every query. An Aggregation Reflection pre-computes common group-by patterns; a Raw Reflection pre-filters and projects a subset of the raw data. Dremio's [query planner](/terms/query-planner) transparently rewrites incoming queries to use the most beneficial reflection, providing sub-second query performance without query changes.

## Learn More

Several of the [books by Alex Merced](/books) cover this in depth, and a few of them are free. The rest of the [knowledge base](/terms) is worth a look too.
