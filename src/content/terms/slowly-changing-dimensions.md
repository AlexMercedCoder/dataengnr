---
title: "Slowly Changing Dimensions (SCD)"
description: "A guide to Slowly Changing Dimensions (SCD), the data warehouse design patterns for tracking how dimension attribute values change over time, from simple overwrites to full historical preservation for accurate point-in-time analysis."
date: 2026-05-17
tags: ["Slowly Changing Dimensions", "SCD", "Dimensional Modeling", "Data Warehouse", "Data Engineering"]
---

# When Dimension Data Changes

Dimension tables in a star schema describe the context of business events: who, what, where. These descriptions change over time. A customer moves to a different city. A product is reclassified into a new category. A salesperson transfers to a different region. A store is renamed or rebranded.

How the data warehouse handles these changes determines the accuracy of historical analysis. If a customer's city changes from "New York" to "Austin" and the customer record is simply overwritten with the new city, all historical sales for that customer will appear to have come from Austin, even those that actually occurred when the customer lived in New York. A regional revenue analysis for New York City will undercount historical sales because some genuinely New York sales are now attributed to Austin.

Slowly Changing Dimensions (SCD) are the design patterns for managing dimension attribute changes in ways that preserve historical accuracy while remaining queryable through standard SQL. The three primary SCD types represent a tradeoff between simplicity, storage cost, and historical accuracy.

## SCD Type 1: Overwrite

SCD Type 1 simply overwrites the old attribute value with the new value. When a customer's city changes from New York to Austin, the city column in the customer dimension row is updated to Austin. No history of the old city value is preserved.

Type 1 is appropriate for correcting data quality errors (the customer's city was misspelled and is being corrected) or for attributes where historical accuracy is irrelevant (a customer's preferred language, which is only meaningful in its current value).

Type 1 is not appropriate for attributes where historical accuracy matters for analysis. After a Type 1 update, all historical fact rows referencing this customer will appear to be associated with the new attribute value, regardless of when the transaction actually occurred.

Type 1 implementation in Iceberg: `UPDATE customer_dim SET city = 'Austin' WHERE customer_id = 12345`. Iceberg's Merge-on-Read delete files handle this efficiently without rewriting the entire Parquet file.

## SCD Type 2: Add New Row

SCD Type 2 preserves full history by adding a new dimension row for each attribute change, with date range columns indicating when each version of the dimension record was valid. The old row is closed (end_date set to yesterday, is_current set to false) and a new row is inserted with the new attribute values, today as start_date, and is_current set to true.

When a customer moves from New York to Austin, the customer dimension table contains two rows: the New York row (valid from 2020-01-01 to 2024-06-14, is_current=false) and the Austin row (valid from 2024-06-15 to 9999-12-31, is_current=true). Historical fact rows referencing the surrogate key of the New York row correctly show New York as the customer's city. Fact rows after the move reference the Austin surrogate key.

Point-in-time correct analysis joins fact rows to the dimension version valid at the time of the fact event: `JOIN customer_dim c ON f.customer_key = c.customer_key WHERE f.transaction_date BETWEEN c.start_date AND c.end_date`.

![SCD Types Architecture](/images/terms/scd_types.png)

## SCD Type 3: Add New Column

SCD Type 3 adds new columns to the dimension row to retain a limited history of attribute changes, typically the previous value and current value. A customer dimension with Type 3 for city has columns: `current_city = 'Austin'`, `previous_city = 'New York'`, `city_change_date = '2024-06-15'`.

Type 3 is rarely used in practice because it only retains one historical value and requires schema changes for each new attribute tracked. It is useful for specific scenarios where only the immediate prior state matters.

## SCD Implementation in the Iceberg Lakehouse

All three SCD types are implemented in Iceberg lakehouses through `MERGE INTO` operations. A dbt model with incremental materialization handles the SCD logic: matching incoming source records to existing dimension rows on the natural key, detecting changes, closing old rows (Type 2), and inserting new rows.

Iceberg's ACID MERGE INTO semantics ensure that the multi-row Type 2 update (updating the old row and inserting the new row) is atomic, maintaining dimension table consistency throughout the operation.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
