---
title: "Time-Series Data"
description: "Time-series data is the specialized data structure consisting of sequential measurements over time, requiring specific storage, indexing, and querying techniques for IoT, financial, and observability use cases."
date: 2026-05-17
tags: ["Time-Series Data", "Data Modeling", "IoT", "Data Architecture", "Data Engineering"]
---

## Analyzing the Flow of Time

While a relational database excels at storing the current state of an entity (e.g., a customer's current address or account balance), many analytical use cases require understanding how an entity changes continuously over time. 

Time-series data is a sequence of data points indexed in chronological order. Each record typically consists of a timestamp, an identifier (the "thing" being measured, like a server ID, a stock ticker, or a temperature sensor), and one or more metric values (CPU usage, price, degrees Celsius). 

Time-series data is characterized by massive volume and high ingestion velocity. A modern factory might have 10,000 IoT sensors, each emitting a reading every second. This generates 864 million records per day. Storing and querying this data efficiently requires specialized architectural approaches.

## Querying Time-Series Data

Analytical queries against time-series data differ significantly from standard relational queries. They almost always involve time-based windowing and aggregation:

**Downsampling**: Converting high-frequency data into lower-frequency summaries. For example, taking second-level CPU metrics and aggregating them into 5-minute averages (`SELECT time_bucket('5 minutes', timestamp), avg(cpu) FROM metrics GROUP BY 1`) to render a fast dashboard over a 30-day window.

**Time-Travel Joins (AS OF Joins)**: Joining two time-series datasets where the timestamps don't align perfectly. If you want to know the stock price of Apple exactly when a news article was published, you need a join that finds the stock price record *immediately preceding* the article's timestamp, rather than an exact match.

**Gap Filling**: Time-series data is often messy; sensors go offline. Queries must artificially insert nulls or interpolate missing values so that graphs render continuously and rolling averages compute correctly.

## Managing Time-Series in the Lakehouse

Historically, time-series data required specialized, expensive databases like InfluxDB or TimescaleDB. Today, the Iceberg lakehouse is increasingly used for massive-scale time-series storage and analysis.

To make time-series data performant in [Apache Iceberg](/terms/apache-iceberg), data engineers use specific optimization strategies:

**1. Aggressive Time Partitioning**: Time-series tables are strictly partitioned by time. Because data volumes are massive, partitioning by `day(timestamp)` or even `hour(timestamp)` is necessary so that queries can prune away irrelevant data instantly.

**2. Sorting and Z-Ordering**: Within the Parquet data files, the data is explicitly sorted by the entity identifier (e.g., `sensor_id`) and the timestamp. This ensures that all readings for a specific sensor over a specific hour are contiguous on disk, allowing dictionary encoding and delta encoding to achieve massive compression ratios (often reducing data size by 90%+).

**3. [Rollup Tables](/terms/rollup-tables)**: Rather than querying the raw second-level data for a yearly report, data pipelines use Flink or dbt to continuously compute and store pre-aggregated "rollup" tables (e.g., minute-level, hourly, and daily aggregates). The raw data is aggressively expired (retained for only 30 days for deep diagnostics), while the hourly rollups are retained for years for long-term trend analysis.

## Learn More

If you want the long-form version, start with the [books by Alex Merced](/books). For a faster pass, there are short [video explainers](/videos).
