---
title: "PyIceberg"
description: "PyIceberg is the official Apache Iceberg library for Python: it reads, writes and manages Iceberg tables through a catalog, with no JVM or Spark cluster needed."
date: 2026-05-17
tags: ["PyIceberg", "Python", "Apache Iceberg", "Data Engineering", "Data Science"]
---

## Iceberg Without the JVM

[Apache Iceberg](/terms/apache-iceberg/) was originally designed and implemented for JVM-based compute engines: [Apache Spark](/terms/apache-spark/), [Apache Flink](/terms/apache-flink/), [Trino](/terms/trino/), and [Dremio](/terms/dremio/). For years, working with Iceberg tables from Python required launching a Spark session, which meant JVM startup overhead, cluster configuration, and the full weight of Spark's distributed execution framework even for simple catalog operations or small data reads.

PyIceberg is the official Apache Iceberg Python library that eliminates the JVM requirement for Python-based Iceberg interactions. It implements the Iceberg table spec in Python, allowing Python applications to load Iceberg table metadata, read data files directly, manage schemas, and perform catalog operations without any JVM dependency.

PyIceberg is particularly valuable for data science workflows where analysts prefer to work in Python notebooks with pandas or [Polars](/terms/polars/) DataFrames, and for lightweight catalog management scripts that need to perform operations like creating tables, evolving partition specs, or running [snapshot expiration](/terms/snapshot-expiration/) without the overhead of a Spark cluster.

## Core PyIceberg Capabilities

**Catalog integration**: PyIceberg connects to any Iceberg catalog through its catalog API. It ships native support for REST catalogs (including Apache Polaris, Apache Gravitino and [Unity Catalog](/terms/unity-catalog/) through their REST endpoints), SQL catalogs, Hive Metastore, AWS Glue and DynamoDB, plus an in-memory catalog for tests, all behind a common Python interface. Other catalogs need a custom catalog implementation. Connecting to a Polaris catalog requires only a few lines of configuration: the catalog URL, the OAuth2 credentials, and the catalog name.

**Table metadata access**: Once connected to a catalog, PyIceberg loads table metadata directly from the metadata JSON files. Schema, partition spec, snapshots, and properties are all accessible as Python objects. An analyst can inspect the current schema, browse the snapshot history, check partition spec evolution, and read file statistics without executing a single SQL query.

**Data reading with Arrow**: PyIceberg's table scan API reads Parquet data files using the pyarrow Parquet reader and returns results as [Apache Arrow](/terms/apache-arrow/) Tables. The scan API supports filter predicates, column selection, and snapshot selection for time travel. Arrow Tables hand off to pandas, Polars, [DuckDB](/terms/duckdb/), and other Python analytical libraries with little or no copying.

**Write support**: Current releases (0.12.0 as of October 2026) write as well as read. The table API covers append, overwrite, filter-based delete and upsert of Arrow Tables, each of which writes Parquet files and commits a new snapshot to the catalog. Schema evolution (`update_schema`), partition evolution (`update_spec`) and snapshot expiration (`table.maintenance.expire_snapshots()`) are also available from Python.

![PyIceberg Architecture](/images/terms/pyiceberg_architecture.webp)

## PyIceberg with DuckDB and Dremio

A powerful pattern for lightweight analytics combines PyIceberg's table scan capabilities with DuckDB's SQL engine. PyIceberg loads the Iceberg table scan result as an Arrow Table in memory, and DuckDB queries the Arrow Table using SQL. This combination provides SQL analytical capabilities on Iceberg data without Spark or Dremio, making it ideal for data scientists who prefer local Python environments for exploratory analysis.

For production lakehouse interactions, PyIceberg complements Dremio by handling catalog management operations in Python scripts and Airflow DAGs. Dremio handles the high-performance SQL querying of the resulting Iceberg tables through [Arrow Flight](/terms/arrow-flight/). Python scripts use PyIceberg to create new tables, run snapshot expiration on completed batch partitions, and query table metadata programmatically, while Dremio serves as the governed SQL query interface for analysts and BI tools.

The combination of PyIceberg for catalog management, DuckDB for local Python analytics, and Dremio for production governed SQL access represents the complete Python-friendly Iceberg lakehouse stack.

## Learn More

The [books by Alex Merced](/books/) go further on this topic and the systems it sits inside. Short [video explainers](/videos/) cover the same ground in under a minute each.
