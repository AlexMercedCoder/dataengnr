---
title: "At-Least-Once Delivery"
description: "A guide to at-least-once delivery, the pragmatic streaming semantics pattern that guarantees no data loss at the risk of generating duplicates, requiring downstream idempotency to maintain data integrity."
date: 2026-05-17
tags: ["At-Least-Once Delivery", "Streaming", "Apache Kafka", "Data Engineering", "Architecture"]
---

# Guaranteeing Delivery, Embracing Duplicates

In distributed message queues (like [Apache Kafka](/terms/apache-kafka) or RabbitMQ) and streaming pipelines, ensuring that a message travels successfully from a producer to a consumer across an unreliable network is a complex challenge. Systems offer different "delivery semantics" to handle failures.

"At-Most-Once" delivery (fire-and-forget) is fast but risky; if a network blip occurs, the message is permanently lost. "Exactly-Once" delivery is mathematically perfect but carries heavy performance overhead due to two-phase commits and complex state tracking.

"At-Least-Once" delivery is the pragmatic middle ground chosen by most data engineering architectures. It provides a rock-solid guarantee that a message will never be lost, but it accepts the tradeoff that, occasionally, the message might be delivered to the consumer multiple times (duplicates).

## The Mechanics of At-Least-Once

At-least-once delivery relies on explicit acknowledgments (ACKs) and retries.

1. A producer sends a message ("User clicked 'Buy'") to the message broker (Kafka).
2. The broker writes the message to disk and sends an ACK back to the producer.
3. If the producer does not receive the ACK within a specific timeout window (perhaps the network dropped the ACK packet, or the broker was too slow), the producer assumes the message failed.
4. The producer automatically resends the exact same message.

This retry mechanism is what guarantees no data loss. However, it is also what creates duplicates. If the broker actually received and stored the first message, but only the return ACK was lost in the network, the producer's retry will result in the broker storing two identical copies of the "Buy" click.

![At-Least-Once Delivery](/images/terms/at_least_once.png)

## Handling Duplicates with [Idempotency](/terms/idempotency)

Because at-least-once delivery guarantees duplicates will eventually occur, the downstream systems consuming this data must be designed to handle them safely. 

If a consumer blindly processes every message it receives, an at-least-once pipeline will eventually double-count revenue or send duplicate emails to users.

To solve this, the downstream consumer (or the final database table) must be idempotent. This means the consumer uses a unique identifier in the message (e.g., `transaction_id = UUID-1234`) to check if it has already processed the event. 

In a modern [data lakehouse](/terms/data-lakehouse), this is typically handled during the ingestion into the Silver layer. Raw duplicated events land in the Bronze layer. A dbt model or Spark job reads the Bronze data, identifies the duplicates using the `transaction_id`, and deduplicates them (often using a `QUALIFY ROW_NUMBER() OVER (PARTITION BY transaction_id ORDER BY timestamp DESC) = 1` window function) before writing the clean, unique records to the Silver layer. 

By combining high-throughput at-least-once delivery in the streaming layer with idempotent deduplication in the lakehouse transformation layer, data teams achieve the reliability of exactly-once semantics without the severe performance penalties.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
