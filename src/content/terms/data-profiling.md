---
title: "Data Profiling"
description: "A guide to data profiling, the automated analysis of datasets to understand their structure, content quality, and statistical characteristics before building pipelines or data models, enabling informed engineering and governance decisions."
date: 2026-05-17
tags: ["Data Profiling", "Data Quality", "Data Engineering", "Analytics", "Metadata"]
---

# Understanding Data Before You Transform It

Data pipelines fail or produce incorrect results when engineers make incorrect assumptions about the data they are processing. A pipeline that assumes a customer email column is never null fails when the source system introduces null emails. A join that assumes order IDs are unique fails when the source system contains duplicates. A revenue calculation that assumes amounts are always positive fails when refunds introduce negative values.

Data profiling is the systematic process of analyzing a dataset to understand its structure, content, and quality characteristics before building pipelines, writing transformations, or designing data models. A data profile answers questions like: What columns does this dataset have? What are the data types? What percentage of values are null for each column? What is the value distribution (min, max, mean, standard deviation) for numeric columns? What unique values exist for categorical columns? Are there duplicate rows? What is the record count?

Profiling a new data source before building a pipeline converts implicit assumptions into explicit knowledge, enabling engineers to design pipelines that handle the actual data rather than the idealized version of the data described in documentation (which is frequently incomplete or outdated).

## Profiling Techniques

**Column-level statistics**: For each column, compute null count, unique count, min/max values (for ordered types), mean/standard deviation (for numeric types), and value frequency distributions. A column with 30% null values may need null handling logic in the pipeline. A column with exactly one unique value is probably a constant and unlikely to be useful as a join key or filter predicate.

**Relationship profiling**: Profile foreign key relationships by computing the join cardinality between tables. A customer_id that appears in the orders table but not in the customers table is an orphaned foreign key, indicating a [data quality](/terms/data-quality) issue in the source system that the pipeline must handle.

**Temporal profiling**: Profile time-series columns (event timestamps, record creation dates) to understand data freshness, gaps in the time series, and unexpected temporal patterns. A timestamp column that has no records for certain days may indicate source system outages that affect downstream metrics.

**Pattern profiling**: For string columns, analyze the distribution of string formats using regular expressions. A phone number column with multiple format patterns (with dashes, without dashes, with country code, without) requires normalization before joining with another table's phone number column.

![Data Profiling Architecture](/images/terms/data_profiling.png)

## Data Profiling Tools in the Lakehouse

Several tools support automated data profiling against Iceberg tables:

**[Apache Spark](/terms/apache-spark)**: Spark's `DataFrame.describe()` method computes basic column statistics (count, mean, stddev, min, max) for a DataFrame. Custom profiling jobs can extend this with null counts, unique counts, and distribution histograms. Spark's ability to read Iceberg tables directly enables profiling of lakehouse tables at scale.

**Great Expectations**: Beyond validation, Great Expectations can generate data profiles through its `DataAssistant` and `Profiler` APIs, automatically deriving expectations from observed data distributions. These auto-generated expectations become the basis for ongoing quality monitoring.

**[Dremio](/terms/dremio)**: Dremio's metadata management includes column-level statistics collected during query execution, which serve as lightweight profiling data. More detailed profiling can be run through Dremio SQL queries against Iceberg tables without requiring a Spark cluster.

**dbt**: dbt's source freshness checks and `dbt_profiler` package provide profiling capabilities integrated into dbt's transformation workflow, enabling profiling of sources and intermediate models as part of the standard dbt run.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
