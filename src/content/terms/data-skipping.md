---
title: "Data Skipping"
description: "A guide to data skipping in Apache Iceberg and modern query engines, the collection of techniques including partition pruning, file-level statistics, row group statistics, and Bloom filters that minimize the data scanned to answer analytical queries."
date: 2026-05-17
tags: ["Data Skipping", "Apache Iceberg", "Query Optimization", "Parquet", "Data Engineering"]
---

# Reading Less Is Always Faster

The single most effective query optimization technique is reducing the amount of data read. A query that needs to read 1GB of data to produce its result is inherently faster than a query that reads 100GB, regardless of how fast the processing engine is. Data skipping - the collection of techniques that allow query engines to safely skip data files, row groups, or individual rows that cannot contribute to the query result - is the foundational optimization that makes analytical queries on petabyte-scale lakehouses practical.

Data skipping in Apache Iceberg operates at multiple levels of granularity, each providing additional skipping opportunities beyond the previous level.

## Level 1: Partition Pruning

The coarsest level of data skipping is partition pruning: skipping entire partitions of the table whose partition values cannot satisfy the query's filter predicates. An Iceberg table partitioned by `month(event_time)` stores data files for January in the `event_time_month=2024-01` partition, February in `event_time_month=2024-02`, etc. A query with `WHERE event_time >= '2024-03-01'` can safely skip all partitions before `2024-03`. This eliminates reading months or years of historical data for a query focused on recent events.

Iceberg's hidden partitioning makes partition pruning automatic and engine-agnostic: the query engine submits the filter predicate to Iceberg, which evaluates it against the partition spec to determine which partitions cannot contain matching data.

## Level 2: File-Level Statistics (Manifest Filtering)

Within qualifying partitions, Iceberg's manifest files record per-column statistics for each data file: minimum value, maximum value, null count, and value count. These statistics enable the query planner to skip entire data files whose column statistics cannot satisfy the filter predicate.

For a query `WHERE order_amount > 1000.00`, any data file where `max(order_amount) < 1000.00` cannot contain qualifying rows and is skipped. For a query `WHERE customer_id = 'C-98765'`, any data file where the customer_id column's `min > 'C-98765'` or `max < 'C-98765'` is skipped.

Manifest filtering is performed without reading any data files: the query planner reads only the lightweight manifest JSON files (kilobytes each) to determine which data files are candidates, then reads only those candidate data files. For tables with hundreds of thousands of data files, manifest filtering can reduce the candidate file set from hundreds of thousands to dozens.

## Level 3: Parquet Row Group Statistics

Within candidate data files, Apache Parquet stores column statistics (min, max, null count) for each row group (typically 128MB of uncompressed data, containing millions of rows). The query engine reads the Parquet file footer (a few kilobytes) to access these row group statistics, then skips row groups whose statistics rule out the filter predicate.

For a query `WHERE product_category = 'Electronics'` on an unpartitioned table, row group statistics can skip row groups that contain only rows from other categories (if the data is clustered by category). For a query `WHERE order_date = '2024-01-15'` on data that is Z-ordered by order_date, row group statistics can skip the vast majority of row groups by date range.

![Data Skipping Architecture](/images/terms/data_skipping.png)

## Level 4: Bloom Filters

For point lookups on high-cardinality columns (user_id, order_id, session_id) where min/max statistics provide little filtering benefit (the range of IDs in each row group overlaps heavily), Parquet column-level Bloom filters provide probabilistic membership testing at the row group level. A Bloom filter definitively rules out row groups that cannot contain the queried ID value, with a configurable false positive rate (typically 1-5%).

## Maximizing Data Skipping: Table Organization

The effectiveness of data skipping depends heavily on how data is organized within and across files. For time-partitioned tables, partition pruning is automatically effective for temporal filters. For multi-dimensional queries (filtering on multiple non-partition columns), Z-ordering (data clustering on multiple columns using a space-filling curve) ensures that rows with similar values for the clustered columns are co-located in the same data files and row groups, maximizing the effectiveness of file-level and row-group-level statistics.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
