---
title: "Bloom Filters"
description: "Bloom filters are a probabilistic data structure used in Iceberg, Parquet, and query engines to dramatically accelerate point lookups by skipping data files that definitely cannot contain matching values."
date: 2026-05-17
tags: ["Bloom Filters", "Apache Iceberg", "Query Optimization", "Data Engineering", "Apache Parquet"]
---

## Answering 'Definitely Not' in Microseconds

A Bloom filter is a probabilistic data structure that answers membership queries: "Is this value definitely NOT in this set?" with 100% accuracy, and "Is this value possibly in this set?" with a configurable false positive rate. A Bloom filter can definitively rule out values that are not in the set, but it cannot guarantee that a value it reports as "possibly present" is actually present (it may be a false positive).

For data engineering, this asymmetric accuracy is extremely useful for [query optimization](/terms/query-optimization). When a query filters on a specific value (e.g., `WHERE order_id = 'ORD-12345'`), the query engine needs to determine which data files might contain a row with that order ID. Without a Bloom filter, the engine must either scan all data files (expensive) or rely on min/max statistics that are ineffective for high-cardinality string columns (min/max statistics tell you the alphabetically first and last order IDs in a file, but not whether a specific ID in the middle of that range is present).

A Bloom filter on the order_id column in each data file provides a definitive answer for "not present" queries in microseconds, without reading the data file. A query engine checks the Bloom filter for each candidate file: if the filter returns "definitely not present," the file is skipped. Only files where the filter returns "possibly present" are read and scanned. For queries filtering on high-cardinality IDs (user IDs, order IDs, session IDs), Bloom filters can reduce the number of files read by 99%+.

## How Bloom Filters Work

A Bloom filter is implemented as a bit array of length `m` and `k` independent hash functions. When a value is added to the filter, it is passed through each of the `k` hash functions, and the corresponding `k` bit positions in the array are set to 1. To query whether a value is in the filter, the same `k` hash functions are applied to the query value; if all `k` bit positions are 1, the value is "possibly present." If any bit position is 0, the value is "definitely not present."

The false positive rate (the probability that a value is reported as "possibly present" when it is actually absent) depends on the number of bits per element and the number of hash functions. More bits per element reduces the false positive rate but increases the filter's memory footprint. A well-configured Bloom filter with 10 bits per element achieves a false positive rate of approximately 1%.

The memory cost of a Bloom filter is much smaller than storing the actual values. A set of 10 million order IDs (each 20 bytes average) requires 200MB to store exactly. A Bloom filter for the same set with a 1% false positive rate requires only 12MB (10 bits per element).

![Bloom Filter Architecture](/images/terms/bloom_filters.png)

## Bloom Filters in [Apache Iceberg](/terms/apache-iceberg) and Parquet

[Apache Parquet](/terms/apache-parquet) supports Bloom filters at the column level within each row group. Bloom filters are written for specified columns when data files are created, stored in the Parquet file's footer alongside the column statistics. Query engines ([Dremio](/terms/dremio), Spark, [Trino](/terms/trino)) check the Bloom filter for each row group before reading that row group's data, skipping row groups where the filter rules out the query value.

Apache Iceberg extends Bloom filter support to the file level through its content file statistics. Iceberg's manifest files record per-column statistics (min, max, null count) for each data file. Iceberg does not natively support file-level Bloom filters in the manifest metadata, but Parquet-level Bloom filters within each data file provide row-group-level filtering.

Configuring Bloom filters in Spark when writing Iceberg tables:
```python
df.write.format("iceberg") \
  .option("write.parquet.bloom-filter-enabled.column.order_id", "true") \
  .option("write.parquet.bloom-filter-max-bytes", "1048576") \
  .saveAsTable("catalog.db.orders")
```

For tables that are frequently queried by specific high-cardinality identifiers (user_id, session_id, order_id, device_id), enabling Bloom filters on those columns provides significant query speedup with minimal storage overhead.

## Learn More

The [books by Alex Merced](/books) go further on this topic and the systems it sits inside. Short [video explainers](/videos) cover the same ground in under a minute each.
