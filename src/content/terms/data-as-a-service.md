---
title: "Data as a Service (DaaS)"
description: "Data as a Service (DaaS) is the architectural pattern that treats curated data products as governed, API-accessible services with defined SLAs, ownership, and discoverability, enabling self-service data consumption across an organization."
date: 2026-05-17
tags: ["Data as a Service", "DaaS", "Data Products", "Data Mesh", "Data Engineering"]
---

## From [Data Lake](/terms/data-lake) to Data Service

A data lake or lakehouse that stores petabytes of data is only valuable when the data is discoverable, accessible, and trustworthy for the consumers who need it. The challenge most data organizations face is not insufficient data but insufficient data accessibility: finding the right dataset requires knowledge of arcane table names, understanding join conditions between tables that were never documented, and trusting that the data's quality and freshness meet the requirements of the use case.

Data as a Service (DaaS) is the architectural pattern that addresses data accessibility by treating curated [data products](/terms/data-products) as formal services with defined interfaces, SLAs, ownership, and governance. A DaaS architecture applies software engineering's service-oriented thinking to data: just as a payment service exposes a well-defined API with documented endpoints, request/response schemas, and uptime SLAs, a data service exposes a well-defined data interface with documented schemas, freshness guarantees, and quality commitments.

The DaaS model has three core components: **data products** (the curated, governed data assets being served), **data service interfaces** (the APIs and endpoints through which consumers access the data), and **data service governance** (the ownership model, SLAs, and quality commitments that make data products trustworthy).

## Data Products in the Lakehouse

A data product is a curated data asset with clear ownership, documented schema, freshness SLA, and quality guarantees. In the Iceberg lakehouse, a data product is typically a Gold layer Iceberg table (or [Dremio](/terms/dremio) Virtual Dataset) that has been elevated to service status: it has a named owner (a team or individual accountable for its quality), a documented schema (field definitions and business semantics), a freshness SLA (e.g., updated within 1 hour of source data), and quality metrics (monitored and reported, with alert thresholds).

Data products are discoverable through a [data catalog](/terms/data-catalog) that surfaces their documentation, schema, lineage, quality metrics, and usage statistics. Consumers search the catalog for data products meeting their requirements and request access through a self-service workflow, without needing to know which engineering team built the underlying pipeline.

## DaaS Interfaces

The data service interface defines how consumers access the data product. Common DaaS interfaces include:

**SQL interface via Dremio**: The [Semantic Layer](/terms/semantic-layer) exposes data products as Virtual Datasets queryable through standard SQL, JDBC, ODBC, and [Arrow Flight](/terms/arrow-flight). Consumers query data products through their preferred BI tool without knowledge of the underlying Iceberg table structure.

**REST API**: A thin REST API wraps Iceberg table queries, exposing specific data slices as HTTP endpoints for application developers who prefer API access over SQL.

**Arrow Flight**: Dremio's Arrow Flight interface provides high-throughput, columnar data delivery for ML and Python analytics workflows, enabling data scientists to consume data products in Pandas or [Polars](/terms/polars) with minimal latency.

**Streaming interface**: Kafka topics serve as the streaming data product interface, providing event-by-event access to data products for stream processing consumers.

![Data as a Service Architecture](/images/terms/daas_architecture.png)

## DaaS and [Data Mesh](/terms/data-mesh-architecture)

Data as a Service is a foundational enabler of the [Data Mesh](/terms/data-mesh) architectural pattern. Data Mesh organizes data ownership around business domains (rather than centralized data engineering teams), with each domain owning and serving its own data products. The domain teams apply DaaS principles to their data assets: defining interfaces, SLAs, and governance for data products produced from their domain's operational systems.

In a Data Mesh DaaS architecture, the central data platform team provides the infrastructure (Iceberg lakehouse, Dremio Semantic Layer, data catalog, monitoring tooling) while domain teams own and operate their domain data products. The result is decentralized data ownership with centralized platform governance, combining the accountability of domain ownership with the economies of shared infrastructure.

## Learn More

If you want the long-form version, start with the [books by Alex Merced](/books). For a faster pass, there are short [video explainers](/videos).
