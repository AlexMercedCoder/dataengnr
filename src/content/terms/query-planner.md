---
title: "Query Planner"
description: "A guide to the query planner, the intelligent software component within a database engine that translates a user's SQL string into the most efficient physical execution strategy."
date: 2026-05-17
tags: ["Query Planner", "Database Internals", "Apache Calcite", "Data Engineering", "Performance Optimization"]
---

## The Brains of the Database

When a data analyst writes a SQL query, they are writing declarative code. They are telling the database *what* data they want (e.g., "Give me the sum of sales for customers in New York"). They are explicitly *not* telling the database *how* to get that data.

The database could execute that query in dozens of different ways. It could scan the `sales` table first, then filter by New York. Or, it could scan the `customers` table, find the New York customers, and then look up their specific sales. It could perform a Hash Join, a Merge Join, or a Nested Loop Join.

The Query Planner (also known as the Query Optimizer) is the critical component of the database engine that decides the "how." Its job is to take the declarative SQL string and translate it into a physical Execution Plan-a step-by-step tree of algorithmic operations that the compute nodes will physically execute.

## How the Planner Works

The journey from SQL to execution happens in several stages:

**1. Parsing**: The planner reads the SQL string and checks for syntax errors, converting it into an Abstract Syntax Tree (AST).

**2. Logical Planning**: The planner checks the catalog to ensure the tables and columns actually exist. It then applies logical optimizations that are universally true. For example, if you write `SELECT * FROM sales WHERE 1=0`, the logical planner realizes this will always return nothing, and optimizes the query away entirely. It also performs [Predicate Pushdown](/terms/predicate-pushdown) (moving `WHERE` filters as close to the data source as possible).

**3. Physical Planning (Cost-Based Optimization)**: This is the hardest part. The planner generates multiple different ways to physically execute the logical plan. Should it broadcast the smaller table across the network? Should it sort the data first? To decide, it uses a [Cost-Based Optimizer](/terms/cost-based-optimizer) (CBO) to estimate the CPU, memory, and network cost of each option, ultimately selecting the path with the lowest overall cost.

![Query Planner Architecture](/images/terms/query_planner.png)

## [Apache Calcite](/terms/apache-calcite): The Open Standard

Historically, every database vendor (Oracle, Teradata, SQL Server) built their own proprietary, highly guarded query planner. 

In the modern open data ecosystem, Apache Calcite has emerged as the industry standard open-source query planner. Instead of building an optimizer from scratch, modern analytical engines (including [Dremio](/terms/dremio), [Apache Flink](/terms/apache-flink), and Apache Hive) use Calcite as their "brain." 

Calcite provides the SQL parser and the complex mathematical rule engine for optimizing queries, allowing these platforms to focus their engineering efforts on the physical execution engines (processing the data) while relying on Calcite to find the most efficient mathematical path.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
