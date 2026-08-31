---
title: "Directed Acyclic Graph (DAG)"
description: "A directed acyclic graph (DAG) is the mathematical structure used by orchestration tools like Apache Airflow and dbt to define, execute, and monitor complex data pipelines."
date: 2026-05-17
tags: ["Directed Acyclic Graph", "DAG", "Orchestration", "Apache Airflow", "Data Engineering"]
---

## The Blueprint of the Data Pipeline

In modern data engineering, a pipeline rarely consists of a single script running from start to finish. A typical pipeline might involve hundreds of interconnected tasks: extracting data from three different APIs, waiting for a file to land in S3, joining the results together, running a machine learning model, and finally updating a dashboard.

If any single task fails, or if a task runs before its prerequisites are met, the entire pipeline collapses. Data teams need a way to mathematically guarantee the execution order of these tasks. 

This is achieved using a Directed Acyclic Graph (DAG). A DAG is a conceptual representation of a series of activities. It is "Directed" because the execution flows in a specific direction (from Task A to Task B). It is "Acyclic" because it does not contain loops (Task A cannot depend on Task B if Task B also depends on Task A; that would create an infinite wait state).

## Components of a DAG

**Nodes (Tasks)**: In a data pipeline, each node represents a specific unit of work. Node A might be "Run Python script to extract Salesforce data." Node B might be "Execute dbt run for Silver models." Node C might be "Send Slack alert."

**Edges (Dependencies)**: The lines connecting the nodes define the dependencies. If an edge points from Node A to Node B, it means Node B is "downstream" of Node A. Node B cannot start executing until Node A has successfully completed. 

## DAGs in Practice: [Orchestration](/terms/orchestration)

The concept of the DAG is the foundational architecture for modern data orchestration tools, most notably [Apache Airflow](/terms/apache-airflow), Prefect, and Dagster.

When a data engineer writes an Airflow pipeline in Python, they are explicitly constructing a DAG. They define the individual operators (tasks) and use bitshift operators (`Task_A >> Task_B`) to define the directed edges. Airflow then reads this code and renders a visual graph of the pipeline.

The true power of a DAG-based orchestrator becomes apparent during failures. If a pipeline has 50 tasks, and Task 42 fails due to a network timeout, the orchestrator halts execution of all downstream tasks dependent on Task 42. Crucially, it does not halt tasks on parallel branches of the DAG that are unaffected by Task 42. Once the engineer fixes the network issue, they can tell the orchestrator to "resume from Task 42." The orchestrator knows exactly which tasks need to be rerun and which ones have already succeeded, saving immense amounts of time and compute resources.

Data transformation tools like dbt also rely entirely on DAGs. When you run `dbt run`, dbt reads the `ref()` functions in your SQL models to automatically infer the dependencies between your tables, constructing a DAG to ensure that `dim_customer` is built before `fact_sales` attempts to join to it.

## Learn More

The [books by Alex Merced](/books) go further on this topic and the systems it sits inside. Short [video explainers](/videos) cover the same ground in under a minute each.
