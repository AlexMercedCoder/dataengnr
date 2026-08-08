---
title: "Iceberg REST Catalog"
description: "The Apache Iceberg REST Catalog specification is the open standard HTTP API that enables any compute engine to interact with any catalog implementation through a common, vendor-neutral interface."
date: 2026-05-17
tags: ["Iceberg REST Catalog", "Apache Iceberg", "Catalog", "Open Standards", "Data Lakehouse"]
---

## The Universal Catalog Interface

One of the most significant architectural challenges in building multi-engine data lakehouses is catalog fragmentation. Every compute engine that reads and writes [Apache Iceberg](/terms/apache-iceberg) tables needs to know which metadata files are current for each table. Historically, each engine implemented its own catalog integration: a Spark-native Hive catalog connector, a Presto/[Trino](/terms/trino) catalog module, a Flink Iceberg catalog plugin. Each of these integrations required engine-specific configuration and maintained engine-specific catalog state management code, multiplying the integration surface area.

The Apache Iceberg REST Catalog specification (introduced in Iceberg 0.14) addresses this fragmentation by defining a standardized HTTP API that any catalog implementation can serve and any compute engine can consume. Rather than each engine implementing a bespoke integration with each catalog, engines implement a single REST Catalog client that works with any compliant catalog server. Catalog implementations ([Apache Polaris](/terms/apache-polaris), [Apache Gravitino](/terms/apache-gravitino), [Unity Catalog](/terms/unity-catalog), AWS Glue) implement the REST server side once and become immediately compatible with all REST Catalog-enabled engines.

This is the same architectural pattern that made JDBC successful for database connectivity: a single standard interface that decouples client applications from specific database implementations. The REST Catalog API is the JDBC of the Iceberg ecosystem.

## Core REST Catalog Operations

The Iceberg REST Catalog API covers the complete lifecycle of catalog interaction through a set of HTTP endpoints.

**Namespace management**: Endpoints for creating, listing, and deleting namespaces (databases or schemas) within the catalog. Namespaces organize tables hierarchically and provide the unit of access control granularity.

**Table management**: Endpoints for creating tables (`POST /v1/{prefix}/namespaces/{namespace}/tables`), listing tables, loading table metadata (`GET /v1/{prefix}/namespaces/{namespace}/tables/{table}`), committing table updates (atomically updating the current metadata pointer), and dropping tables.

**Table load with [credential vending](/terms/credential-vending)**: The table load endpoint returns not only the table's current metadata file location but also the vended storage credentials that the engine should use to access the data files. This integrated credential vending eliminates the need for engines to manage separate storage authentication outside the catalog interaction.

**Views**: The REST Catalog specification includes support for managed views (named SQL query definitions stored in the catalog), enabling engines to discover and execute catalog-managed views through the same REST API as tables.

![Iceberg REST Catalog Architecture](/images/terms/iceberg_rest_catalog.png)

## The Atomic Commit Protocol

A critical function of the REST Catalog API is managing concurrent writes safely. Multiple compute engines might attempt to commit new snapshots to the same Iceberg table simultaneously. The REST Catalog's commit endpoint implements [optimistic concurrency control](/terms/optimistic-concurrency-control): a commit request includes the expected current metadata version (the version the engine read before making its changes). If the catalog's actual current version matches the expected version, the commit succeeds and the new version is stored. If another writer committed a new version between when the engine read the current metadata and when it attempts to commit, the commit fails and the engine must retry with the refreshed current version.

This optimistic concurrency control ensures that the Iceberg table's metadata remains consistent even under concurrent writes from multiple engines, without requiring distributed locks that would serialize all write operations.

## Apache Polaris as the Reference Implementation

Apache Polaris implements the full Iceberg REST Catalog specification and serves as the reference implementation that demonstrated the API's completeness for production use cases. Polaris extends the base REST Catalog spec with service catalog features including RBAC access control, credential vending integration with cloud IAM services, multi-catalog namespace organization, and OAuth2 authentication. [Dremio](/terms/dremio)'s native Polaris connector uses the REST Catalog API to integrate with Polaris, receiving table metadata and vended credentials through the standard API without any Polaris-specific client code.

## Learn More

For a longer treatment of this and the architecture around it, see the [books by Alex Merced](/books). You can also browse the rest of the [knowledge base](/terms).
