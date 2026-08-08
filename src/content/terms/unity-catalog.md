---
title: "Unity Catalog"
description: "Databricks Unity Catalog is the unified governance layer for the Databricks Lakehouse Platform that provides centralized access control, auditing, and data discovery across all Databricks workspaces."
date: 2026-05-17
tags: ["Unity Catalog", "Data Governance", "Databricks", "Data Catalog", "Apache Iceberg"]
---

## Databricks Unified Governance

Unity Catalog is Databricks' centralized metadata and governance layer for the Databricks Lakehouse Platform. Before Unity Catalog (introduced in 2022), each Databricks workspace maintained its own isolated Hive Metastore, creating fragmented governance where access policies, data definitions, and audit logs were siloed per workspace. A user with access to three Databricks workspaces in the same organization faced three different catalogs, three different permission models, and three separate audit trails with no unified cross-workspace view.

Unity Catalog addresses this fragmentation by providing a single metastore that spans all Databricks workspaces within an account. Tables, views, functions, and models registered in Unity Catalog are discoverable and governable from any workspace that is attached to the catalog, with a consistent access control model and unified audit log across all workspaces.

Unity Catalog organizes data assets in a three-level namespace: catalog, schema (database), and table. This three-level hierarchy enables organizations to structure their data assets logically by environment (dev, staging, prod catalogs), by data domain (finance, marketing, operations catalogs within the prod environment), and by subject area (schemas within each domain catalog). Fine-grained access control can be applied at any level of the hierarchy, from catalog-wide grants to column-level policies on individual tables.

## Unity Catalog and [Apache Iceberg](/terms/apache-iceberg)

Unity Catalog implements the Apache [Iceberg REST Catalog](/terms/iceberg-rest-catalog) specification, making Unity Catalog tables accessible to any Iceberg-compatible engine through the standard REST API. [Apache Spark](/terms/apache-spark), [Apache Flink](/terms/apache-flink), [Trino](/terms/trino), [DuckDB](/terms/duckdb), and other Iceberg-compatible engines can connect to Unity Catalog as an Iceberg REST catalog and read or write Iceberg tables registered in Unity Catalog without requiring the Databricks runtime.

This open Iceberg REST Catalog support is a significant architectural evolution for Unity Catalog. Earlier versions of Unity Catalog used a proprietary [Delta Lake](/terms/delta-lake) format as the primary table format and provided limited interoperability with non-Databricks engines. The Iceberg REST Catalog implementation enables Unity Catalog to serve as a multi-engine governance layer, positioning it more directly in competition with [Apache Polaris](/terms/apache-polaris) as a vendor-neutral catalog option.

![Unity Catalog Architecture](/images/terms/unity_catalog_architecture.png)

## Unity Catalog vs. Apache Polaris

Unity Catalog and Apache Polaris serve similar functions as multi-engine Iceberg catalogs with RBAC governance and [credential vending](/terms/credential-vending), but differ in key architectural and strategic dimensions.

Unity Catalog is tightly integrated with the Databricks platform. While it exposes an Iceberg REST Catalog API for external engines, its primary user experience is within Databricks notebooks, jobs, and SQL Warehouse. The Unity Catalog UI, access control model, and operational tooling are deeply Databricks-native. Organizations building entirely on Databricks benefit from this integration; organizations using multiple cloud platforms or non-Databricks compute may find Unity Catalog's Databricks coupling limiting.

Apache Polaris is a fully open-source, vendor-neutral Iceberg REST Catalog with no runtime dependencies on any specific compute platform. Any engine that implements the Iceberg REST Catalog specification can use Polaris as its catalog without any Polaris-specific client code. Polaris is governed by the Apache Software Foundation and contributions come from multiple vendors, including Snowflake (which donated the initial implementation), Apple, and others, providing broader community governance than a single-vendor catalog.

For organizations with [Dremio](/terms/dremio)-centric lakehouse architectures, Apache Polaris provides the most direct integration path, with Polaris's credential vending model and Dremio's native Polaris connector enabling deep governance integration between the catalog and query layers.

## [Data Lineage](/terms/data-lineage) and Auditing in Unity Catalog

Unity Catalog captures column-level lineage automatically for SQL operations executed in Databricks, tracking which source columns contributed to each output column through transformations and joins. This automated column-level lineage is displayed in the Unity Catalog UI and available through the lineage API, providing comprehensive data provenance without any manual annotation.

The Unity Catalog system tables (accessible through SQL queries in Databricks) provide audit log records for all data access events, schema changes, and permission changes, enabling compliance reporting and security forensics from SQL queries rather than log file parsing.

## Learn More

For a longer treatment of this and the architecture around it, see the [books by Alex Merced](/books). You can also browse the rest of the [knowledge base](/terms).
