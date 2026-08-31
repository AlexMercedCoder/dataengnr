---
title: "Semi-Structured Data"
description: "Semi-structured data covers the flexible formats like JSON and XML that don't adhere to a rigid relational schema, and how modern lakehouses enable scalable analytical querying over nested hierarchies."
date: 2026-05-17
tags: ["Semi-Structured Data", "JSON", "Data Architecture", "Data Lakehouse", "Data Engineering"]
---

## Flexibility with Structure

In the spectrum of data types, semi-structured data occupies the massive middle ground between the rigid rows-and-columns of structured data and the completely schema-less chaos of [unstructured data](/terms/unstructured-data) (like raw text or images).

Semi-structured data contains internal tags or markers that separate semantic elements and enforce hierarchies of records and fields within the data, but it does not conform to the strict, pre-defined tabular structure associated with [relational databases](/terms/relational-databases). The most common formats are JSON (JavaScript Object Notation), XML (eXtensible Markup Language), and YAML.

A JSON document representing a customer order might contain an array of purchased items (where some items have a `warranty` field and others don't), nested address objects, and variable-length tags. This flexibility is perfect for application developers: a backend API can easily serialize a complex object to JSON and send it over the wire, and developers can add new fields to the JSON payload without running slow, locking database schema migrations.

However, this flexibility historically created nightmares for data engineers.

## Analytical Challenges of Semi-Structured Data

Traditional data warehouses require a rigid schema (defined columns with specific data types) before data can be loaded (schema-on-write). When an application development team adds a new nested field to their JSON event payload, the traditional ETL pipeline breaks. The data engineer must manually update the warehouse schema, rewrite the extraction logic to parse the new field, and restart the pipeline. 

Furthermore, querying deeply nested JSON arrays using standard SQL was notoriously difficult and computationally expensive, often requiring proprietary, non-standard functions (`JSON_EXTRACT_PATH`) that performed full table scans and parsed the JSON string at query time.

## Analyzing JSON in the Lakehouse

The modern [data lakehouse](/terms/data-lakehouse), powered by [Apache Iceberg](/terms/apache-iceberg), handles semi-structured data fundamentally differently, treating it as a first-class citizen rather than an annoying string to be parsed.

**[Schema Evolution](/terms/schema-evolution)**: When semi-structured JSON data lands in the Bronze layer, engines like [Apache Spark](/terms/apache-spark) or [Dremio](/terms/dremio) can automatically infer the schema ([schema-on-read](/terms/schema-on-read)). If the JSON structure changes (e.g., a new field appears), Iceberg's schema evolution capabilities update the table metadata without breaking the pipeline or rewriting existing data.

**Flattening and Shredding**: When pipelines move semi-structured data from the Bronze layer to the Silver layer, they "flatten" it. Complex nested arrays of objects (like the items in an order) are unnested (using functions like Spark's `explode()`) into distinct rows, and nested objects are flattened into distinct columns. 

**Native JSON Support**: Dremio natively understands JSON structures. Instead of string parsing at query time, Dremio can read complex JSON arrays directly and expose them visually to the user, allowing analysts to expand nested fields and promote them to standard relational columns with a click, bridging the gap between application flexibility and analytical rigor.

## Learn More

The [books by Alex Merced](/books) go further on this topic and the systems it sits inside. Short [video explainers](/videos) cover the same ground in under a minute each.
