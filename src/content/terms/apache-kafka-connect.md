---
title: "Apache Kafka Connect"
description: "Apache Kafka Connect is the scalable, resilient integration framework within the Kafka ecosystem designed to stream data reliably between Kafka and external databases, key-value stores, and cloud storage systems."
date: 2026-05-17
tags: ["Apache Kafka Connect", "Data Ingestion", "Streaming", "Change Data Capture", "Data Engineering"]
---

## Standardizing the Ingestion Pipeline

[Apache Kafka](/terms/apache-kafka) is the nervous system of the modern [data architecture](/terms/data-architecture), reliably buffering and distributing high-throughput event streams. However, getting data *into* Kafka from source databases, and getting data *out* of Kafka into target data warehouses or lakehouses, historically required writing custom producer and consumer applications.

Writing a custom Java or Python application to read from a PostgreSQL database and write to Kafka sounds simple, but productionizing it is complex. You have to handle offset management (tracking what was read), fault tolerance (what happens if the application crashes), [schema evolution](/terms/schema-evolution), distributed scaling, and error handling.

Apache Kafka Connect solves this by providing a standardized, scalable framework for connecting Kafka with external systems. Instead of writing custom code, data engineers use pre-built "Connectors" and configure them via JSON. Kafka Connect handles the complex distributed systems problems: load balancing, fault tolerance, offset management, and scaling across a cluster of worker nodes.

## Source and Sink Connectors

Kafka Connect operates using two types of connectors:

**Source Connectors**: Pull data from an external system and write it to a Kafka topic. A prime example is Debezium, a powerful CDC (Change Data Capture) source connector. Debezium connects to a database (like MySQL or PostgreSQL), reads the database's transaction log (binlog/WAL), and streams every INSERT, UPDATE, and DELETE event into a Kafka topic in real-time, without impacting the database's query performance.

**Sink Connectors**: Read data from a Kafka topic and push it to an external system. Examples include the Elasticsearch Sink Connector (streaming logs into an ELK stack for search), the JDBC Sink Connector (writing streaming aggregations into a relational database), or the Amazon S3 / [Apache Iceberg](/terms/apache-iceberg) Sink Connectors.

## Kafka Connect in the Lakehouse Architecture

In a real-time [streaming lakehouse](/terms/streaming-lakehouse) architecture, Kafka Connect provides the critical "first mile" and "last mile" of the pipeline without requiring custom stream-processing code.

**The First Mile (CDC to Kafka)**: A Debezium Source Connector is configured to monitor the company's production transactional database. As customers place orders, the connector instantly captures the database changes and streams them into a Kafka topic (`raw_orders_cdc`).

**The Stream Processing Layer**: [Apache Flink](/terms/apache-flink) reads the `raw_orders_cdc` topic, enriches the data, performs aggregations, and writes the processed results to an output topic (`enriched_orders`).

**The Last Mile (Kafka to Iceberg)**: A Kafka Connect Iceberg Sink Connector (or a Flink sink) reads the `enriched_orders` topic and continuously writes the data into Apache Iceberg tables in [object storage](/terms/object-storage). The sink connector handles the complex mechanics of buffering records, writing Parquet files, and committing Iceberg snapshots at regular intervals.

By using the rich ecosystem of hundreds of open-source Kafka Connectors, data engineering teams can build robust, scalable streaming ingestion pipelines using configuration rather than code.

## Learn More

Several of the [books by Alex Merced](/books) cover this in depth, and a few of them are free. The rest of the [knowledge base](/terms) is worth a look too.
