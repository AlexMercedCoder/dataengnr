---
title: "Role-Based Access Control (RBAC)"
description: "Role-Based Access Control (RBAC) in data lakehouses is the authorization model that assigns permissions to roles rather than individual users for scalable, auditable data access governance."
date: 2026-05-17
tags: ["RBAC", "Data Governance", "Security", "Access Control", "Data Lakehouse"]
---

## Managing Access at Enterprise Scale

In a small organization with a handful of data analysts, managing data access by assigning permissions directly to individual users is workable. Each user gets the specific tables and columns they need, and when their role changes, their permissions are updated accordingly.

At enterprise scale, this user-centric approach breaks down completely. A large organization has hundreds or thousands of data consumers with different roles, access needs, and business contexts. Managing permissions for each individual user creates administrative overhead that grows as O(n), with every new hire, role change, and team reorganization requiring careful permission updates. Mistakes, such as forgetting to revoke access when an employee moves to a different team, create persistent security vulnerabilities. And when a security auditor asks "who has access to the customer PII tables?", the answer requires reviewing every individual user's permission set rather than simply listing the roles granted access.

Role-Based Access Control (RBAC) solves these problems through indirection: permissions are assigned to roles, and users are assigned to roles. When a new data scientist joins the team, they are assigned to the `data_science` role and automatically inherit all the permissions that role carries. When they move to a different team, the `data_science` role is removed and the new role is assigned. The underlying permissions never need to be individually enumerated or managed.

## Role Hierarchy and Inheritance

Enterprise RBAC implementations almost always implement role hierarchies, where roles can inherit permissions from parent roles. A `regional_manager` role might inherit from the `analyst` role, getting all the data access that analysts have, plus additional tables specific to regional management. The `global_executive` role might inherit from `regional_manager`, adding global aggregated views. This inheritance structure allows fine-grained differentiation of access levels without duplicating permission definitions across multiple roles.

In a lakehouse context, role hierarchies typically align with the [Medallion Architecture](/terms/medallion-architecture) layers. All authenticated users might have read access to Gold-layer aggregated tables through a `standard_user` role. Data engineers have the additional `data_engineer` role that grants read access to Silver and Bronze layers. Data platform administrators have the `platform_admin` role that grants write access to all layers and permission to manage schemas and table definitions.

## RBAC in [Apache Polaris](/terms/apache-polaris)

Apache Polaris implements a comprehensive RBAC model for Iceberg catalog management. Polaris principals (users or service accounts) are assigned to catalog roles, which carry specific privileges for namespaces and tables within the catalog. Privileges operate at multiple levels of granularity: full catalog-level privileges (create any table in the catalog), namespace-level privileges (create tables within a specific namespace), table-level privileges (read/write a specific table), and operation-type privileges (SELECT vs. INSERT vs. DELETE).

Polaris's RBAC is enforced at the [credential vending](/terms/credential-vending) layer. When a compute engine requests credentials to access a specific table, Polaris verifies that the requesting principal's assigned roles grant the appropriate privileges before vending the credentials. A principal lacking SELECT privileges on a table receives no vended credentials for that table's storage paths, making unauthorized access impossible even if the engine bypasses the catalog layer and attempts to access the [object storage](/terms/object-storage) directly.

![RBAC Architecture in Lakehouse](/images/terms/rbac_lakehouse_architecture.png)

## RBAC in [Dremio](/terms/dremio)'s [Semantic Layer](/terms/semantic-layer)

Dremio implements RBAC at the Semantic Layer level, providing granular access control over virtual datasets, spaces, and sources. Dremio's RBAC model assigns privileges to roles, which are assigned to users or user groups (typically synchronized from an enterprise identity provider like Active Directory through SCIM or LDAP).

Beyond table-level RBAC, Dremio supports [Row-Level Security](/terms/row-level-security) (RLS), which restricts which rows a specific role can see within a virtual dataset. A `northeast_sales` role can be configured to see only rows where `region = 'Northeast'` in the sales fact virtual dataset, while the `global_sales` role sees all rows. This row-level filtering is applied transparently by Dremio's query engine before results are returned, regardless of which BI tool the user employs.

Dremio also supports [Column Masking](/terms/column-masking): a `pii_masked_analyst` role might see a Customer table where the `email_address` column is replaced with a hashed or truncated value, preventing access to the raw PII while still allowing the analyst to work with the data for their legitimate analytical purpose. Roles with elevated access (like `pii_authorized_analyst`) see the unmasked values. Column masking is applied at query time with zero impact on the physical data files.

## Learn More

Several of the [books by Alex Merced](/books) cover this in depth, and a few of them are free. The rest of the [knowledge base](/terms) is worth a look too.
