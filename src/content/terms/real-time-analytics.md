---
title: "Real-Time Analytics"
description: "A guide to real-time analytics on the lakehouse, covering streaming ingestion into Apache Iceberg through Apache Flink, query latency requirements, the streaming lakehouse pattern, and the tradeoffs between true real-time and near-real-time analytical architectures."
date: 2026-05-17
tags: ["Real-Time Analytics", "Streaming", "Apache Flink", "Apache Iceberg", "Data Engineering"]
---

# Defining 'Real-Time' for Analytics

"Real-time analytics" is one of the most overloaded terms in data engineering. To a financial trading system, real-time means sub-millisecond latency. To an operational dashboard, real-time means data updated within the last minute. To many business intelligence systems, real-time means data that is no more than a few hours old. Understanding the actual latency requirement is the first step in designing an appropriate real-time analytics architecture.

Most business analytics use cases that claim to need "real-time" data actually need "near-real-time" data: updates every 1-15 minutes are sufficient. Truly sub-second analytics (measuring the current conversion rate of a live A/B test, monitoring real-time fraud scores during transaction processing) require different architectural approaches than near-real-time dashboard updates.

## The Streaming Lakehouse Architecture

The streaming lakehouse pattern combines Apache Kafka, Apache Flink, and Apache Iceberg to deliver near-real-time data to analytical consumers with low operational complexity:

**Ingestion**: Event data (clickstreams, transactions, sensor readings, log events) is published to Apache Kafka topics by source systems. Kafka provides the durable, ordered, partitioned event buffer that decouples producers from consumers and handles ingestion rate spikes.

**Streaming processing**: Apache Flink consumes Kafka topics, applies stream processing logic (event-time windowing, enrichment joins, deduplication, validation), and writes processed events to Apache Iceberg tables using the Flink Iceberg sink. Each Flink checkpoint (every 1-5 minutes by default) commits a new Iceberg snapshot containing the events processed since the last checkpoint.

**Analytics serving**: Dremio queries the Iceberg tables, reading the latest snapshots as they are committed by Flink. Dremio's Data Reflections provide query acceleration, but for near-real-time queries where freshness is critical, queries may read directly from the Iceberg table without reflections to avoid reflection staleness.

The streaming lakehouse delivers data to analytical consumers within 2-10 minutes of the originating event, sufficient for most operational dashboards and business monitoring use cases.

![Real-Time Analytics Architecture](/images/terms/realtime_analytics.png)

## Iceberg V2 Row-Level Updates for Near-Real-Time

Apache Iceberg V2 introduced position delete files and equality delete files, enabling row-level deletes and updates without rewriting entire data files. This supports near-real-time CDC (Change Data Capture) patterns where updated records from OLTP databases (order status changes, account balance updates) must be reflected in the lakehouse quickly.

A Flink CDC pipeline reads change events from a database's binlog (MySQL, PostgreSQL, Oracle), processes them through Flink, and applies MERGE INTO operations to Iceberg tables at each checkpoint interval. The MERGE logic upserts records: inserting new records, updating changed records (by writing equality delete files to mark old versions and appending new versions), and deleting removed records.

The result is an Iceberg table that reflects the current state of the source OLTP database with a latency equal to the Flink checkpoint interval (typically 1-5 minutes), without the complexity and cost of traditional database replication approaches.

## True Real-Time: Apache Druid and Apache Pinot

For sub-minute analytical queries (real-time monitoring dashboards, live A/B test metrics, real-time fraud detection dashboards), Apache Druid and Apache Pinot provide true real-time ingestion from Kafka (data visible within seconds of ingestion) with sub-second query latency. These specialized OLAP databases optimize for low-latency ingestion and query over recent data, trading the full feature set of the Iceberg lakehouse for much lower query and ingest latency.

Many organizations combine a real-time OLAP layer (Druid/Pinot) for the most latency-sensitive dashboards with the streaming Iceberg lakehouse for the broader near-real-time analytical platform, routing query traffic to the appropriate tier based on latency requirements.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
