---
title: "Apache ORC"
description: "A guide to Apache ORC (Optimized Row Columnar), the columnar file format developed for the Hadoop ecosystem that pioneered many of the columnar storage optimizations later extended by Parquet and modern lakehouse formats."
date: 2026-05-17
tags: ["Apache ORC", "File Formats", "Columnar Storage", "Hadoop", "Data Engineering"]
---

# The Columnar Pioneer of the Hadoop Era

Before columnar storage formats transformed analytical data processing, the Hadoop ecosystem stored data in row-oriented formats: plain text CSV files, SequenceFiles (key-value binary format), and Avro (row-oriented binary format with schema). These formats were efficient for write operations (appending rows sequentially) but poorly suited for analytical reads (scanning a few columns from billions of rows required reading and parsing all columns).

Apache ORC (Optimized Row Columnar) was developed at Hortonworks in 2013 as a solution to this problem, introducing columnar storage to the Hadoop ecosystem with a design that incorporated [predicate pushdown](/terms/predicate-pushdown), column-level compression, and file-level statistics to dramatically accelerate Hive queries. ORC became the default storage format for Apache Hive and played a foundational role in demonstrating the performance benefits of columnar storage for analytical workloads.

[Apache Parquet](/terms/apache-parquet) (developed by Cloudera and Twitter) emerged around the same time, with a slightly different design philosophy: Parquet prioritized cross-engine compatibility (HDFS, Spark, Impala) and a language-neutral format specification, while ORC prioritized Hive performance optimization. Today, Parquet has become the dominant format in the modern lakehouse ecosystem (used by Iceberg, [Delta Lake](/terms/delta-lake), and Hudi), but ORC remains widely used in Hive-based and HBase-based ecosystems.

## ORC File Structure

An ORC file is organized into stripes (large blocks of rows, typically 256MB each). Each stripe contains three sections: index data (min/max statistics and [bloom filters](/terms/bloom-filters) for each column within the stripe), row data (the actual columnar data for each column), and stripe footer (metadata describing the column encodings and row group layouts within the stripe).

The stripe-level and row-group-level column statistics enable predicate pushdown at two levels: at the stripe level (skipping entire stripes whose column statistics cannot match the query predicate) and at the row-group level within a stripe (skipping 10,000-row groups whose statistics cannot match). This hierarchical pushdown mechanism significantly reduces data scanned for selective queries.

ORC supports multiple column encoding strategies: dictionary encoding for low-cardinality string columns (storing each unique value once and encoding rows as indices into the dictionary), delta encoding for monotonically increasing integer columns (storing differences between consecutive values rather than absolute values), and run-length encoding for repetitive values. These encodings are automatically selected based on the column's data distribution, typically achieving 3-10x compression ratios over uncompressed data.

![Apache ORC File Structure](/images/terms/orc_format.png)

## ORC vs. Parquet in the Modern Lakehouse

For modern lakehouse architectures built on [Apache Iceberg](/terms/apache-iceberg), Apache Parquet is the strongly preferred data file format. Iceberg's design and tooling are optimized for Parquet: Iceberg's column statistics are derived from Parquet's row group statistics, and all major Iceberg-compatible query engines ([Dremio](/terms/dremio), Spark, Flink, [Trino](/terms/trino)) are heavily optimized for Parquet reads.

Iceberg does support ORC as an alternative data file format, and existing Hive ORC tables can be migrated to Iceberg while retaining ORC storage. However, new Iceberg tables should use Parquet unless there is a specific requirement for ORC compatibility (e.g., Hive workloads that require ORC, or existing HBase pipelines that produce ORC files).

For teams migrating from Hive with ORC tables to a modern Iceberg lakehouse, the migration path is: register the existing ORC tables in an Iceberg catalog using Iceberg's Hive table migration utilities, then incrementally rewrite ORC files to Parquet through Iceberg's `REWRITE DATA FILES` procedure as the migration progresses, enabling the transition without a full data rewrite upfront.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
