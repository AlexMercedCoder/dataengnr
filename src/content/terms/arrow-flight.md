---
title: "Arrow Flight"
description: "A guide to Apache Arrow Flight, the high-performance data transport protocol built on gRPC and the Arrow columnar format that enables ultra-fast, network-saturating data transfer between analytical systems."
date: 2026-05-17
tags: ["Arrow Flight", "Apache Arrow", "Data Transport", "Performance", "Dremio"]
---

# Beyond JDBC: The Transport Bottleneck

For decades, analytical systems communicated query results through JDBC and ODBC protocols, standards designed in the early 1990s for row-oriented relational database communication. These protocols serialize query result rows into a row-oriented wire format, transmit them across the network, and deserialize them on the client side into whatever in-memory representation the receiving application uses.

This serialization-transmission-deserialization pipeline introduces serious performance overhead for analytical workloads. A query against a Dremio table returning 100 million rows of financial data must serialize those rows from Dremio's internal Arrow columnar buffers into the JDBC row-oriented wire format, transmit the serialized bytes across the network, and then deserialize them on the client side from JDBC's row format into whatever pandas or Spark structure the application needs. The serialization and deserialization steps alone can consume more CPU time than the query execution itself.

Arrow Flight was developed by the Apache Arrow community to eliminate this overhead entirely. Rather than converting query results from columnar Arrow format to a row-oriented wire format and back, Arrow Flight streams results in the native Arrow columnar binary format across the network, preserving the columnar layout end-to-end from the query engine to the client application.

## The Arrow Flight Protocol

Arrow Flight is implemented on top of gRPC, Google's high-performance RPC framework built on HTTP/2. gRPC provides bidirectional streaming, efficient binary framing, and TLS encryption as built-in capabilities. Arrow Flight defines a set of gRPC service methods that query engines implement as Flight servers and client applications use as Flight clients.

The core Flight workflow has three phases. The client calls `GetFlightInfo` with a flight descriptor (which can be a SQL query string, a dataset path, or a custom command). The server returns a `FlightInfo` object that describes the available data, including a set of endpoints (server addresses and access tokens) where the data can be fetched. The client calls `DoGet` on each endpoint to retrieve Arrow record batch streams. This multi-endpoint design enables parallel data retrieval: a distributed query engine like Dremio can return a FlightInfo with multiple endpoints representing different partitions of the result set, and the client can fetch these partitions in parallel, saturating the network bandwidth for maximum throughput.

The `DoPut` method enables clients to write Arrow data batches to a server, supporting the reverse direction: a client pushing data into a Flight server for ingestion or processing.

![Arrow Flight Architecture](/images/terms/arrow_flight_architecture.png)

## Dremio's Arrow Flight Server

Dremio was among the first commercial data platforms to implement Arrow Flight as its primary client query interface. Dremio's Flight server accepts SQL queries from Flight clients, executes them using Dremio's distributed query engine, and streams the results back to the client in Arrow columnar format. The entire data path from Dremio's executor nodes to the client occurs in Arrow format, with no intermediate format conversion.

Python clients connecting to Dremio through the `pyarrow.flight` library or the `dremio-simple-query` Python library receive query results as Arrow Tables directly. These Arrow Tables can be passed directly to pandas (`df = arrow_table.to_pandas()`), Polars (`polars.from_arrow(arrow_table)`), or DuckDB (`duckdb.execute("SELECT * FROM ?", [arrow_table])`), all with zero data copying because these libraries natively consume Arrow memory.

The throughput difference between Arrow Flight and JDBC for large result sets is dramatic. Benchmarks consistently show Arrow Flight delivering 3-10x higher data transfer throughput than JDBC for the same query workload, with the gap widening as result set size increases. For data science workflows that regularly transfer millions of rows between Dremio and Python notebooks, this throughput improvement translates to meaningfully shorter iteration cycles.

## Arrow Flight SQL

Arrow Flight SQL extends the base Flight protocol with a standard set of SQL interaction semantics: prepared statement creation and execution, schema querying, catalog metadata inspection. Flight SQL provides a complete SQL database client interface using Arrow Flight as the transport, positioning it as a high-performance replacement for JDBC and ODBC in modern analytical environments.

Dremio supports Flight SQL, allowing any Flight SQL-compatible client library to connect to Dremio with standard SQL semantics and receive results at Arrow Flight throughput, without needing Dremio-specific client code.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
