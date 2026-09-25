---
title: TypeScript SDK
description: Drive PrioriCode programmatically with the official TypeScript SDK.
---

# TypeScript SDK

PrioriCode ships a typed client for the server API. Use it to embed the agent in your own apps,
scripts, and CI pipelines.

## Install

```bash
npm install @prioricode/sdk
```

## Start a server

```bash
prioricode serve --port 4096
```

## Quick example

```ts
import { createPrioricodeClient } from "@prioricode/sdk"

const client = createPrioricodeClient({
  baseUrl: "http://localhost:4096",
  directory: process.cwd(),
})

const session = await client.session.create({ body: {} })

await client.session.prompt({
  path: { id: session.data.id },
  body: { parts: [{ type: "text", text: "Summarize the failing tests." }] },
})
```

Every request and response is fully typed — the client is generated from the
[OpenAPI spec](https://github.com/Prioritech-Indonesia-Optima/prioricode/blob/main/packages/sdk/openapi.json).

::: tip
Start `prioricode serve` locally to expose the API the SDK talks to — see the
[quickstart](/quickstart#_3-run).
:::
