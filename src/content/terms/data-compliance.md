---
title: "Data Compliance"
description: "A guide to data compliance, the legal and regulatory frameworks governing data storage, retention, and deletion, and how data engineering architectures must adapt to meet GDPR, CCPA, and HIPAA requirements."
date: 2026-05-17
tags: ["Data Compliance", "Data Governance", "GDPR", "Data Privacy", "Data Engineering"]
---

## Engineering for the Law

The era of "store everything forever" is over. Global regulatory frameworks like the General Data Protection Regulation (GDPR) in Europe, the California Consumer Privacy Act (CCPA), and industry-specific regulations like HIPAA (healthcare) and PCI-DSS (finance) have fundamentally changed how data platforms must be architected.

Data compliance is the discipline of ensuring that an organization's data collection, storage, and processing practices adhere strictly to these legal frameworks. For data engineers, compliance is not a legal abstraction; it translates into concrete, often difficult technical requirements that must be built into the core of the [data lakehouse](/terms/data-lakehouse).

## Key Compliance Engineering Challenges

**The Right to be Forgotten (Data Erasure)**: GDPR and CCPA grant individuals the right to demand the deletion of all their personal data. In a traditional immutable [data lake](/terms/data-lake) (where data is just appended to massive CSV or Parquet files), finding and deleting a single user's records across petabytes of historical files is computationally ruinous, requiring the pipeline to rewrite thousands of massive files just to remove a few rows. 

**Data Residency and Sovereignty**: Regulations increasingly dictate *where* data physically resides. A European citizen's data may be legally required to remain on servers physically located within the EU. Data pipelines must be geo-aware, routing data to the correct regional storage buckets and preventing unauthorized cross-region replication.

**Purpose Limitation and Consent**: Data collected for one purpose (e.g., fulfilling an e-commerce order) cannot legally be used for another purpose (e.g., training a targeted ad algorithm) without explicit user consent. Data catalogs and governance tools must track the "consent status" of records and dynamically filter data out of specific analytical pipelines if the consent isn't present.

![Data Compliance Architecture](/images/terms/data_compliance.png)

## Iceberg's Role in Compliance

[Apache Iceberg](/terms/apache-iceberg) is uniquely positioned to solve the hardest technical challenges of data compliance, specifically the "Right to be Forgotten."

Because Iceberg supports row-level deletes (via merge-on-read or copy-on-write), executing a compliance deletion request is straightforward:
```sql
DELETE FROM customers WHERE user_id = 'U-99281';
```

Behind the scenes, Iceberg handles the complexity. In a merge-on-read scenario, it writes a small "delete file" indicating that `U-99281` should be ignored in all future queries. This operation takes milliseconds. Later, during a scheduled maintenance window, an Iceberg [compaction](/terms/compaction) job physically rewrites the data files to permanently expunge the deleted rows from physical storage, satisfying the regulatory requirement without disrupting daily analytical operations.

Furthermore, Iceberg's `expire_snapshots` procedure ensures that historical versions of the table (which might still contain the deleted user's data) are systematically aged out and physically deleted from [object storage](/terms/object-storage) according to the company's defined data retention policy.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
