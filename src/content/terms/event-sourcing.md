---
title: "Event Sourcing"
description: "A guide to event sourcing, the architectural pattern that stores all state changes as an immutable sequence of events rather than overwriting the current state, providing a complete audit trail and enabling powerful temporal queries."
date: 2026-05-17
tags: ["Event Sourcing", "Data Architecture", "Streaming", "Apache Iceberg", "Data Engineering"]
---

# State as a History of Changes

In a traditional CRUD (Create, Read, Update, Delete) data model, the current state of an entity is stored as a single record. When a bank account balance changes from $1,000 to $800, the account record is updated in place: the old balance of $1,000 is overwritten with the new balance of $800. The history of how the balance reached $800 (which transactions produced which changes) exists only in a separate transaction log, if it is maintained at all.

Event sourcing inverts this model. Rather than storing the current state as a mutable record, event sourcing stores every state change as an immutable event appended to an event log. The current state is not stored directly; it is computed on demand by replaying the sequence of events from the beginning (or from a snapshot checkpoint) to the present.

For the bank account, event sourcing stores: `AccountCreated {account_id: 123, initial_balance: 0}`, `DepositMade {account_id: 123, amount: 1000, timestamp: ...}`, `WithdrawalMade {account_id: 123, amount: 200, timestamp: ...}`. The current balance of $800 is computed by replaying these events. The complete history is an inherent property of the data model, not an afterthought.

## Benefits of Event Sourcing

**Complete audit trail**: Every state change is recorded as a durable, immutable event with its causation context. Regulatory audits, debugging, and forensic analysis are dramatically simplified.

**Temporal queries**: Because the full event history is preserved, any historical state can be reconstructed by replaying events up to a given point in time, without time travel hacks or separate audit tables.

**Event-driven integration**: The event log serves as the integration backbone: downstream systems subscribe to events and maintain their own projections (read models) optimized for their query patterns.

**Business logic replayability**: Bug fixes can be applied retroactively by replaying the corrected business logic against the historical event stream, correcting derived state without manual data patching.

![Event Sourcing Architecture](/images/terms/event_sourcing.png)

## Event Sourcing in the Iceberg Lakehouse

Apache Iceberg's immutable snapshot model naturally aligns with event sourcing principles. An Iceberg table's snapshot timeline is itself an event log: each snapshot records a state transition (append, overwrite, delete) that can be replayed to reconstruct any historical table state.

For systems implementing event sourcing at scale, Apache Kafka serves as the primary event log (providing durable, ordered, partitioned event storage with configurable retention), and Apache Flink pipelines consume the Kafka event stream to materialize read models as Iceberg tables. The Iceberg tables are read models (projections) optimized for analytical query patterns, while Kafka retains the raw event stream as the system of record.

Dremio queries against these Iceberg projections provide the analytical interface over the event-sourced data, supporting both current-state queries (reading the latest snapshot) and historical state queries (reading snapshots at specific past timestamps using Iceberg's time travel). The combination provides the analytical richness of event sourcing with the query performance of the Iceberg lakehouse.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
