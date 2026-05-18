---
title: "Master Data Management (MDM)"
description: "A guide to Master Data Management, the discipline of creating a single, reliable source of truth for an organization's critical data entities (customers, products, employees) across fragmented source systems."
date: 2026-05-17
tags: ["Master Data Management", "MDM", "Data Governance", "Data Quality", "Data Engineering"]
---

# Creating the Golden Record

In a mature enterprise, the same business entity exists in dozens of different systems. A customer ("Jane Doe") might exist in the Salesforce CRM (with her business email), the Zendesk support system (with her personal email), the Shopify e-commerce platform (with her home address), and the billing system (with a different billing address). When the marketing team asks "How many active customers do we have?", the answer depends on which system is queried. When the data engineering team joins these systems in the lakehouse, "Jane Doe" appears as four distinct people because her identifiers and attributes don't match perfectly across systems.

Master Data Management (MDM) is the discipline of identifying, resolving, and centralizing the organization's critical data entities (Master Data) to create a single, reliable source of truth - the "Golden Record." MDM ensures that when the organization refers to a customer, a product, or an employee, everyone is referring to the same consolidated entity with the most accurate, up-to-date attributes.

## The MDM Process

Building a Golden Record involves several technical and procedural steps within the data pipeline:

**1. [Data Profiling](/terms/data-profiling) and Standardization**: Raw data from source systems is profiled to understand formats and inconsistencies. Names, addresses, and phone numbers are standardized (e.g., converting "St." to "Street", standardizing phone numbers to E.164 format) so that they can be compared accurately.

**2. Entity Resolution (Matching)**: The most complex step is determining which records across different systems represent the same real-world entity. This requires exact matching (joining on deterministic keys like SSN or email) and fuzzy matching (using algorithms like Levenshtein distance or Soundex to match "Jane Doe" with "J. Doe" based on address proximity). Modern entity resolution often employs machine learning models to improve match accuracy.

**3. Survivorship (Merging)**: Once multiple records are identified as the same entity, the system must decide which attributes "survive" to populate the Golden Record. Survivorship rules define the precedence of systems: the billing system's address might be trusted over the CRM's address, while the CRM's phone number might be trusted over the billing system's phone number.

![Master Data Management Architecture](/images/terms/master_data_management.png)

## MDM in the Lakehouse Architecture

Historically, MDM was handled by expensive, monolithic, proprietary MDM software suites. In the modern data stack, MDM logic is increasingly moving into the data pipeline and the lakehouse itself.

In a [Medallion architecture](/terms/medallion-architecture), MDM occurs between the Silver and Gold layers. The Silver layer contains the standardized, deduplicated records from each individual source system. A dedicated dbt project or Spark application performs the entity resolution and survivorship logic, combining the Silver tables to produce the Gold-layer Master Data tables (`dim_customer_master`, `dim_product_master`).

These Gold Master Data tables become the dimensions in the [star schema](/terms/star-schema) that all other [fact tables](/terms/fact-tables) join against. By centralizing the MDM logic in the lakehouse transformation layer (using standard tools like SQL, Python, and dbt), organizations achieve a single source of truth without the lock-in of proprietary MDM platforms, while maintaining full version control and reproducibility of the entity resolution logic.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
