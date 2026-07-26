---
title: "Data Virtualization"
description: "A guide to data virtualization, the architecture that enables querying and combining data across multiple disparate systems (databases, object storage, APIs) without copying or moving the data to a centralized repository."
date: 2026-05-17
tags: ["Data Virtualization", "Query Federation", "Dremio", "Data Architecture", "Data Engineering"]
---

## Connecting Instead of Collecting

The traditional approach to [data integration](/terms/data-integration) is physical centralization: the ETL (Extract, Transform, Load) model. If a business needs to analyze sales data (in an Oracle database) alongside web behavior data (in an S3 [data lake](/terms/data-lake)), the standard solution is to build a pipeline that extracts the Oracle data, copies it into the data lake or warehouse, and joins it there. This physical movement of data creates complexity, latency (the joined view is only as fresh as the last pipeline run), and cost (storing multiple copies of the same data).

Data virtualization provides a logical approach to data integration: rather than moving data to a central location, a virtualization layer provides a unified access point that queries data where it lives. To the business user or BI tool, the virtualization layer appears as a single relational database containing all the organization's data. When a query is submitted, the virtualization engine translates the query, pushes execution down to the underlying source systems, retrieves the intermediate results, and performs the final joins and aggregations in memory.

## How Data Virtualization Works

A data virtualization engine (like [Dremio](/terms/dremio) or [Trino](/terms/trino)) operates through connectors. A connector understands the dialect and execution capabilities of a specific source system (PostgreSQL, MongoDB, Snowflake, Iceberg).

When a query joins an Iceberg table (`web_clicks`) with a PostgreSQL table (`customer_profiles`), the virtualization engine:
1. Parses the query and identifies the source systems involved.
2. Generates an execution plan that pushes as much work as possible down to the source systems ([predicate pushdown](/terms/predicate-pushdown)). The query sent to PostgreSQL will include only the required columns and filter conditions (`SELECT customer_id, segment FROM customer_profiles WHERE segment = 'Enterprise'`).
3. Executes the pushed-down queries concurrently across the source systems.
4. Retrieves the filtered, projected data into the virtualization engine's memory (using formats like [Apache Arrow](/terms/apache-arrow)).
5. Executes the join between the Iceberg data and the PostgreSQL data in memory.
6. Returns the final result to the user.

## Virtualization in the Lakehouse Era

Data virtualization is complementary to the [data lakehouse architecture](/terms/data-lakehouse-architecture). A pure lakehouse model attempts to land all analytical data in Iceberg on [object storage](/terms/object-storage). However, enterprise realities dictate that some data will always live outside the lakehouse: operational databases (OLTP), third-party SaaS APIs, or legacy data warehouses that are too complex to migrate.

Virtualization bridges the gap. Dremio, acting as both a lakehouse query engine and a data virtualization platform, allows organizations to adopt the lakehouse pattern for the majority of their data (where open formats and cheap storage provide the most benefit) while seamlessly federating queries to operational databases when real-time, zero-latency access is required, without forcing an "everything must move" migration strategy.

![Data Virtualization Architecture](/images/terms/data_virtualization.png)

## Trade-offs of Virtualization

Virtualization provides significant benefits: faster time-to-insight (no waiting for ETL pipelines to be built), zero data duplication, and real-time access to operational data.

However, virtualization is not a replacement for data lakes or warehouses for all workloads. Querying operational databases for heavy analytical aggregations can degrade the performance of the transactional systems. Network latency between the virtualization engine and the source systems can bottleneck large data transfers. For these reasons, virtualization is often paired with caching or materialization strategies (like Dremio Data Reflections) that transparently cache frequently accessed federated views to protect source systems and accelerate performance.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
