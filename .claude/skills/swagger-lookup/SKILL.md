---
name: swagger-lookup
description: Look up API endpoint details from Swagger/OpenAPI spec files using keyword search. Use this skill whenever you need to make an API call and need to know the exact endpoint path, HTTP method, query parameters, request body schema, or response model. Also use when exploring what endpoints are available, finding endpoints by tag/category, or when the user mentions a Swagger or OpenAPI spec file. Trigger this skill instead of reading large API spec files directly — it resolves all $ref references and returns fully expanded schemas so you get complete request/response models in one lookup. Use this even for simple API lookups — it's faster and more reliable than scanning a full spec.
---

# Swagger/OpenAPI Endpoint Lookup

Search and retrieve fully-resolved endpoint details from Swagger/OpenAPI spec files. Returns complete request/response schemas with all `$ref` references expanded, so you get the exact fields, types, enums, and required markers you need to construct correct API calls.

## Setup

The search tool is at: `swagger_search.py`

It works with both **OpenAPI 3.x** and **Swagger 2.x** specs, in JSON or YAML format (YAML requires `pyyaml`).

Before using the tool, identify the path to the project's Swagger/OpenAPI spec file. Common locations:
- `./swagger.json`, `./openapi.json`, `./openapi.yaml`
- `./docs/api-doc.json`, `./api/swagger.json`, `./docs/api.json`
- Check project root or `docs/` directory if unsure

## Commands

### 1. Search by keyword (most common)

```bash
python swagger_search.py search <spec_file> "<keyword>" -n 5
```

Searches across endpoint paths, summaries, descriptions, operation IDs, tags, and parameter names. Multi-word queries use AND matching (all words must appear). Results are ranked by relevance — path and summary matches score highest.

**Example:**
```bash
python swagger_search.py search ./swagger.json "create user" -n 3
```

### 2. List all endpoints (overview)

```bash
python swagger_search.py list <spec_file>
```

Returns a compact one-line-per-endpoint summary. Use this when you need to scan what's available before searching.

### 3. Get full details of a known endpoint

```bash
python swagger_search.py detail <spec_file> <METHOD> <path>
```

**Example:**
```bash
python swagger_search.py detail ./swagger.json POST /api/users
```

### 4. Browse by tag/category

```bash
# List all tags with their endpoints
python swagger_search.py tags <spec_file>

# Show all endpoints under a specific tag
python swagger_search.py tag <spec_file> "users"
```

## What the output includes

For each matched endpoint, you get:
- **Method & path** (e.g., `POST /api/v1/users`)
- **Summary & description**
- **Operation ID & tags**
- **Path parameters** with types and descriptions
- **Query parameters** with types, enums, defaults, required/optional
- **Header parameters**
- **Request body** — fully resolved schema with field names, types, nested objects, enums, required markers
- **Response models** — per status code, fully resolved with the same detail

All `$ref`, `allOf`, `oneOf`, `anyOf` are recursively resolved. Circular references are detected and marked. You never see raw `$ref` strings — everything is expanded inline.

## Workflow

When you need to make an API call:

1. **Search** for the endpoint: `search <spec> "keyword" -n 5`
2. **Read** the output — it has everything: path, method, params, request body fields with types, response schema
3. **Construct** your API call using the exact fields, types, and enums from the output
4. If results are too broad, refine with more specific keywords or use `detail` for a known endpoint

When exploring an unfamiliar API:

1. **List** all endpoints: `list <spec>`
2. **Browse by tag**: `tags <spec>` then `tag <spec> "category"`
3. **Search** for specific functionality as needed

Do NOT read the raw Swagger/OpenAPI spec file directly. It's large, full of `$ref` indirection, and hard to extract actionable details from. Always use this tool instead.
