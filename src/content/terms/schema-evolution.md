---
title: "Schema Evolution"
description: "A comprehensive guide to schema evolution in Apache Iceberg, the capability to safely add, rename, drop, or reorder columns in a lakehouse table without breaking existing readers or requiring data rewrites."
date: 2026-05-17
tags: ["Apache Iceberg", "Schema Evolution", "Data Engineering", "Data Lakehouse"]
---

# The Schema Compatibility Crisis

In traditional data systems, changing a table's schema is one of the most disruptive operations in data engineering. Adding a new column to a Hive table requires coordinating with every upstream writer and downstream reader simultaneously. Renaming a column breaks every SQL query, every BI dashboard, every ETL pipeline, and every data science notebook that references the old column name. Dropping a column requires ensuring no downstream consumer still depends on it, a task that is practically impossible to verify in large organizations with dozens of teams and hundreds of dashboards.

These schema rigidity problems exist because traditional data lake formats store schema information in an external catalog (like the Hive Metastore) rather than with the data files themselves. When the catalog schema changes, every existing data file still uses the old schema. The mismatch between the catalog definition and the physical file structure creates compatibility errors that corrupt query results or raise exceptions.

Apache Iceberg's schema evolution implementation resolves this crisis through a fundamental architectural choice: schemas are managed through column IDs rather than column names. Every column in an Iceberg table is assigned a unique integer ID when it is first created, and this ID is stored within the data files themselves alongside the column data. The column name is just a display alias; the column ID is the stable identity. This design allows column names to change freely without breaking the mapping between the schema definition and the physical data.

## Column ID-Based Evolution

When an Iceberg table is created with three columns (id, name, email), Iceberg assigns them column IDs 1, 2, and 3 respectively. These IDs are embedded in the Parquet schema of every data file written to the table. If the `name` column is later renamed to `full_name`, Iceberg updates the table schema to record that column ID 2 now has the display name `full_name`. Existing Parquet files still contain the data for column ID 2; they simply read it under the new display name `full_name`. No data files need to be rewritten, and no data is lost or misaligned.

This column ID stability is the foundation for all other evolution operations. Because the ID-to-data mapping is always consistent, readers of any age can correctly interpret data files of any age, even across multiple rounds of schema changes.

## Safe Schema Changes in Iceberg

Apache Iceberg categorizes schema changes into safe (backward-compatible) and potentially unsafe changes, and enforces safety rules through its schema evolution API.

**Adding a new column** is always safe. Existing data files simply do not have data for the new column; readers return null for new column values when reading old files, and new data files include the new column's data normally. This consistency allows a mixed population of old and new files to coexist in the same table indefinitely without compatibility errors.

**Renaming an existing column** is safe due to the column ID system. The column ID remains stable; only the display name changes. All existing data files continue to be read correctly through the new name.

**Dropping a column** requires care. Iceberg allows column drops, but makes old data files that contained the dropped column readable: readers simply ignore the data stored under the dropped column's ID. The data is not physically deleted from the files; it is just no longer accessible through the schema. Physical removal of the dropped column data requires running a compaction that rewrites the affected data files.

**Reordering columns** is safe: Iceberg stores columns by ID in data files, not by position, so changing the logical ordering of columns in the schema does not require data file rewrites.

**Widening numeric types** (promoting an `int` column to a `long`, or a `float` to a `double`) is safe because the larger type can represent all values of the smaller type.

**Narrowing numeric types** (converting a `long` to an `int`) is not allowed, because existing data values might overflow the narrower type.

![Iceberg Schema Evolution](/images/terms/iceberg_schema_evolution.png)

## Nested Type Evolution

Apache Iceberg supports evolution of complex nested types including structs, maps, and lists, not just flat column schemas. This nested evolution capability is essential for organizations storing semi-structured data (like JSON-derived schemas with nested objects and arrays) as Iceberg tables.

Adding a new field to a struct column is safe and follows the same column ID mechanism: the new field receives a new column ID and existing files return null for that field when queried. Adding a new key-value type to a map is safe. Evolving the element type of a list follows the same type promotion rules as scalar column evolution.

This nested evolution capability makes Iceberg practical for event schemas and API response schemas, which are notoriously prone to organic growth as product features are added and new attributes are introduced.

## Practical Impact: Zero-Disruption Schema Migration

The practical business impact of Iceberg schema evolution is zero-disruption schema migrations. In a traditional data warehouse, a schema change requires a scheduled maintenance window: all writers are paused, the migration is applied, all downstream consumers are updated, and the system is brought back online. This process takes hours and requires coordination across multiple teams.

With Iceberg, schema changes are metadata operations that complete in milliseconds. The data engineering team applies the change during normal business hours without any pipeline downtime. Writers automatically begin including the new column in subsequent writes. Existing readers automatically see the new column returning null for historical data and populated values for new data. There is no maintenance window, no consumer update coordination, and no pipeline downtime.

Dremio's Semantic Layer propagates Iceberg schema evolution automatically. When a new column is added to an Iceberg table, Dremio detects the schema change on its next metadata refresh and makes the new column available in the virtual datasets built over that table, without any manual schema update required from the data engineering team.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
