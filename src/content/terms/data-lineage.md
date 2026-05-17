---
title: "Data Lineage"
description: "A guide to data lineage in the modern lakehouse, the ability to track the complete origin, transformation history, and downstream usage of every data asset for debugging, compliance, and trust."
date: 2026-05-17
tags: ["Data Lineage", "Data Governance", "Data Quality", "Metadata Management"]
---

# The Root Cause Problem

When an analyst reports that the revenue figures in the executive dashboard are wrong, the data engineering team faces a familiar and frustrating investigation. The revenue number flows from a Gold-layer aggregated fact table, which was produced by a dbt transformation, which read from a Silver-layer cleansed table, which was populated by an ETL pipeline, which extracted from the operational CRM system. The error could have been introduced at any of these five stages.

Without data lineage, diagnosing where the error occurred requires manual inspection of each stage, reading pipeline code, comparing input and output record counts, and interviewing the engineers who built each component. This investigation can consume days of engineering time. For every day the wrong number sits in the executive dashboard, business decisions are being made on incorrect information.

Data lineage is the capability to automatically track and document the complete ancestry of every data asset: where it came from, what transformations it passed through, what other assets were used to produce it, and which downstream assets and reports depend on it. With comprehensive lineage, the investigation collapses from days to minutes: the engineer pulls up the lineage graph for the revenue fact table, traces backward to find the transformation that produced incorrect results, and identifies the bug in the SQL logic or the data quality issue in the upstream source.

## Column-Level vs. Table-Level Lineage

Data lineage exists at multiple levels of granularity, and the distinction between table-level and column-level lineage is significant for analytical and governance purposes.

**Table-level lineage** tracks which tables are derived from which other tables. It shows that `gold.daily_revenue_summary` was produced by transforming `silver.transactions_cleansed`, which was derived from `bronze.crm_orders_raw`. This level of lineage is sufficient for understanding high-level data pipeline dependencies, impact analysis (which downstream tables would be affected if the `silver.transactions_cleansed` table were changed), and pipeline orchestration.

**Column-level lineage** is far more granular and analytically powerful. It tracks which specific source columns contributed to each target column through transformations. It documents that the `net_revenue` column in `gold.daily_revenue_summary` was computed from `gross_amount - discount_amount - tax_amount` in `silver.transactions_cleansed`, and that `gross_amount` was sourced from the `total` column in `bronze.crm_orders_raw`, which originated from the `OrderTotal` field in the Salesforce CRM operational system.

Column-level lineage is essential for privacy compliance workflows. When a GDPR right-to-deletion request arrives for a specific customer, the compliance team must identify every table and every column across the entire lakehouse that contains data derived from that customer's PII. Table-level lineage identifies which tables contain customer data; column-level lineage identifies the specific derived columns that must be audited and potentially deleted.

![Data Lineage Graph](/images/terms/data_lineage_graph.png)

## Automated vs. Manual Lineage

Lineage can be captured through manual documentation or automated extraction. Manual documentation requires engineers to explicitly record the dependencies between data assets in a catalog or wiki. This approach is labor-intensive and invariably becomes stale as pipelines evolve without corresponding documentation updates.

Automated lineage extraction parses pipeline code, SQL queries, and API calls at execution time to infer lineage relationships without any manual documentation effort. dbt generates column-level lineage automatically from its transformation models, producing a DAG (Directed Acyclic Graph) that shows the complete dependency chain from source tables through every transformation model. Apache Spark and Apache Flink can emit OpenLineage events (a standard open format for lineage metadata) that are consumed by lineage servers to build the lineage graph automatically.

The OpenLineage specification, governed by the Linux Foundation, defines a standard JSON event structure for capturing lineage from any compute system. Tools that emit OpenLineage events (dbt, Spark, Flink, Airflow) can feed a central lineage server like Marquez or DataHub, which aggregates the lineage events into a queryable, navigable lineage graph.

## Lineage in Dremio

Dremio's Semantic Layer provides automatic lineage tracking for the virtual datasets built on top of Iceberg tables. When a data engineer creates a virtual dataset in Dremio that joins two physical Iceberg tables and applies a transformation, Dremio automatically records the lineage relationship between the virtual dataset and its source tables. This lineage is visible in Dremio's catalog interface, allowing engineers and governance teams to trace the ancestry of any virtual dataset back to its raw data sources.

Dremio's Job History records the exact SQL query executed for every analytical query run through the platform, providing an audit trail that supports both lineage reconstruction and regulatory compliance demonstrations. Combined with Iceberg's Time Travel capability, which preserves the historical state of the source data, Dremio's query history enables organizations to reconstruct exactly what data was used to produce specific reports, satisfying the most stringent regulatory audit requirements.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
