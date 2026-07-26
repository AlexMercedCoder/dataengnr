---
title: "Apache Calcite"
description: "A guide to Apache Calcite, the open-source query planning framework that provides SQL parsing, validation, relational algebra, and cost-based optimization capabilities used by Hive, Flink, Druid, Trino, and Dremio as the foundation for their query planners."
date: 2026-05-17
tags: ["Apache Calcite", "Query Planning", "SQL", "Data Engineering", "Open Source"]
---

## The [Query Planner](/terms/query-planner) Behind the Query Planners

When a SQL query is submitted to an analytical engine, a complex series of transformations converts the human-readable SQL text into an efficient physical execution plan. The query must be parsed (SQL text to an abstract syntax tree), validated (verify table and column names exist, check type compatibility), converted to a relational algebra expression (logical plan), optimized (apply algebraic transformations to simplify and reorder operations), and finally converted to a physical execution plan (choosing specific algorithms for each operator: nested loop join vs. hash join vs. sort-merge join).

This query planning infrastructure is complex to build and maintain. Apache Calcite is the open-source project that provides this query planning framework as a reusable library, allowing data systems to focus on their execution engines rather than reimplementing query parsing, validation, and optimization from scratch.

Apache Calcite is used by an impressive list of systems as their query planning foundation: Apache Hive (SQL-on-Hadoop), [Apache Flink](/terms/apache-flink) (streaming SQL), Apache Druid (real-time OLAP), [Apache Kafka](/terms/apache-kafka) (KSQL), Apache Kylin (OLAP cube management), Lingual (Cascading SQL), and many commercial systems. This wide adoption makes Calcite the de facto standard query planning framework for JVM-based analytical systems.

## Calcite's Architecture

**SQL Parser**: Calcite's SQL parser converts SQL text into an abstract syntax tree (AST) using a JavaCC-generated parser. The parser is configurable, supporting SQL:2003 standard syntax and many database-specific extensions through Calcite's dialect system.

**SQL Validator**: The validator resolves table and column references against a schema metadata provider (which data systems plug in to connect Calcite to their metadata store), validates data type compatibility for operators, and resolves function references.

**Relational Algebra**: Calcite's core abstraction is a tree of relational algebra operators (RelNode): TableScan, Filter, Project, Join, Aggregate, Sort, Union, etc. The logical plan is expressed as a tree of these operators, which can be transformed and optimized without knowledge of the specific SQL syntax that produced them.

**[Cost-Based Optimizer](/terms/cost-based-optimizer) (CBO)**: Calcite's Volcano/Cascades-based cost-based optimizer applies algebraic transformation rules (rule sets) to explore equivalent logical plans and selects the most efficient plan based on cost estimates. Rules can reorder joins, push filters down ([predicate pushdown](/terms/predicate-pushdown)), eliminate redundant operators, and apply many other algebraic transformations.

**Pluggable Rules**: The CBO's rule-based optimization is extensible: data systems add custom rules that match patterns in the relational algebra tree and propose transformations. A custom rule for Iceberg might match a TableScan + Filter pattern and propose a transformed plan that adds an IcebergScan operator with partition pruning applied at the metadata level.

![Apache Calcite Architecture](/images/terms/calcite_architecture.png)

## Calcite in Flink and [Dremio](/terms/dremio)

Apache Flink's Table API and SQL interface are built on top of Apache Calcite. Flink SQL queries go through Calcite's parser, validator, and optimizer before being translated to Flink's physical execution operators. Calcite's optimizer applies a combination of rule-based optimization (rule sets for filter pushdown, join reordering) and cost-based optimization (cardinality estimation for join ordering decisions).

Dremio's query planner builds on Calcite's foundations, extending it with Dremio-specific optimization rules: data reflection matching (detecting when an incoming query can be served by an existing Aggregation or Raw Reflection), Iceberg-aware partition pruning rules, and adaptive execution rules that adjust the execution plan based on observed intermediate result sizes at runtime.

Understanding Calcite's architecture helps data engineers understand why SQL queries behave the way they do in Flink, Dremio, and other Calcite-based systems: the optimizer is working from the same algebraic principles, and the transformations applied to the logical plan are the same categories of algebraic rewriting regardless of the specific data system.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
