---
title: "Attribute-Based Access Control (ABAC)"
description: "A guide to Attribute-Based Access Control, the fine-grained authorization model that makes access decisions based on attributes of the user, resource, environment, and action rather than static role assignments."
date: 2026-05-17
tags: ["ABAC", "Access Control", "Security", "Data Governance", "Data Engineering"]
---

## Beyond Roles: Attribute-Driven Authorization

[Role-Based Access Control (RBAC)](/terms/role-based-access-control) assigns users to predefined roles and grants those roles access to specific resources. For many governance requirements, RBAC is sufficient. A Finance Analyst role can read the revenue tables; a Data Engineer role can write to Bronze layer tables; a Data Scientist role can access model training datasets. These static role-resource mappings cover the majority of enterprise access control scenarios.

But certain governance requirements cannot be expressed through RBAC's coarse-grained role assignments. A health data platform needs to restrict which patient records each clinical researcher can access based not on their role (all researchers have the same role) but on the specific study they are enrolled in and the patient consent attributes attached to each record. A financial trading platform needs to restrict access to position data based on the trader's regulatory jurisdiction and the market region each position record belongs to. A global enterprise needs to restrict which data a user can see based on their geographic location, their department, their security clearance level, and the [data classification](/terms/data-classification) labels on the records.

Attribute-Based Access Control (ABAC) addresses these requirements by evaluating access control policies that reference arbitrary attributes rather than fixed role assignments. An ABAC policy is a logical expression that combines multiple attribute values to make an access decision: a user can access a record if and only if their department attribute matches the record's owning department attribute AND their clearance level attribute is greater than or equal to the record's classification level attribute AND the current access time falls within the allowed access window attribute.

## Attributes: The Building Blocks of ABAC

ABAC policies reference three categories of attributes.

**Subject attributes** describe the requesting user or service: identity (user ID, email), organizational position (department, team, manager), credentials (security clearance, certifications, enrolled studies), geographic location (country, region), and technical context (device type, network location).

**Resource attributes** describe the data being accessed: sensitivity classification (public, internal, confidential, restricted), regulatory category (HIPAA, GDPR, PCI), owning domain (Finance, HR, Operations), geographic scope (US, EU, APAC), and data age (records older than a configurable retention threshold).

**Environmental attributes** describe the context of the access request: time of day, day of week, network location (corporate VPN vs public internet), authentication strength (MFA vs single factor).

An ABAC policy engine evaluates a policy expression against the current values of all referenced attributes and returns permit or deny. The policy itself is a logical expression written in a policy language (XACML, Open Policy Agent's Rego, or a custom DSL), not a static mapping stored in a database.

![ABAC vs RBAC Architecture](/images/terms/abac_vs_rbac.png)

## ABAC in the [Data Lakehouse](/terms/data-lakehouse)

In a data lakehouse context, ABAC is typically implemented through row-level and column-level security policies that reference both user attributes (retrieved from an identity provider) and data attributes (columns in the data table itself).

A row-level ABAC policy in [Dremio](/terms/dremio)'s [Semantic Layer](/terms/semantic-layer) can filter a patient records table to return only records where the `study_id` column in the patient record matches one of the study IDs in the requesting user's enrolled studies attribute (retrieved from the organization's identity provider). This row-level ABAC filter is applied transparently at query time: every query against the patient records Virtual Dataset returns only the records the requesting user is authorized to see, regardless of which BI tool or SQL client they use.

Column-level ABAC policies can apply masking transformations based on attribute combinations: the `ssn` column is returned unmasked only when the user's clearance level attribute is "privileged" AND the user is accessing from a corporate network location attribute. For all other attribute combinations, the column is returned as a masked value.

[Apache Polaris](/terms/apache-polaris) implements ABAC through privilege expressions that reference catalog object properties and principal attributes, enabling fine-grained access control at the catalog level for multi-engine lakehouse environments. Polaris's ABAC model extends RBAC by allowing privilege grants to include attribute conditions, such as granting read access to tables only when the table's classification attribute matches the principal's clearance attribute.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
