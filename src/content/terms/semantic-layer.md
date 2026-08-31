---
title: "Semantic Layer"
description: "The semantic layer in data engineering is the governed translation layer between raw data and business consumers that defines metrics, business logic, and access control centrally, ensuring consistent data definitions across all BI tools and AI agents."
date: 2026-05-17
tags: ["Semantic Layer", "Dremio", "Data Governance", "Business Intelligence", "Data Engineering"]
---

## The Glossary Made Real

Every organization has business concepts that are poorly defined or inconsistently calculated: What is a "customer"? Does it include trial users? Churned users? Is "revenue" gross revenue before discounts, net revenue after discounts, or recognized revenue after GAAP adjustments? What constitutes an "active user"? Someone who logged in this month? This quarter? Who performed at least one meaningful action?

When these definitions are implicit (understood informally by individual analysts but never formally codified), different teams build different calculations and arrive at different answers. The sales team reports one revenue number; the finance team reports another. A dashboard in Tableau calculates monthly active users differently from a dashboard in Power BI. AI agents querying the data produce inconsistent metrics because they derive their own interpretations of ambiguous column names.

The semantic layer is the governed translation layer that sits between raw data (Iceberg tables in the lakehouse) and data consumers (BI tools, AI agents, analysts). The semantic layer codifies business definitions: what "revenue" means (which columns, which calculations, which filters), what "customer" means (which table, which status conditions), and what "monthly active user" means (a user with at least one session in the trailing 30 days). These definitions are enforced centrally, ensuring all consumers of the semantic layer see consistent, correctly calculated metrics.

## The Semantic Layer as Infrastructure

A mature semantic layer provides more than metric definitions. It is governance infrastructure that connects data producers (pipeline engineers who build Iceberg tables) with data consumers (analysts, BI tools, AI agents) through a governed, versioned, access-controlled interface.

**Virtual Datasets (Logical Tables)**: In [Dremio](/terms/dremio)'s Semantic Layer, Virtual Datasets are SQL views with business logic embedded (joins, calculations, filters, field aliases). A Virtual Dataset named `customer_360` joins the customer base table, subscription table, and churn prediction table, computes composite health scores, and exposes only the columns relevant to business consumers. Analysts query `customer_360` without knowledge of the underlying table structure or join complexity.

**Metrics**: Named, reusable metric definitions (SUM(net_revenue) AS total_revenue, COUNT(DISTINCT user_id) AS mau) are defined once in the semantic layer and referenced by name across all BI tools and SQL queries. When the metric definition changes (e.g., the revenue calculation is adjusted for a new pricing model), the change propagates automatically to all consumers.

**Access Control**: The semantic layer enforces [column masking](/terms/column-masking), [row-level security](/terms/row-level-security), and role-based access control, ensuring that all consumers receive data appropriate to their authorization level regardless of which tool they use to query.

## The Semantic Layer for AI Agents

The semantic layer is a critical enabler for [agentic analytics](/terms/agentic-analytics): AI agents that autonomously query data to answer business questions. An AI agent querying raw Iceberg tables must infer the semantics of columns from their names and documentation, often producing incorrect results when column names are ambiguous or when complex business logic is embedded in SQL that the agent must replicate.

An AI agent connected to a semantic layer queries business-ready Virtual Datasets with correctly computed metrics and meaningful column names. The agent asks "What was revenue last month by region?" and the semantic layer executes the query against the correct tables, applies the approved revenue calculation, enforces row-level security for the agent's authorized data scope, and returns a correctly computed result.

Dremio's semantic layer, with its REST API and [Arrow Flight](/terms/arrow-flight) data delivery, provides the governed data access interface that makes agentic analytics safe and reliable in production. The semantic layer is the MCP (Model Context Protocol) data source for AI agent queries, providing governed, consistent data access without giving agents direct access to raw Iceberg tables.

## Learn More

For a longer treatment of this and the architecture around it, see the [books by Alex Merced](/books). You can also browse the rest of the [knowledge base](/terms).
