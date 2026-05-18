---
title: "Generative AI"
description: "A guide to Generative AI, the class of artificial intelligence models designed not to analyze or classify existing data, but to create entirely new, original content-including text, images, and code."
date: 2026-05-17
tags: ["Generative AI", "Artificial Intelligence", "Machine Learning", "Large Language Models", "Data Science"]
---

# Creating from the Void

For the first several decades of artificial intelligence, the vast majority of commercial applications were "Discriminative." A discriminative AI model takes in data and makes a judgment about it. It looks at a bank transaction and classifies it as `Fraud` or `Not Fraud`. It looks at an MRI scan and classifies it as `Tumor` or `Benign`. It looks at a user's history and predicts their `Lifetime Value`.

Discriminative models analyze what already exists. 

Generative AI fundamentally flips this paradigm. Instead of classifying data, Generative AI models generate entirely new data that has never existed before. You provide the model with a prompt (a text instruction or a sketch), and it creates a novel output-an original essay, a photorealistic image, a piece of music, or functional Python code.

## How It Works

Generative AI relies on complex deep learning architectures, primarily **Foundation Models**. These models (like OpenAI's GPT-4 for text or Midjourney for images) are trained on unfathomably massive datasets-often a significant percentage of the entire public internet.

During this massive training process, the model learns the underlying probability distribution of the data. An image model learns the statistical relationship between the pixels that make up a "dog" and the pixels that make up a "skateboard." A text model learns the statistical probability of which word is most likely to follow the previous word in a sentence.

When prompted, the model uses this deep statistical understanding to sample from that probability distribution, constructing the new output piece by piece (pixel by pixel, or word by word) in a way that perfectly mimics human creation.

![Generative AI Architecture](/images/terms/generative_ai.png)

## The Data Engineering Implications

Generative AI has radically shifted the priorities of data engineering. 

Historically, data engineers spent 80% of their time cleaning highly structured tabular data (CSV, SQL) for traditional BI dashboards and discriminative ML models. The massive unstructured text documents, PDFs, and images sitting in the [data lake](/terms/data-lake) were largely ignored because they were too difficult to query.

Because Generative AI thrives on unstructured text, data engineers are now building entirely new pipelines designed to extract, chunk, and embed these massive unstructured datasets. The focus has shifted from building traditional ETL pipelines for Data Warehouses to building Vector Pipelines for [Retrieval-Augmented Generation (RAG)](/terms/rag-architecture) applications, transforming the previously dormant "dark data" into the most valuable asset in the enterprise.

## Learn More

To dive deeper into these architectures and master the modern data ecosystem, check out the comprehensive [books by Alex Merced](/books) available in our Books section.
