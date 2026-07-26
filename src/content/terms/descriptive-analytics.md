---
title: "Descriptive Analytics"
description: "A guide to descriptive analytics, the foundational tier of data analysis that focuses on summarizing historical data to answer the question 'What happened?' using dashboards, standard reporting, and core KPIs."
date: 2026-05-17
tags: ["Descriptive Analytics", "Business Intelligence", "Analytics", "Data Visualization", "Data Engineering"]
---

## Answering 'What Happened?'

When an organization begins its data journey, it almost always starts with descriptive analytics. Before a company can predict the future or optimize its supply chain, it must first have a clear, accurate, and agreed-upon view of the past. 

Descriptive analytics is the process of gathering, aggregating, and summarizing historical data to answer the foundational business question: "What happened?"

If a retail executive asks "What were our total sales last quarter?", "Which product category grew the fastest in Europe?", or "How many active users logged in yesterday?", they are asking descriptive questions. The output of descriptive analytics is typically standard reports, scorecards, and interactive dashboards.

## The Engineering Foundation for Descriptive Analytics

While the output of descriptive analytics seems simple (a bar chart or a single KPI number), the data engineering required to produce that number accurately and consistently at enterprise scale is complex.

To reliably answer "What happened?", data engineers build the foundational [Medallion architecture](/terms/medallion-architecture):

**1. Ingestion**: Raw data must be extracted from disparate source systems (CRM, ERP, web logs) and landed in the Bronze layer of the [data lakehouse](/terms/data-lakehouse).

**2. Transformation and Integration**: The data must be cleaned, deduplicated, and joined in the Silver layer. If "Total Sales" requires data from both Shopify and retail POS systems, that integration happens here.

**3. Dimensional Modeling**: The data is aggregated into fact and [dimension tables](/terms/dimension-tables) in the Gold layer (often using star schemas) to make querying fast and intuitive for BI tools.

**4. [Semantic Layer](/terms/semantic-layer)**: Metrics are strictly defined (e.g., "Revenue = Gross Sales - Returns - Discounts") in a Semantic Layer like [Dremio](/terms/dremio) so that when different dashboards query the data, they calculate the descriptive metrics identically.

![Descriptive Analytics](/images/terms/descriptive_analytics.png)

## Limitations of Descriptive Analytics

Descriptive analytics is essential for operational monitoring and basic business intelligence. It provides the scoreboard for the business. However, it is inherently backward-looking.

Descriptive analytics can tell you that customer churn increased by 5% last month, but it cannot tell you *why* it increased ([Diagnostic Analytics](/terms/diagnostic-analytics)), *who* is likely to churn next month ([Predictive Analytics](/terms/predictive-analytics)), or *what* actions you should take to prevent them from churning ([Prescriptive Analytics](/terms/prescriptive-analytics)).

Despite these limitations, an organization cannot skip descriptive analytics. Trying to implement advanced machine learning models before establishing a reliable, trusted baseline of historical reporting usually fails, because the [data quality](/terms/data-quality) issues that descriptive analytics uncovers will poison the predictive models. Building a trusted descriptive analytics foundation is the prerequisite for all advanced data initiatives.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
