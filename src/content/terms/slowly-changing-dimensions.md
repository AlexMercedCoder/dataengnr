---
title: "Slowly Changing Dimensions (SCD)"
description: "A guide to Slowly Changing Dimensions, the patterns for tracking historical attribute changes in data warehouse Dimension tables for accurate analytical reporting."
date: 2026-05-17
tags: ["Data Modeling", "SCD", "Data Warehouse", "Dimensional Modeling"]
---

# The Problem of Changing Reality

Data warehouses are built on Dimension tables describing customers, products, employees, and stores. These descriptions feel permanent but business reality is not static. Customers move to new cities. Products are reclassified into new categories. Employees are reassigned to different regions.

Each change creates an analytical dilemma. When a customer moves from Boston to Chicago and the Customer Dimension is updated, every historical transaction for that customer suddenly appears to originate from Chicago, even if those transactions occurred while the customer lived in Boston. Executives reviewing historical Q3 sales by city see inaccurate results because the report reflects current addresses rather than those accurate when each transaction occurred.

Ralph Kimball formalized techniques for managing these changes under the term Slowly Changing Dimensions (SCD), recognizing that different business requirements call for different approaches. The term "slowly" acknowledges that these changes happen less frequently than transactional events but must still be handled systematically.

## SCD Type 0: Retain Original

SCD Type 0 is the simplest approach: once a Dimension attribute is set, it never changes regardless of source system updates. This approach is appropriate for attributes where the original state is analytically significant.

A common example is `original_acquisition_channel`: the marketing channel through which a customer was first acquired. Marketing analysts want to analyze long-term customer value by original acquisition channel, so preserving the original value is intentional. Type 0 requires no special implementation beyond standard insert-only loading.

## SCD Type 1: Overwrite

SCD Type 1 simply overwrites the existing Dimension attribute with the new value. When a customer's address changes from Boston to Chicago, the Customer Dimension row is updated in place. No historical record of the previous address is retained.

This approach is appropriate when historical accuracy for the attribute is not analytically required, such as correcting data entry errors or maintaining always-current contact information. The significant downside is that it retroactively changes historical reporting, making it impossible to reproduce historical reports exactly. This is problematic for auditing and regulatory compliance.

## SCD Type 2: Add a Row

SCD Type 2 is the most analytically powerful and widely implemented SCD pattern. Rather than overwriting the existing Dimension row, Type 2 adds a new row to the Dimension table for each change, preserving complete attribute history.

When a customer's city changes, the existing row is retained with its original values. Two new columns are updated: `valid_to` is set to the current date, and `is_current` is set to False. A new row is inserted with `city = 'Chicago'`, `valid_from` set to the current date, `valid_to` set to a far-future sentinel date (December 31, 9999), and `is_current` set to True.

Each row in the Fact table references a specific Dimension surrogate key. Historical Fact rows recorded when the customer lived in Boston still point to the Boston version of the Customer Dimension row. New Fact rows recorded after the move point to the Chicago version. Historical reporting is completely accurate because the Fact-to-Dimension join returns the version active at the time of the transaction.

![SCD Type 2 Row Versioning](/images/terms/scd_type2_versioning.png)

### Implementing SCD Type 2 with Apache Iceberg

Apache Iceberg's MERGE INTO statement provides the ideal mechanism for Type 2 in a modern lakehouse. A single MERGE statement atomically executes the full Type 2 update: it matches the existing current Dimension row by business key, updates its `valid_to` and `is_current` columns, and simultaneously inserts the new version row. Because Iceberg executes MERGE with ACID guarantees, there is no window where a partial update is visible to readers.

## SCD Type 3: Add a Column

SCD Type 3 preserves limited history by adding new columns rather than new rows. When a customer's city changes, both `previous_city` and `current_city` columns exist in the Dimension. Type 3 is appropriate only when exactly one historical version of an attribute is needed and the business wants to report on both current and immediately previous values without join complexity.

The limitation is that Type 3 can track only one level of history per attribute. If a customer moves three times, only the most recent previous address is retained. Earlier addresses are permanently lost.

## SCD Type 4: Historical Table

SCD Type 4 separates current and historical data into two physical tables. A current Dimension table contains only the most recent version of each entity, while a separate historical Dimension table stores all previous versions with effective date columns. Queries against the current Dimension table are fast because every row is by definition the current version, with no need to filter on `is_current`.

## Choosing the Right SCD Strategy

Real-world dimensional models typically apply different SCD types to different attributes within the same Dimension table. A Customer Dimension might apply Type 1 to `email_address`, Type 2 to `geographic_region`, and Type 0 to `original_acquisition_channel`. Dremio's Semantic Layer can abstract these SCD complexities from business users through Virtual Datasets that expose simple, filtered views without requiring analysts to understand the underlying SCD versioning mechanics.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
