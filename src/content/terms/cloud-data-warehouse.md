---
title: "Cloud Data Warehouse"
description: "A guide to the Cloud Data Warehouse, the fully managed, scalable analytical database systems like Snowflake, BigQuery, and Redshift that revolutionized analytics by decoupling storage from compute in the cloud era."
date: 2026-05-17
tags: ["Cloud Data Warehouse", "Data Warehouse", "Snowflake", "BigQuery", "Data Architecture"]
---

## Analytics as a Managed Service

Before the cloud era, data warehouses were massive on-premises appliances (like Teradata or Oracle Exadata). They were expensive capital investments, required specialized teams to maintain the hardware, and suffered from a fatal architectural flaw: storage and compute were tightly coupled. If you needed more storage capacity, you had to buy a new server appliance that also included compute capacity you didn't need. If you needed more compute for complex queries, you had to buy an appliance that included storage you didn't need.

The Cloud [Data Warehouse](/terms/data-warehouse) (CDW) revolutionized this model by moving analytical databases to the cloud and architecturally decoupling storage from compute. Systems like Snowflake, Google BigQuery, and Amazon Redshift (which evolved to decoupled storage) allow organizations to store petabytes of data cheaply on cloud [object storage](/terms/object-storage) while independently scaling compute resources up or down on demand.

## Key Characteristics of a Cloud Data Warehouse

**Decoupled Storage and Compute**: A CDW stores data in a proprietary, optimized columnar format on the cloud provider's object storage (e.g., Snowflake stores its micro-partitions on S3). Compute clusters (virtual warehouses) read this data over the cloud network. Because compute is separate, you can run a massive compute cluster for 10 minutes to process a heavy ETL job, then shut it down, paying only for the 10 minutes of compute time while the data remains safely and cheaply stored.

**Fully Managed (SaaS/PaaS)**: CDWs are delivered as managed services. The vendor handles software updates, hardware provisioning, storage tiering, high availability, and disaster recovery. Data engineering teams focus on [data modeling](/terms/data-modeling) and SQL queries rather than database administration.

**Elastic Scalability**: When query concurrency increases (e.g., 500 business users log in on Monday morning), a CDW can automatically provision additional compute clusters to handle the load and spin them down when the load decreases, ensuring consistent performance without provisioning for peak capacity 24/7.

![Cloud Data Warehouse Architecture](/images/terms/cloud_data_warehouse.png)

## The CDW vs. The Open Lakehouse

Cloud Data Warehouses provide exceptional operational simplicity and query performance. However, they rely on proprietary data formats and closed ecosystems. Once data is ingested into a CDW's internal storage, it can only be queried by that specific vendor's compute engine.

This vendor lock-in creates challenges for modern data organizations that want to use [Apache Spark](/terms/apache-spark) for heavy transformation, Python/Pandas for machine learning, or [Dremio](/terms/dremio) for specific [semantic layer](/terms/semantic-layer) needs. Using external tools against a CDW requires either exporting the data back out (incurring egress costs and pipeline latency) or paying the CDW vendor's compute costs to run their proprietary connectors.

The modern [Data Lakehouse](/terms/data-lakehouse) (built on [Apache Iceberg](/terms/apache-iceberg)) provides an alternative: achieving CDW-like performance and ACID compliance while keeping the data in open Parquet files on customer-owned storage, allowing any engine to access the data directly without a proprietary tollbooth. Many organizations now use a hybrid approach: an open lakehouse for the majority of data and ML workloads, with specific refined datasets synced to a CDW for specialized BI serving.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
