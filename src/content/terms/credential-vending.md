---
title: "Credential Vending"
description: "A guide to credential vending in the Apache Iceberg ecosystem, the security pattern where a catalog service issues scoped, time-limited storage credentials to compute engines rather than distributing permanent broad-access credentials."
date: 2026-05-17
tags: ["Credential Vending", "Security", "Apache Polaris", "Apache Iceberg", "Data Governance"]
---

## The Credential Distribution Problem

In a multi-engine lakehouse environment, every compute engine ([Apache Spark](/terms/apache-spark), [Apache Flink](/terms/apache-flink), [Dremio](/terms/dremio), [Trino](/terms/trino), [DuckDB](/terms/duckdb), Python scripts) needs credentials to read and write data files in [object storage](/terms/object-storage). The traditional approach to providing these credentials is to distribute permanent, broad-scoped storage credentials to all compute engines. AWS IAM access keys, Azure service principal credentials, or GCP service account keys are configured in each engine's settings, granting that engine access to the relevant storage buckets.

This distributed permanent credential model creates serious security vulnerabilities. Any compromised compute engine, leaked configuration file, or insider threat immediately exposes the entirety of the data stored in the accessible buckets. Revoking access requires locating and updating credentials in every configured engine, which in large organizations can involve dozens of systems. Auditing which engine accessed which data requires examining object storage access logs that show only the credential identity (the IAM role or service account), not the specific query or user context that triggered the access.

Credential vending is a security pattern that addresses all three of these problems. Rather than distributing permanent broad credentials to engines, a central catalog service (the "vending machine") issues scoped, time-limited credentials on demand as engines request access to specific tables.

## How Credential Vending Works

The credential vending workflow integrates with the [Iceberg REST Catalog](/terms/iceberg-rest-catalog) protocol. When a compute engine requests to read a specific Iceberg table, it sends a request to the REST catalog (such as [Apache Polaris](/terms/apache-polaris)). The catalog authenticates the requesting principal, evaluates the principal's access control policies (verifying that the principal is authorized to read the requested table), and if authorized, calls the underlying object storage service (AWS STS, Azure Managed Identity, GCP Workload Identity Federation) to generate temporary, scoped credentials.

The scoped credentials are specific to the storage paths associated with the requested table (the exact S3 prefixes or Azure ADLS directories where the table's Parquet data files are stored). They are valid for only a short duration (typically 15 minutes to 4 hours, configurable by policy). The catalog returns these vended credentials to the requesting engine alongside the table metadata. The engine uses the vended credentials to read the specific data files for this query only.

When the credentials expire, the engine must request new credentials from the catalog to continue accessing the data. This expiration-based model means that even if a vended credential set is leaked or compromised, its useful window is bounded by the expiration time, dramatically reducing the impact radius of a credential compromise compared to permanent credentials.

![Credential Vending Architecture](/images/terms/credential_vending_architecture.png)

## Apache Polaris and Credential Vending

Apache Polaris implements credential vending as a core feature of its REST Catalog implementation. Polaris integrates with AWS STS, Azure Managed Identity, and GCP WIF to generate temporary credentials scoped to the specific storage paths of the requested table. The vending policy is configurable per catalog role: a read-only role receives only read-scoped credentials, while a write-authorized role receives write-scoped credentials for the specific paths it is authorized to write to.

When Dremio is configured to use Polaris as its catalog, Dremio's storage access for all Iceberg table reads occurs through Polaris-vended credentials. Dremio holds no permanent storage credentials for the Iceberg data; every access is mediated through Polaris's authorization and credential vending layer. This makes Polaris the single, auditable control point for all storage access in the multi-engine lakehouse.

## Security Benefits

**Blast radius reduction**: A compromised engine credential only provides access to the tables the engine was currently querying, limited to the credential expiration window. Permanent credentials would provide unlimited access to all accessible buckets.

**Centralized access revocation**: Revoking a principal's access in Polaris immediately prevents new credential issuance. There is no need to track and update credentials in individual engine configurations.

**Fine-grained audit logging**: Every credential vending event is logged in Polaris with the requesting principal identity, the requested table, the timestamp, and the credential scope. This audit trail provides comprehensive visibility into exactly which principals accessed which data, when, and through which engine.

**Enforcement of data perimeter**: Engines can only access storage paths for which they have received vended credentials. Even if an engine is misconfigured or compromised, it cannot access data outside the paths Polaris has authorized, enforcing a cryptographic data perimeter around the lakehouse.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
