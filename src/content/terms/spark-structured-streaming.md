---
title: "Spark Structured Streaming"
description: "A guide to Apache Spark Structured Streaming, the micro-batch and continuous streaming engine built on Spark SQL that enables fault-tolerant, stateful stream processing with exactly-once semantics and native Apache Iceberg sink support."
date: 2026-05-17
tags: ["Spark Structured Streaming", "Apache Spark", "Streaming", "Apache Iceberg", "Data Engineering"]
---

## Unified Batch and Streaming in Spark

[Apache Spark](/terms/apache-spark) originally provided separate APIs for batch processing (Spark Core RDDs, Spark SQL DataFrames) and streaming (Spark Streaming's DStream API). The DStream API processed data in micro-batches (processing all events received in a fixed time interval as a mini-batch), but it used a different programming model from Spark SQL, making it difficult to reuse transformation logic between batch and streaming contexts.

Spark Structured Streaming, introduced in Spark 2.0, replaces the DStream API with a streaming model built directly on Spark SQL DataFrames and Datasets. In Structured Streaming, a stream is modeled as an unbounded table that grows with each micro-batch of new data. Processing logic is written as SQL queries or DataFrame transformations against this unbounded table, using the same APIs as batch processing. The Structured Streaming engine handles the micro-batch scheduling, checkpointing, and fault tolerance transparently.

This unified model eliminates the need for separate batch and streaming codebases. The same transformation logic (joins, aggregations, filters, UDFs) can be applied to both bounded historical data (batch) and unbounded streaming data, supporting the Lambda and [Kappa architecture](/terms/kappa-architecture) patterns that combine historical backfill with real-time processing.

## Micro-Batch and [Continuous Processing](/terms/continuous-processing)

Structured Streaming supports two execution modes. **Micro-batch processing** (the default) collects incoming events into micro-batches based on a configured trigger interval (e.g., every 10 seconds, every minute) and processes each micro-batch as a Spark SQL job. Latency is bounded by the trigger interval plus processing time.

**Continuous processing** (experimental) processes each event individually with sub-millisecond latency by continuously polling sources rather than waiting for a micro-batch boundary. Continuous processing has more limited operator support and is less commonly used in production than micro-batch.

For most [streaming lakehouse](/terms/streaming-lakehouse) pipelines (writing to Iceberg), micro-batch with a 1-5 minute trigger interval provides a practical balance between latency and throughput, batching enough events to produce reasonably sized Parquet files in Iceberg.

## Stateful Stream Processing

Structured Streaming's most powerful capability is stateful stream processing: maintaining per-key state across micro-batches to support aggregations over windows of time, sessionization, and arbitrary user-defined stateful computations.

**Windowed aggregations**: Computing the sum of events in a sliding 1-hour window, updated every 5 minutes, requires maintaining running aggregates keyed by the window boundary and event key. Structured Streaming manages this state in a distributed, fault-tolerant state store.

**Watermarking**: Late-arriving events (events that arrive after their event timestamp's window has already been processed) are handled through Structured Streaming's watermark mechanism. A watermark specifies the maximum expected late arrival delay; events arriving later than the watermark are dropped, bounding the state store's size.

![Spark Structured Streaming Architecture](/images/terms/spark_structured_streaming.png)

## Structured Streaming to [Apache Iceberg](/terms/apache-iceberg)

Apache Spark's Iceberg integration provides native Structured Streaming sink support. A Spark Structured Streaming job writing to an Iceberg table creates a new Iceberg snapshot for each micro-batch, providing exactly-once semantics through Iceberg's ACID commit mechanism. If a micro-batch fails and is retried, Iceberg's [optimistic concurrency control](/terms/optimistic-concurrency-control) ensures that the retry's commit succeeds only if the previous attempt's partial commit (if any) is rolled back.

The streaming Iceberg sink supports append mode (appending each micro-batch's records as new Iceberg data files) and complete mode (overwriting the Iceberg table with the complete aggregated result of all micro-batches processed so far). Append mode is the standard pattern for event stream ingestion; complete mode is used for streaming aggregations that maintain running totals.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
