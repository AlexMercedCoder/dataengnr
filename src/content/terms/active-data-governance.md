---
title: "Active Data Governance"
description: "A guide to active data governance, the modern approach that shifts governance from passive documentation to automated, programmatic enforcement of security, privacy, and quality rules directly within the data pipeline and serving layers."
date: 2026-05-17
tags: ["Data Governance", "Security", "Compliance", "Data Engineering", "Data Architecture"]
---

# From Policies in Binders to Code in Pipelines

Traditional data governance is passive. A governance committee meets, defines policies (e.g., "PII data must be masked for external contractors"), and writes these policies into a Wiki or a Word document. It is then up to individual data engineers and analysts to remember to read the document and manually implement the masking rules in their SQL queries or pipeline scripts. When an auditor asks for proof of compliance, the organization scrambles to manually review thousands of scripts. Passive governance inevitably fails because it relies on human memory and manual enforcement at scale.

Active data governance shifts governance from human-enforced policies to system-enforced code. In an active governance model, policies are defined centrally and enforced automatically by the data platform infrastructure itself, making it impossible for a user or a pipeline to violate the policy, regardless of how they access the data.

## Mechanisms of Active Governance

**Dynamic Data Masking**: Instead of creating separate, physically masked copies of tables for different user groups, active governance applies dynamic masking at query time. A policy is defined in the Semantic Layer (like Dremio): "If a user is not in the HR group, mask the `ssn` column to show only the last 4 digits." When an unauthorized user runs `SELECT ssn FROM employees`, the system intercepts the query and automatically applies the masking function, returning `XXX-XX-1234`. The raw data is untouched; the policy is enforced dynamically.

**Row-Level Security (RLS)**: Policies restrict which rows a user can see based on their identity or role. A regional sales manager querying a global `sales_fact` table will only receive rows where `region = 'Europe'`, while the global VP querying the exact same table receives all rows. The RLS filter is injected into the query execution plan by the semantic layer, preventing unauthorized row access.

**Policy-as-Code**: Governance rules are version-controlled in Git, just like software code. Changes to access control policies require pull requests and approvals, providing an immutable audit trail of who granted access to what data, when, and why.

![Active Data Governance Architecture](/images/terms/active_governance.png)

## Active Governance in the Lakehouse

In a lakehouse architecture, active governance is typically enforced at two levels:

**1. The Catalog Level (Apache Polaris / Unity Catalog)**: The catalog provides the foundational RBAC (Role-Based Access Control). When a query engine requests the metadata pointer for an Iceberg table, the catalog verifies that the engine's service principal or the requesting user has the `SELECT` privilege on that specific table.

**2. The Semantic Layer (Dremio)**: Fine-grained access control (column masking, row-level security) is enforced by the query engine's semantic layer. Because all BI tools, AI agents, and SQL analysts connect through the Semantic Layer to reach the lakehouse, the governance rules cannot be bypassed. An analyst connecting via Tableau and a Python script connecting via JDBC both traverse the same active governance enforcement point.

By moving governance from documentation to infrastructure, organizations can achieve compliance with GDPR, CCPA, and HIPAA while actually accelerating data access, because data access can be granted quickly and safely when the system guarantees that sensitive fields will be masked automatically.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
