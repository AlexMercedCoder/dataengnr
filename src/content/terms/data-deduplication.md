---
title: "Data Deduplication"
description: "Data deduplication covers the techniques used to identify and remove duplicate records that occur due to at-least-once delivery semantics, retry logic, or source system anomalies."
date: 2026-05-17
tags: ["Data Deduplication", "Data Quality", "ETL", "Apache Iceberg", "Data Engineering"]
---

## Managing the Reality of 'At-Least-Once' Delivery

In distributed systems, ensuring that a message is delivered exactly once is notoriously difficult. Network partitions, consumer crashes, and producer timeouts mean that the safest delivery guarantee most messaging systems (like [Apache Kafka](/terms/apache-kafka)) provide by default is "at-least-once" delivery: the system guarantees the message will be delivered, but it might be delivered multiple times.

When building data ingestion pipelines from at-least-once sources, data engineers must assume that duplicate records will arrive in the lakehouse. A single purchase event might be recorded twice in the raw data layer. If these duplicates propagate through the transformation pipeline to the Gold layer, analytical queries will over-report revenue, ML models will be biased by duplicate training examples, and business trust in the data will erode.

Data deduplication is the process of identifying and resolving these duplicate records to ensure analytical accuracy.

## Deduplication Strategies

**Row-Number [Window Functions](/terms/window-functions)**: In batch SQL transformations (e.g., in dbt), deduplication is typically handled using the `ROW_NUMBER()` window function. The pipeline groups records by their unique identifier (the primary key), orders them by a timestamp or version column, and keeps only the most recent version.

```sql
WITH RankedEvents AS (
  SELECT *,
         ROW_NUMBER() OVER(
           PARTITION BY event_id 
           ORDER BY ingestion_timestamp DESC
         ) as rn
  FROM raw_events
)
SELECT * FROM RankedEvents WHERE rn = 1;
```

**MERGE INTO (Upsert)**: In modern lakehouses using [Apache Iceberg](/terms/apache-iceberg), deduplication is often handled during ingestion using the `MERGE INTO` operation. When a batch of records (which may contain duplicates of existing records or duplicates within the batch itself) is ingested, the MERGE operation matches them against the target table on the unique key. Existing records are updated, and new records are inserted. This handles cross-batch duplicates automatically.

**Streaming State Management**: In streaming pipelines (e.g., [Apache Flink](/terms/apache-flink)), deduplication is handled by maintaining state. As events arrive, Flink checks its state store (RocksDB) to see if the event ID has been processed within the deduplication window. If it has, the event is dropped. If not, the event is processed and its ID is added to the state. This requires memory proportional to the number of unique events in the time window.

![Data Deduplication Architecture](/images/terms/data_deduplication.png)

## Deduplication in the Bronze/Silver/Gold Architecture

The [Medallion architecture](/terms/medallion-architecture) provides a clear framework for where deduplication should occur. 

The **Bronze layer** (raw data) should generally not be deduplicated. It should represent the exact data received from the source, preserving the historical record of exactly what arrived, including the duplicates.

The transition from Bronze to **Silver layer** is the primary boundary for deduplication. The Silver layer is the validated, deduplicated, standardized representation of the data. Pipelines populating the Silver layer apply the `ROW_NUMBER()` or `MERGE INTO` logic to eliminate duplicates, ensuring that all downstream Gold models and ad-hoc queries are protected from ingestion anomalies.

The **Gold layer** relies on the Silver layer's cleanliness, focusing on business logic aggregations rather than [data quality](/terms/data-quality) remediation.

## Learn More

If you want the long-form version, start with the [books by Alex Merced](/books). For a faster pass, there are short [video explainers](/videos).
