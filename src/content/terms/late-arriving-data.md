---
title: "Late-Arriving Data"
description: "A guide to handling late-arriving data in streaming and batch pipelines, understanding how network lag and offline devices complicate time-based aggregations and the architectural patterns used to gracefully reconcile the past."
date: 2026-05-17
tags: ["Late-Arriving Data", "Streaming", "Data Engineering", "Apache Flink", "Architecture"]
---

# Reconciling the Past

In a perfect data engineering world, events arrive at the data platform in the exact chronological order they occurred. In reality, distributed networks are messy. Mobile devices lose cell service, APIs go offline, and servers crash. 

Late-arriving data occurs when an event that happened at 10:00 AM (its "Event Time") does not physically reach the data platform until 10:30 AM (its "Processing Time").

For example, a user plays a mobile game on a subway and makes an in-app purchase at 10:00 AM. Because they have no cellular connection, the app stores the purchase event locally. At 10:30 AM, the user emerges from the subway, regains a connection, and the app finally transmits the 10:00 AM purchase to the data platform. 

If the data team runs a rigid batch job at 10:15 AM to calculate "Total Sales Between 10:00 and 10:15," that job will report an incorrect number, completely missing the subway purchase.

## Handling Late Data in Batch Pipelines

In traditional batch pipelines (like daily dbt runs), handling late-arriving data is computationally expensive. If a late event from Tuesday arrives on Friday, the naive approach is to simply rerun Tuesday's entire batch job. 

A more modern approach leverages the MERGE capabilities of table formats like Apache Iceberg. The pipeline processes the late event on Friday, realizes it belongs to Tuesday's partition based on its Event Time timestamp, and performs an Upsert directly into Tuesday's historical Parquet files, correcting the record without requiring a full daily rerun.

![Late-Arriving Data Architecture](/images/terms/late_arriving_data.png)

## Handling Late Data in Streaming (Watermarks)

In continuous streaming engines like Apache Flink, late-arriving data is handled through a sophisticated mechanism called "Watermarking."

If Flink is calculating a rolling 5-minute sum of sales (e.g., the 10:00 to 10:05 window), it needs to know when it is "safe" to officially close that window and emit the final number. It cannot wait forever, but if it closes it too early, it misses late data.

A Watermark is a heuristic tolerance mechanism. The engineer might configure a watermark delay of 10 minutes. This tells the streaming engine: "Assume data can arrive up to 10 minutes late." 

The engine will keep the 10:00-10:05 window open in memory until the engine sees an event with an Event Time of 10:15. Only then does the engine officially assume the 10:00-10:05 window is complete.

But what if data arrives 30 minutes late, completely blowing past the watermark? Flink provides "Side Outputs." The engine emits the final number at the 10-minute watermark, but if an incredibly late event arrives later, the engine routes it to a special "Side Output" table. This allows the data engineering team to capture the rogue late event and trigger a manual reconciliation process at the end of the month, ensuring that the final financial books are mathematically perfect without halting the real-time dashboards.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
