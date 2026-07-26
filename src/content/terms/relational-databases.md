---
title: "Relational Databases"
description: "A guide to relational databases (RDBMS), the foundational technology of the data industry that stores information in highly structured tables linked by primary and foreign keys, enforcing strict data integrity."
date: 2026-05-17
tags: ["Relational Databases", "SQL", "Data Architecture", "Data Modeling", "Data Engineering"]
---

## The Bedrock of the Data World

Invented by Edgar F. Codd at IBM in 1970, the relational database management system (RDBMS) is arguably the most successful software architecture in history. Over fifty years later, relational databases (like PostgreSQL, MySQL, Oracle, and SQL Server) remain the undisputed backbone of global commerce, powering everything from banking applications to e-commerce shopping carts.

A relational database organizes data into a highly structured format of tables (relations), consisting of columns (attributes) and rows (records). The fundamental power of this model lies in how these separate tables "relate" to one another.

## Keys and Normalization

Instead of storing a customer's name and address repeatedly on every single order they place (which wastes space and risks data inconsistency if they move), the relational model uses "Normalization." 

Data is split into logical entities: a `Customers` table and an `Orders` table.
- The `Customers` table has a **Primary Key** (a unique identifier, like `customer_id = 42`).
- The `Orders` table contains a **Foreign Key** (a column indicating that this specific order belongs to `customer_id = 42`).

When a user wants to view the order alongside the customer's name, they write a SQL `JOIN` query. The database engine dynamically links the two tables together using these keys.

![Relational Database Architecture](/images/terms/relational_databases.png)

## Strict ACID Compliance

Operational systems rely on relational databases primarily because they guarantee ACID properties (Atomicity, Consistency, Isolation, Durability).

If you transfer $100 from your checking account to your savings account, it is a single transaction involving two operations: debiting checking and crediting savings. The RDBMS guarantees that these operations are Atomic-either both succeed perfectly, or both fail completely. There is no scenario where the system crashes halfway through, debiting your checking account without ever crediting your savings. 

Furthermore, the database enforces strict schemas. If a column is defined as an `INTEGER`, the database will physically reject any attempt to insert the string "twenty". This "schema-on-write" enforcement guarantees that the data resting in the database is perfectly clean and reliable.

## The Scaling Challenge

While phenomenal for transactional workloads (OLTP), traditional relational databases struggle with massive analytical workloads (OLAP). They are typically designed to scale "vertically" (buying a bigger, more expensive server with more RAM). When data volumes reach petabyte scale, vertical scaling becomes physically and financially impossible, leading data engineers to extract the data out of the RDBMS and load it into distributed, columnar cloud data lakehouses designed for "horizontal" scaling.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
