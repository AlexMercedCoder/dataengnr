---
title: "Data Privacy"
description: "Data privacy in data engineering covers the practices and architectural patterns used to protect sensitive personally identifiable information (PII) from unauthorized access while maintaining analytical utility."
date: 2026-05-17
tags: ["Data Privacy", "Security", "Data Governance", "Compliance", "Data Engineering"]
---

## Protecting the Individual

Data privacy and data security are related but distinct concepts. Data security focuses on protecting data from malicious external breaches (hackers, ransomware). Data privacy focuses on protecting the identities and sensitive attributes of individuals from internal overexposure and ensuring data is collected and used ethically and legally.

In a modern enterprise, a [data lakehouse](/terms/data-lakehouse) holds massive amounts of Personally Identifiable Information (PII): names, addresses, social security numbers, medical histories, and purchasing behaviors. While this data is invaluable for marketing analytics and product personalization, exposing it raw to hundreds of internal data scientists and business analysts is a massive privacy violation and a regulatory liability.

Data privacy engineering is the practice of designing pipelines and architectures that obscure sensitive individual data while preserving the statistical patterns needed for accurate aggregate analytics.

## Privacy-Preserving Techniques

**Data Masking**: Replacing sensitive data with fictitious but structurally similar data. A credit card number `4532 1234 5678 9012` is masked to `XXXX XXXX XXXX 9012`. Dynamic masking, enforced by semantic layers like [Dremio](/terms/dremio), applies this masking at query time based on the user's role, meaning the underlying data remains intact but unauthorized users only see the masked version.

**Tokenization**: Replacing sensitive data with a randomly generated token. `Jane Doe` becomes `TOKEN_84729`. The mapping between the token and the real name is stored in an isolated, highly secure vault. Tokenization preserves referential integrity (if Jane Doe appears twice, she gets the same token both times), allowing analysts to perform `JOIN`s and count unique users without ever knowing their names.

**K-Anonymity and Differential Privacy**: Advanced techniques used when releasing datasets. K-Anonymity ensures that any individual in a dataset cannot be distinguished from at least `k-1` other individuals, often achieved by generalizing attributes (e.g., replacing exact age `34` with an age range `30-40`). Differential privacy injects mathematical noise into query results so that the presence or absence of any single individual does not significantly affect the aggregate output.

![Data Privacy Architecture](/images/terms/data_privacy.png)

## Privacy in the Lakehouse Architecture

Implementing privacy in a lakehouse architecture typically follows a "defense in depth" approach across the Medallion layers:

**Bronze Layer**: Raw data lands containing full PII. Access to the Bronze layer is strictly limited to an elite group of automated service accounts and core data engineers.

**Silver Layer**: During the pipeline transformation from Bronze to Silver, aggressive tokenization and static masking are applied. The `email_address` column is hashed; the `ssn` is dropped entirely if not needed. The Silver layer is where data scientists typically work, building models on tokenized data.

**Gold Layer & [Semantic Layer](/terms/semantic-layer)**: The aggregated business tables in the Gold layer should inherently contain less PII (as they are aggregated). However, for drill-down capabilities, the Semantic Layer applies dynamic masking and [Row-Level Security](/terms/row-level-security) to ensure that a regional manager can only see unmasked details for customers explicitly within their designated territory, enforcing the principle of least privilege.

## Learn More

Several of the [books by Alex Merced](/books) cover this in depth, and a few of them are free. The rest of the [knowledge base](/terms) is worth a look too.
