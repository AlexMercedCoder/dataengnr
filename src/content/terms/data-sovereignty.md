---
title: "Data Sovereignty"
description: "A guide to data sovereignty in global data engineering, the regulatory and governance requirements that mandate certain data must remain within specific geographic boundaries and be governed by the laws of the jurisdiction where it was collected."
date: 2026-05-17
tags: ["Data Sovereignty", "Data Governance", "GDPR", "Compliance", "Data Engineering"]
---

## When Geography Governs Data

Data sovereignty is the principle that data is subject to the laws and governance frameworks of the jurisdiction where it was collected, processed, or stored. For global organizations operating across multiple countries and regulatory regimes, data sovereignty creates complex architectural constraints: European Union citizens' personal data must comply with GDPR (and may be prohibited from leaving the EU without adequate protection mechanisms), healthcare data in the United States is governed by HIPAA, financial transaction data in China is subject to China's Data Security Law, and India's Digital Personal Data Protection Act governs data about Indian residents.

A single global platform that stores all data in a US-based S3 bucket violates the data sovereignty requirements of many countries. Even if the data is encrypted and access-controlled, the physical location of the data in a US jurisdiction subjects it to US legal processes (including potential government access orders) that may be incompatible with the rights and protections required by other jurisdictions' laws.

Data engineering architectures that support global operations must implement sovereignty-aware [data architecture](/terms/data-architecture): keeping data in the appropriate geographic region's cloud infrastructure, implementing geographic access controls that prevent data from certain jurisdictions from being accessed by infrastructure in other jurisdictions, and maintaining compliance records that document where data is stored and how it is processed.

## Sovereignty in the Cloud Lakehouse

Cloud providers offer region-specific storage and compute resources that enable sovereignty-aware lakehouse architectures. An organization might maintain separate regional lakehouses: an EU lakehouse using S3 in eu-west-1 (Ireland) for EU citizen data, a US lakehouse in us-east-1 for US data, an APAC lakehouse in ap-southeast-1 for data subject to APAC regulations.

[Apache Iceberg](/terms/apache-iceberg) catalogs can be deployed regionally: a European [Apache Polaris](/terms/apache-polaris) deployment governs only the EU-region Iceberg tables, with access control policies ensuring that EU citizen data never leaves the eu-west-1 region. A global data federation layer ([Dremio](/terms/dremio)'s cross-source query capability or a [Trino](/terms/trino) deployment) can be configured to route queries to the appropriate regional catalog based on the data domain, enforcing regional isolation at the query planning level.

![Data Sovereignty Architecture](/images/terms/data_sovereignty.png)

## GDPR and the Right to Erasure

The European Union's General Data Protection Regulation (GDPR) includes the right to erasure (Article 17), commonly called the "right to be forgotten." When an EU citizen requests deletion of their personal data, the organization must delete all copies of that person's data across all processing systems, including analytical lakes and warehouses.

Iceberg's row-level delete capability (using delete files in Merge-on-Read mode) provides a mechanism for implementing GDPR erasure in Iceberg tables without rewriting entire data files. A record matching the erasure request is marked for deletion through an Iceberg position delete or equality delete, making it invisible to all future queries while the physical data file is eventually cleaned up through [compaction](/terms/compaction). This provides efficient, ACID-consistent erasure without the performance cost of immediately rewriting potentially large Parquet files.

The erasure must also remove the affected rows from all snapshots within the retention window, not just the current snapshot, to prevent time-travel queries from surfacing erased data. Iceberg's snapshot management APIs enable targeted deletion of specific row IDs from all retained snapshots as part of a GDPR erasure workflow.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
