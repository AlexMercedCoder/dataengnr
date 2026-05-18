---
title: "Pull-Based Ingestion"
description: "A guide to pull-based ingestion, the traditional batch data integration pattern where the central data platform proactively extracts data from source databases at scheduled intervals, favored for its simplicity and reliability."
date: 2026-05-17
tags: ["Pull-Based Ingestion", "ETL", "Batch Processing", "Data Architecture", "Data Engineering"]
---

# Extracting the Data

Unlike [push-based ingestion](/terms/push-based-ingestion) where source systems actively send data, pull-based ingestion is a proactive strategy initiated by the data platform. In this architecture, the central data engineering pipeline (using tools like Airbyte, Fivetran, or custom Airflow Python scripts) reaches into the source system on a scheduled basis to extract (pull) the data it needs.

If an organization needs to analyze its daily sales, an Airflow DAG triggers a job every night at 2:00 AM. The job connects via JDBC to the operational PostgreSQL database backing the sales application, executes a `SELECT * FROM sales WHERE created_at > [last_run_date]`, pulls the resulting records across the network, and writes them into the Bronze layer of the Iceberg [data lakehouse](/terms/data-lakehouse).

## Benefits of Pull-Based Ingestion

**No Burden on Software Developers**: The primary advantage of pull-based ingestion is that it requires zero custom code from the teams building the source applications. The data engineering team simply requests read-only database credentials and handles the entire extraction process using standard ETL connectors. 

**Reliability and [Backfilling](/terms/backfilling)**: Pull-based systems are inherently robust. If the overnight ETL job fails because the network drops, the orchestrator simply retries it an hour later. If the data team realizes they need an extra column from the source database, they simply update their `SELECT` query to pull it, and they can easily pull the entire historical table (a full refresh) to backfill the data lakehouse.

![Pull-Based Ingestion Architecture](/images/terms/pull_ingestion.png)

## Challenges of Pull-Based Ingestion

**High Latency**: Pull-based ingestion is synonymous with batch processing. If the pipeline runs every 24 hours, the data in the lakehouse is always up to 24 hours out of date. While you can increase the frequency (pulling every 15 minutes), it is impossible to achieve the millisecond latency of a push-based streaming system.

**Load on Operational Systems**: Pulling data requires executing massive analytical `SELECT` queries against operational databases that are primarily designed for fast, single-row inserts and updates. Running a heavy ETL extraction query during peak business hours can saturate the database's CPU, slowing down the application for end-users. 

To mitigate this, pull-based pipelines almost always pull data from a "Read Replica" of the database rather than the primary master database, ensuring that analytical extractions never impact production application performance. Alternatively, teams use Change Data Capture (CDC), a hybrid approach that reads the database's internal transaction logs to pull data continuously with zero query overhead.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
