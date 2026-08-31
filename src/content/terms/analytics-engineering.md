---
title: "Analytics Engineering"
description: "Analytics engineering is the discipline that sits between data engineering and data analysis, using software engineering best practices and tools like dbt to transform raw data into reliable, well-documented, business-ready analytical models."
date: 2026-05-17
tags: ["Analytics Engineering", "dbt", "Data Transformation", "Data Modeling", "Data Engineering"]
---

## The Layer Between Raw and Ready

Data engineers build pipelines: they ingest raw data from source systems into the lakehouse, handle [schema evolution](/terms/schema-evolution), manage partitioning and [compaction](/terms/compaction), and ensure data arrives reliably and on schedule. Data analysts consume analytical data: they query tables, build dashboards, and generate insights for business stakeholders.

Between these two roles, a gap historically existed. Data engineers produced raw or lightly cleaned data in the Bronze and Silver layers. Analysts built complex SQL transformations directly in BI tools (Tableau calculated fields, Looker LookML models, Power BI DAX measures), creating fragmented, inconsistently defined business logic scattered across dozens of dashboards with no version control or testing.

Analytics engineering, popularized by the dbt project and community, fills this gap. Analytics engineers apply software engineering practices (version control, modularity, testing, documentation) to the data transformation work that converts Silver-layer clean data into Gold-layer business-ready analytical models. Analytics engineers own the data transformation pipeline from clean data to business definitions, producing models that are consistent, tested, documented, and reusable across all BI tools and dashboards.

## The Analytics Engineering Toolkit

**dbt (data build tool)** is the primary analytics engineering tool. dbt enables analysts and analytics engineers to write SQL SELECT statements that define transformations, organize them into a DAG of dependent models, run tests on the output (schema tests, [data quality](/terms/data-quality) assertions), generate documentation (data dictionaries with column descriptions), and deploy the entire transformation graph through CI/CD.

A dbt model is a SQL SELECT statement that defines a transformation: `SELECT customer_id, COALESCE(email, 'unknown') AS email, created_at, DATEDIFF(day, created_at, CURRENT_DATE) AS days_since_signup FROM {{ ref('stg_customers') }}`. dbt compiles this into the appropriate CREATE TABLE AS SELECT or CREATE VIEW statement for the target database ([Dremio](/terms/dremio), Spark, Snowflake) and tracks the dependencies between models (this model depends on `stg_customers`, which is a staging model that reads from the raw source table).

**SQL-first transformation**: Analytics engineers write business logic in SQL, the language most data professionals understand. This democratizes data transformation beyond data engineers who write Python/Spark jobs, enabling analysts with SQL proficiency to contribute to the transformation layer.

## The dbt + Iceberg + Dremio Stack

Analytics engineering on the Iceberg lakehouse uses dbt with the Dremio or Spark adapter to write transformation models that materialize as Iceberg Gold-layer tables:

1. **Staging models** (`stg_*`): Thin wrappers over raw Bronze-layer Iceberg tables that standardize naming, cast data types, and filter out clearly invalid records.
2. **Intermediate models** (`int_*`): Business logic transformations that join staging models, compute derived fields, and apply business rules.
3. **Mart models** (`mart_*` or `fct_*`, `dim_*`): Final analytical tables in the [star schema](/terms/star-schema) pattern ([fact tables](/terms/fact-tables) and [dimension tables](/terms/dimension-tables)) ready for BI consumption.

Each model is tested with dbt's built-in schema tests (`not_null`, `unique`, `accepted_values`, `relationships`) and custom data quality tests. Documentation is generated from YAML files that describe each model's purpose, column definitions, and business context.

Dremio's [Semantic Layer](/terms/semantic-layer) then serves these dbt-produced Iceberg Gold tables through Virtual Datasets, adding the final governance layer ([column masking](/terms/column-masking), [row-level security](/terms/row-level-security), metric definitions) before they reach BI tools and AI agents.

## Learn More

If you want the long-form version, start with the [books by Alex Merced](/books). For a faster pass, there are short [video explainers](/videos).
