---
title: "Exactly-Once Processing"
description: "A guide to exactly-once processing, the holy grail of streaming data architecture, ensuring that every event is processed and delivered to the final destination exactly one time, without duplicates or data loss."
date: 2026-05-17
tags: ["Exactly-Once Processing", "Streaming", "Apache Flink", "Apache Kafka", "Data Engineering"]
---

# The Holy Grail of Streaming

When building streaming data pipelines, engineers must contend with the realities of distributed systems: network partitions, node crashes, and process restarts. If a stream processing engine (like [Apache Flink](/terms/apache-flink)) crashes while processing a batch of financial transactions, what happens when the engine restarts?

If the engine doesn't remember where it left off, it might miss some transactions permanently (**at-most-once** semantics). If the engine plays it safe and re-reads the transactions it isn't sure about, it might process the same transaction twice, crediting a user's account twice (**at-least-once** semantics). 

For critical business applications, neither is acceptable. The system must guarantee that every single event is processed, and its effect is reflected in the final output exactly one time. This mathematical guarantee is called Exactly-Once Processing semantics.

## How Exactly-Once is Achieved

Achieving true exactly-once processing requires tight coordination across the entire streaming pipeline: the source, the processing engine, and the sink (destination).

**1. Replayable Sources**: The source system must be able to replay messages from a specific point in time. [Apache Kafka](/terms/apache-kafka) is the standard here; it stores messages sequentially with unique "offsets." The processing engine can tell Kafka, "I crashed; start sending me messages again from offset 1045."

**2. Stateful Processing Checkpoints**: The stream processing engine must take regular, atomic snapshots of its internal state and the current offset it is reading from the source. In Apache Flink, this is handled by the Chandy-Lamport algorithm. Flink periodically saves its entire state (e.g., the current running sum of a user's purchases) and the Kafka offset to durable storage (like S3).

**3. Transactional Sinks**: The destination system must support two-phase commits. When Flink processes a window of data, it writes the output to the destination (like an [Apache Iceberg](/terms/apache-iceberg) table) in an open, uncommitted transaction. 

When a crash occurs, Flink restarts, loads the last successful checkpoint from S3, asks Kafka to resume from that saved offset, and discards the uncommitted transaction at the sink. It then re-processes the data. Because the sink uses two-phase commits, the duplicate output generated during the retry is written into a new transaction, and the final state of the Iceberg table perfectly reflects processing every event exactly once.

![Exactly-Once Processing](/images/terms/exactly_once.png)

## The Cost of Exactly-Once

Exactly-once processing provides peace of mind, but it comes with a performance penalty. The overhead of constantly taking distributed checkpoints and managing two-phase commits across multiple systems introduces latency and reduces overall throughput. 

For a pipeline processing website clickstream data where a few duplicate clicks don't matter, engineers often opt for the faster [At-Least-Once delivery](/terms/at-least-once-delivery). However, for a pipeline processing billing events, banking transactions, or inventory deductions, the latency penalty of Exactly-Once processing is the mandatory cost of doing business.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
