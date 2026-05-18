---
title: "Liquid Clustering"
description: "A guide to Liquid Clustering in Delta Lake and Databricks, the adaptive file organization technique that replaces static partitioning with flexible, incremental clustering that automatically optimizes file layout for the most common query patterns."
date: 2026-05-17
tags: ["Liquid Clustering", "Delta Lake", "Databricks", "Data Lakehouse", "Query Optimization"]
---

# Beyond Static Partitioning

Traditional Hive-style partitioning divides a table's data files into directory hierarchies based on partition column values defined at table creation time. A table partitioned by `year/month/region` stores all rows with year=2024, month=01, region=US_WEST in the same directory. Partition pruning eliminates entire directories for queries that filter on those exact partition columns, dramatically reducing data scanned.

But Hive-style partitioning has fundamental limitations. The partition columns are fixed at table creation: if query patterns change (the most common filter shifts from `region` to `product_category`), the partition scheme cannot be changed without rewriting all data. High-cardinality partition columns (partitioning by `product_id` when there are 1 million products) create millions of tiny files. And partitioning works well for equality and range filters on partition columns but provides no benefit for other filter predicates.

Liquid Clustering, introduced in [Delta Lake](/terms/delta-lake) 3.1 by Databricks, replaces static partitioning with a dynamic, adaptive file organization approach. Instead of writing data into fixed partition directories at ingest time, Liquid Clustering clusters data files by the specified clustering columns through an incremental background optimization process. Data can be ingested without any partitioning structure, and the clustering columns can be changed after table creation without rewriting the data.

## How Liquid Clustering Works

Liquid Clustering uses a space-filling curve (similar to Z-ordering but with improvements) to co-locate rows with similar clustering column values into the same data files. When the `CLUSTER BY` columns are defined, the clustering algorithm assigns each row a position on the space-filling curve based on its clustering column values, and rows with adjacent positions on the curve are written into the same data file.

Unlike Z-ordering (which is a one-time operation that must be re-run manually or on a schedule), Liquid Clustering is incremental. Each new batch of data ingested into a Liquid Clustered table automatically triggers a lightweight clustering step that integrates the new data into the clustered layout without reprocessing the entire table. The clustering progress is tracked in the Delta transaction log, and the optimizer uses the clustering statistics to apply [data skipping](/terms/data-skipping).

When the `CLUSTER BY` columns change, the existing data files retain their old clustering, and new data is written with the new clustering. Over time, as [compaction](/terms/compaction) and clustering operations process more of the table, the data progressively adopts the new clustering layout. This gradual transition eliminates the need for a full table rewrite when clustering columns change.

![Liquid Clustering Architecture](/images/terms/liquid_clustering.png)

## Liquid Clustering vs. [Apache Iceberg](/terms/apache-iceberg) [Hidden Partitioning](/terms/hidden-partitioning)

Apache Iceberg's hidden partitioning and [partition evolution](/terms/partition-evolution) address similar problems to Liquid Clustering but through a different mechanism. Iceberg's partition evolution allows partition transforms to be changed without data rewrites, with new data using the new partition spec and old data using the old spec. Partition pruning applies both old and new specs correctly.

Liquid Clustering provides finer-grained data co-location within files (using the space-filling curve) rather than between files (partition-level pruning). In practice, a well-configured Iceberg table with hidden partitioning and Z-ordering provides comparable multi-dimensional data skipping to Liquid Clustering.

Liquid Clustering is specific to the Delta Lake format on Databricks. Organizations building on Apache Iceberg achieve similar adaptive file organization through Iceberg's partition evolution, Z-ordering, and compaction capabilities, without vendor-specific format dependency.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
