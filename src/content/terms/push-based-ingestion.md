---
title: "Push-Based Ingestion"
description: "Push-based ingestion is the data integration pattern where source systems actively send data to a central platform via API or streaming, enabling true real-time event-driven architectures."
date: 2026-05-17
tags: ["Push-Based Ingestion", "Streaming", "Data Architecture", "Data Engineering", "Apache Kafka"]
---

## Data on Demand

In the world of data engineering, moving data from a source system (like a web application, a CRM, or an IoT sensor) into a central [data lakehouse](/terms/data-lakehouse) requires an ingestion strategy. The two primary strategies are "Push" and "Pull."

Push-based ingestion is an event-driven architectural pattern where the source system is responsible for actively sending (pushing) data to the central data platform the moment an event occurs. The data platform acts as a passive receiver, waiting to accept incoming payloads.

If a user clicks a button on an e-commerce website, the frontend application immediately executes an HTTP POST request, pushing a JSON payload containing the click details directly to a REST API endpoint or a streaming message broker (like [Apache Kafka](/terms/apache-kafka) or Amazon Kinesis) managed by the data engineering team.

## Benefits of Push-Based Ingestion

**Real-Time Latency**: Push is the foundation of true [real-time analytics](/terms/real-time-analytics). Because the source system sends the data immediately upon creation, the latency is measured in milliseconds. This is critical for use cases like credit card fraud detection or live inventory management.

**Decoupled Architecture**: Push architectures are inherently decoupled. The source system doesn't need to know how the data lakehouse stores the data; it only needs to know how to hit the Kafka topic. The data platform doesn't need to know the database schema of the source system; it only needs to listen to the incoming stream.

**Handling Unpredictable Spikes**: If a website goes viral, the number of incoming events spikes massively. In a push-based system utilizing a message broker like Kafka, Kafka acts as a shock absorber. It ingests the massive spike of incoming pushed data and holds it in a queue, allowing the downstream lakehouse pipelines to process the data at a safe, steady pace without crashing.

![Push-Based Ingestion Architecture](/images/terms/push_ingestion.png)

## Challenges of Push-Based Ingestion

**Source System Engineering Burden**: Implementing a push architecture requires the application development team to write custom code to construct the JSON payload and handle API retries if the data platform is temporarily unavailable. This puts the burden of data engineering on the software developers.

**Missing Data**: If the source system crashes *after* an event happens but *before* it pushes the data, the event is lost. Furthermore, if the data engineering team accidentally drops a table and needs to reload the last 30 days of historical data, a pure push-based system cannot easily resend historical data; it only knows how to push what is happening right now. For historical [backfilling](/terms/backfilling), pull-based mechanisms are usually required as a fallback.

## Learn More

For a longer treatment of this and the architecture around it, see the [books by Alex Merced](/books). You can also browse the rest of the [knowledge base](/terms).
