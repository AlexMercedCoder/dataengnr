---
title: "Vectorized Execution"
description: "Vectorized execution in analytical query engines is the CPU optimization technique that processes batches of column values using SIMD instructions, delivering orders-of-magnitude query performance improvements over row-at-a-time processing."
date: 2026-05-17
tags: ["Vectorized Execution", "Query Performance", "Apache Arrow", "Dremio", "Data Engineering"]
---

## Row-at-a-Time Is Slow

Traditional database query execution processes data row by row through an iterator model (the Volcano/iterator model): each query operator calls `next()` on its input to retrieve one row, applies its operation (filter, project, aggregate), and passes the result row to the parent operator. This approach is elegant and composable but CPU-inefficient.

Modern CPUs are optimized for SIMD (Single Instruction, Multiple Data) operations: a single CPU instruction that applies the same operation to 8, 16, or 32 values simultaneously using specialized vector registers (SSE, AVX2, AVX-512). Row-at-a-time processing leaves this SIMD capability completely unused: each `next()` call retrieves one value, applies one operation, and discards the result - never batching enough data to engage SIMD.

Vectorized execution replaces the row-at-a-time model with a batch processing model. Instead of processing one row at a time, vectorized operators process batches of 1,024-4,096 values (a "vector") for each column in a tight inner loop optimized for SIMD execution. A vectorized filter operator receives a batch of 2,048 values for a column, applies the comparison operation to all 2,048 values in a tight loop using SIMD instructions (16 comparisons per CPU instruction with AVX2), produces a 2,048-bit selection vector indicating which values passed the filter, and passes the selection vector to the next operator.

## Performance Impact

The performance difference between row-at-a-time and vectorized execution is dramatic for analytical workloads. Vectorized execution typically achieves 10-100x higher throughput per CPU core than row-at-a-time execution for scan, filter, and aggregation operations on columnar data.

The performance advantage comes from multiple sources: SIMD parallelism (multiple values per CPU instruction), better CPU branch prediction (tight inner loops with predictable branching are easier for CPU branch predictors), better CPU cache utilization (processing a batch of values for one column keeps relevant data in L1/L2 cache rather than thrashing between columns), and reduced function call overhead (fewer `next()` calls per unit of data processed).

[Apache Arrow](/terms/apache-arrow)'s columnar in-memory format is designed specifically for vectorized execution. Arrow stores each column as a contiguous buffer of typed values (int32 values in a contiguous int32 array), aligned for SIMD access. Query engines that operate on Arrow memory ([Dremio](/terms/dremio), DataFusion, [Polars](/terms/polars), [DuckDB](/terms/duckdb)) can apply vectorized SIMD operations directly to Arrow buffers without data copying or format conversion.

## Vectorized Execution in Dremio

Dremio's execution engine is built around vectorized execution on Apache Arrow memory. When Dremio executes a query against an Iceberg table, the Parquet reader deserializes column data directly into Arrow buffers (without intermediate row-oriented conversion), and all downstream operators (filters, projections, aggregations, joins) operate on these Arrow buffers using vectorized SIMD operations.

Dremio's C++ execution layer (Gandiva, based on LLVM) compiles query expressions to native machine code at runtime, enabling the generated filter and projection code to be optimized for the specific CPU instructions available on the execution hardware (AVX2 on modern Intel/AMD CPUs, NEON on ARM). This JIT compilation produces SIMD-optimized filter code that is functionally equivalent to hand-written C++ SIMD code, without requiring the query engine to manually implement every possible expression in SIMD.

The combination of Apache Arrow memory format, vectorized batch processing, and LLVM-compiled expression evaluation makes Dremio's execution engine among the fastest analytical query engines available, enabling sub-second queries on billion-row Iceberg tables that would take minutes in row-oriented execution models.

## Learn More

Several of the [books by Alex Merced](/books) cover this in depth, and a few of them are free. The rest of the [knowledge base](/terms) is worth a look too.
