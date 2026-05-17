---
title: "Apache ORC"
description: "A guide to Apache ORC (Optimized Row Columnar), the columnar storage format developed for the Hive ecosystem that offers high compression, predicate pushdown, and built-in ACID support for data warehousing workloads."
date: 2026-05-17
tags: ["Apache ORC", "Columnar Storage", "File Formats", "Data Engineering"]
---

# The Hive-Native Columnar Format

Apache ORC (Optimized Row Columnar) was created by Hortonworks and Facebook in 2013 as a replacement for Hive's original RCFile format. RCFile was a first-generation columnar format that improved on simple text and SequenceFile formats but suffered from significant limitations: inefficient compression, limited type support, and poor predicate pushdown. ORC addressed all three limitations with a redesigned columnar storage architecture specifically optimized for Hive query patterns and the Hadoop ecosystem.

ORC became the dominant storage format for Hive-based data warehouses through the 2013-2019 period, before the emergence of Apache Iceberg and the broader adoption of Apache Parquet as the standard lakehouse format. Understanding ORC's architecture helps explain both its strengths for specific workloads and why Parquet has become the preferred format for modern open lakehouses.

## ORC's Storage Architecture

An ORC file organizes data in a three-level hierarchy: file, stripe, and row group. The file level stores file-level metadata including the schema, the file footer with global statistics, and the postscript with compression metadata. Stripes are the primary organizational unit, typically 250MB in size, each storing a horizontal slice of the table's rows. Within each stripe, data is organized in row groups of 10,000 rows, with each column's data stored as a separate stream within the row group.

This architecture produces several performance advantages. Column-level compression is applied within each stripe, with ORC supporting multiple compression codecs (Zlib, Snappy, LZO, Zstd) selectable per table. ORC's type system includes native support for complex types (structs, lists, maps, unions) and the ACID timestamp type, providing precise nanosecond timestamps without the integer epoch-seconds limitations of earlier formats.

ORC's built-in statistics are among its most useful features. Each ORC file stores file-level statistics (min, max, count, sum for each column), stripe-level statistics, and row-group-level statistics in bloom filters and min/max ranges. Query engines that support ORC predicate pushdown use these statistics to skip entire stripes and row groups that cannot contain matching rows, dramatically reducing the data read for filtered queries.

![Apache ORC vs Parquet](/images/terms/orc_vs_parquet.png)

## ORC ACID Support

A distinctive feature of Apache ORC is its built-in ACID transaction support implemented through Hive's transactional table management. Hive ACID tables use ORC's delta file mechanism to store insert, update, and delete operations as separate delta directories alongside the base ORC data files. Hive's compaction process periodically merges these delta files back into the base ORC files, analogous to Iceberg's MoR compaction pattern.

This native ACID support through ORC predates Apache Iceberg's more sophisticated ACID implementation and served as the primary mechanism for building updatable Hive data warehouses before Iceberg's emergence. However, Hive ACID's performance at scale has been consistently lower than Iceberg-based solutions, and the operational complexity of managing Hive transactional table compaction is higher than Iceberg's equivalent operations.

## ORC vs. Parquet: When to Choose Each

For organizations with existing Hive-based data warehouses, ORC tables are the natural format choice because Hive's query optimizer is deeply integrated with ORC's statistics and bloom filter structures. Migrating existing ORC tables to Parquet introduces conversion overhead and potential compatibility issues with Hive-specific features.

For new lakehouse implementations using Apache Iceberg, Apache Parquet is the standard data file format. Iceberg's metadata layer (manifests and file statistics) provides more comprehensive and efficiently queryable statistics than ORC's file-embedded statistics, and Parquet's broader engine compatibility (Dremio, Spark, Flink, DuckDB, Trino) makes it the more appropriate choice for multi-engine lakehouse architectures. Dremio reads ORC files natively for compatibility with legacy Hive data warehouses but recommends Parquet for new Iceberg table deployments.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
