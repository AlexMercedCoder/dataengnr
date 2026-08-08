---
title: "Prompt Engineering"
description: "Prompt engineering is the practice of designing, refining, and structuring the text inputs given to Large Language Models to extract the most accurate, useful, and formatted outputs."
date: 2026-05-17
tags: ["Prompt Engineering", "Large Language Models", "Generative AI", "Artificial Intelligence", "Analytics"]
---

## Programming with Prose

Traditional software engineering is deterministic. If you write `print(2 + 2)` in Python, the compiler executes exact, rigid instructions and will always output `4`. If you forget a parenthesis, the code crashes immediately.

[Large Language Models](/terms/large-language-models) (LLMs) are probabilistic. They do not execute code; they predict the most statistically likely next word based on the text you provide them. If you give an LLM a vague instruction like "Write a summary of this document," the model might give you a one-sentence summary, a five-paragraph essay, or a bulleted list. The output is entirely dependent on how you frame the request.

Prompt engineering is the emerging discipline of crafting the input text (the prompt) to reliably guide the LLM toward the exact desired output. It is the art of "programming" an AI using natural human language rather than code.

## Key Prompting Techniques

**1. Zero-Shot Prompting**: 
The simplest form. You ask the model to perform a task without giving it any prior examples. (e.g., "Translate the following sentence into French: Hello world.") Modern LLMs are highly capable of zero-shot tasks due to their massive training data.

**2. Few-Shot Prompting**: 
Providing the model with a few concrete examples of the desired input and output before asking it to perform the task. This "primes" the model's statistical context window, teaching it the exact format or tone you want. 
*(e.g., "Input: I love this! -> Output: Positive. Input: This broke immediately. -> Output: Negative. Input: The shipping was fast. -> Output: ")*

**3. Chain-of-Thought (CoT)**: 
A breakthrough technique for complex reasoning or math problems. Instead of asking the model for the final answer immediately, you explicitly tell the prompt: "Let's think step by step." This forces the model to generate intermediate logical steps. By outputting the intermediate steps into its own context window, the model achieves significantly higher accuracy on the final answer.

![Prompt Engineering Architecture](/images/terms/prompt_engineering.png)

## System Prompts and Guardrails

In enterprise applications (like an automated customer support chatbot), engineers use "System Prompts." A system prompt is a hidden set of instructions injected before the user's input. 

A system prompt might dictate: *"You are a helpful customer service agent for Acme Corp. You must always be polite. You may only answer questions based on the provided documentation. If the user asks about a competitor, you must decline to answer."*

This form of prompt engineering acts as a behavioral guardrail, restricting the LLM's natural tendency to hallucinate answers or deviate from the corporate brand voice.

## Learn More

If you want the long-form version, start with the [books by Alex Merced](/books). For a faster pass, there are short [video explainers](/videos).
