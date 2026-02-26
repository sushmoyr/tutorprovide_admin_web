#!/usr/bin/env python3
"""
Swagger/OpenAPI Endpoint Search Tool

A CLI tool that lets an AI agent (e.g., Claude Code) search API endpoints
by keyword and get full details including resolved request/response models,
query params, path params, headers, etc.

Usage:
    # Search endpoints by keyword
    python swagger_search.py search <swagger_file> <keyword> [--max-results 5]

    # List all endpoints (summary view)
    python swagger_search.py list <swagger_file>

    # Get full details of a specific endpoint
    python swagger_search.py detail <swagger_file> <method> <path>

    # List all tags/groups
    python swagger_search.py tags <swagger_file>

    # Search by tag
    python swagger_search.py tag <swagger_file> <tag_name>
"""

import json
import sys
import argparse
import re
from copy import deepcopy


# ─── Schema / $ref Resolution ────────────────────────────────────────────────

def resolve_ref(ref_string, root_spec):
    """Resolve a $ref like '#/definitions/User' or '#/components/schemas/User'."""
    if not ref_string.startswith("#/"):
        return {"type": "external_ref", "$ref": ref_string}
    parts = ref_string.lstrip("#/").split("/")
    node = root_spec
    for part in parts:
        node = node.get(part, {})
    return node


def resolve_schema(schema, root_spec, depth=0, max_depth=10, seen=None):
    """
    Recursively resolve a schema, expanding $ref, allOf, oneOf, anyOf,
    and nested object/array properties. Handles circular references.
    """
    if schema is None:
        return None
    if depth > max_depth:
        return {"type": "object", "_note": "max depth reached"}

    if seen is None:
        seen = set()

    # Handle $ref
    if "$ref" in schema:
        ref = schema["$ref"]
        if ref in seen:
            return {"type": "object", "_circular_ref": ref}
        seen = seen | {ref}
        resolved = resolve_ref(ref, root_spec)
        return resolve_schema(resolved, root_spec, depth + 1, max_depth, seen)

    schema = deepcopy(schema)

    # Handle allOf (merge schemas)
    if "allOf" in schema:
        merged = {}
        merged_props = {}
        merged_required = []
        for sub in schema["allOf"]:
            resolved_sub = resolve_schema(sub, root_spec, depth + 1, max_depth, seen)
            merged_props.update(resolved_sub.get("properties", {}))
            merged_required.extend(resolved_sub.get("required", []))
            merged.update(resolved_sub)
        merged["properties"] = merged_props
        if merged_required:
            merged["required"] = list(set(merged_required))
        merged.pop("allOf", None)
        return merged

    # Handle oneOf / anyOf
    for keyword in ("oneOf", "anyOf"):
        if keyword in schema:
            schema[keyword] = [
                resolve_schema(s, root_spec, depth + 1, max_depth, seen)
                for s in schema[keyword]
            ]
            return schema

    # Handle object properties
    if "properties" in schema:
        for prop_name, prop_schema in schema["properties"].items():
            schema["properties"][prop_name] = resolve_schema(
                prop_schema, root_spec, depth + 1, max_depth, seen
            )

    # Handle additionalProperties
    if isinstance(schema.get("additionalProperties"), dict):
        schema["additionalProperties"] = resolve_schema(
            schema["additionalProperties"], root_spec, depth + 1, max_depth, seen
        )

    # Handle array items
    if "items" in schema:
        schema["items"] = resolve_schema(
            schema["items"], root_spec, depth + 1, max_depth, seen
        )

    return schema


# ─── Endpoint Extraction ─────────────────────────────────────────────────────

def extract_parameters(params_list, root_spec):
    """Extract and resolve parameters, grouped by location (query, path, header, cookie)."""
    grouped = {"path": [], "query": [], "header": [], "cookie": []}
    if not params_list:
        return grouped

    for param in params_list:
        # Resolve param-level $ref
        if "$ref" in param:
            param = resolve_ref(param["$ref"], root_spec)

        location = param.get("in", "query")
        entry = {
            "name": param.get("name"),
            "required": param.get("required", False),
            "description": param.get("description", ""),
        }

        # OpenAPI 3.x schema
        if "schema" in param:
            entry["schema"] = resolve_schema(param["schema"], root_spec)
        # Swagger 2.x type
        elif "type" in param:
            entry["schema"] = {"type": param.get("type"), "format": param.get("format")}
            if "enum" in param:
                entry["schema"]["enum"] = param["enum"]
            if "default" in param:
                entry["schema"]["default"] = param["default"]

        grouped.setdefault(location, []).append(entry)

    # Remove empty groups
    return {k: v for k, v in grouped.items() if v}


def extract_request_body(operation, root_spec):
    """Extract request body schema (supports both OpenAPI 3.x and Swagger 2.x)."""
    # OpenAPI 3.x
    if "requestBody" in operation:
        rb = operation["requestBody"]
        if "$ref" in rb:
            rb = resolve_ref(rb["$ref"], root_spec)
        result = {
            "required": rb.get("required", False),
            "description": rb.get("description", ""),
            "content": {},
        }
        for media_type, media_obj in rb.get("content", {}).items():
            schema = resolve_schema(media_obj.get("schema", {}), root_spec)
            result["content"][media_type] = schema
        return result

    # Swagger 2.x — look for 'body' parameter
    for param in operation.get("parameters", []):
        if "$ref" in param:
            param = resolve_ref(param["$ref"], root_spec)
        if param.get("in") == "body":
            return {
                "required": param.get("required", False),
                "description": param.get("description", ""),
                "content": {
                    "application/json": resolve_schema(
                        param.get("schema", {}), root_spec
                    )
                },
            }
    return None


def extract_responses(responses, root_spec):
    """Extract and resolve response schemas."""
    result = {}
    for status_code, resp_obj in (responses or {}).items():
        if "$ref" in resp_obj:
            resp_obj = resolve_ref(resp_obj["$ref"], root_spec)

        entry = {
            "description": resp_obj.get("description", ""),
        }

        # OpenAPI 3.x
        if "content" in resp_obj:
            entry["content"] = {}
            for media_type, media_obj in resp_obj["content"].items():
                entry["content"][media_type] = resolve_schema(
                    media_obj.get("schema", {}), root_spec
                )
        # Swagger 2.x
        elif "schema" in resp_obj:
            entry["content"] = {
                "application/json": resolve_schema(resp_obj["schema"], root_spec)
            }

        result[str(status_code)] = entry
    return result


def extract_endpoints(spec):
    """Extract all endpoints with fully resolved details."""
    endpoints = []
    http_methods = {"get", "post", "put", "patch", "delete", "options", "head"}

    # Path-level parameters (shared across methods)
    for path, path_obj in spec.get("paths", {}).items():
        path_params = path_obj.get("parameters", [])

        for method in http_methods:
            if method not in path_obj:
                continue
            operation = path_obj[method]

            # Merge path-level and operation-level parameters
            all_params = path_params + operation.get("parameters", [])

            # Filter out 'body' params for Swagger 2.x (handled in request body)
            non_body_params = []
            for p in all_params:
                resolved_p = p
                if "$ref" in p:
                    resolved_p = resolve_ref(p["$ref"], spec)
                if resolved_p.get("in") != "body":
                    non_body_params.append(p)

            endpoint = {
                "path": path,
                "method": method.upper(),
                "summary": operation.get("summary", ""),
                "description": operation.get("description", ""),
                "operationId": operation.get("operationId", ""),
                "tags": operation.get("tags", []),
                "deprecated": operation.get("deprecated", False),
                "parameters": extract_parameters(non_body_params, spec),
                "request_body": extract_request_body(operation, spec),
                "responses": extract_responses(operation.get("responses", {}), spec),
                "security": operation.get("security", []),
            }
            endpoints.append(endpoint)

    return endpoints


# ─── Search ──────────────────────────────────────────────────────────────────

def search_endpoints(endpoints, keyword):
    """Search endpoints by keyword across summary, description, operationId, tags, path, and param names."""
    keyword_lower = keyword.lower()
    # Support multi-word search: all words must match
    keywords = keyword_lower.split()
    scored = []

    for ep in endpoints:
        searchable_parts = {
            "path": ep["path"].lower(),
            "method": ep["method"].lower(),
            "summary": ep["summary"].lower(),
            "description": ep["description"].lower(),
            "operationId": ep["operationId"].lower(),
            "tags": " ".join(ep["tags"]).lower(),
        }
        # Add parameter names
        param_names = []
        for group in ep["parameters"].values():
            for p in group:
                param_names.append(p["name"].lower())
        searchable_parts["params"] = " ".join(param_names)

        all_text = " ".join(searchable_parts.values())

        # All keywords must be present
        if not all(kw in all_text for kw in keywords):
            continue

        # Score: prioritize matches in path/summary/operationId
        score = 0
        for kw in keywords:
            if kw in searchable_parts["path"]:
                score += 10
            if kw in searchable_parts["summary"]:
                score += 8
            if kw in searchable_parts["operationId"]:
                score += 8
            if kw in searchable_parts["tags"]:
                score += 5
            if kw in searchable_parts["description"]:
                score += 3
            if kw in searchable_parts["params"]:
                score += 2

        scored.append((score, ep))

    scored.sort(key=lambda x: -x[0])
    return [ep for _, ep in scored]


# ─── Formatters ──────────────────────────────────────────────────────────────

def format_schema_compact(schema, indent=0):
    """Format a resolved schema into a compact, readable string."""
    if schema is None:
        return "null"
    prefix = "  " * indent

    if "_circular_ref" in schema:
        return f"{prefix}(circular: {schema['_circular_ref']})"

    schema_type = schema.get("type", "object")
    enum_vals = schema.get("enum")

    if enum_vals:
        return f"{schema_type} enum: {enum_vals}"

    if schema_type == "array":
        items = schema.get("items", {})
        items_str = format_schema_compact(items, indent + 1)
        return f"array of:\n{prefix}  {items_str}"

    if schema_type == "object" or "properties" in schema:
        if not schema.get("properties"):
            additional = schema.get("additionalProperties")
            if additional:
                return f"object (additionalProperties: {format_schema_compact(additional, indent + 1)})"
            return "object"

        required = set(schema.get("required", []))
        lines = ["object {"]
        for prop_name, prop_schema in schema["properties"].items():
            req_mark = " *required*" if prop_name in required else ""
            prop_desc = prop_schema.get("description", "")
            desc_suffix = f"  // {prop_desc}" if prop_desc else ""
            prop_type = format_schema_compact(prop_schema, indent + 1)
            lines.append(f"{prefix}  {prop_name}: {prop_type}{req_mark}{desc_suffix}")
        lines.append(f"{prefix}}}")
        return "\n".join(lines)

    # oneOf / anyOf
    for keyword in ("oneOf", "anyOf"):
        if keyword in schema:
            variants = []
            for s in schema[keyword]:
                variants.append(format_schema_compact(s, indent + 1))
            return f"{keyword}:\n" + "\n".join(f"{prefix}  | {v}" for v in variants)

    # Simple type
    fmt = schema.get("format", "")
    type_str = f"{schema_type}({fmt})" if fmt else schema_type
    default = schema.get("default")
    if default is not None:
        type_str += f" default={default}"
    return type_str


def format_endpoint_full(ep):
    """Format a single endpoint with all details."""
    lines = []
    lines.append(f"{'=' * 70}")
    dep = " [DEPRECATED]" if ep["deprecated"] else ""
    lines.append(f"{ep['method']} {ep['path']}{dep}")
    if ep["summary"]:
        lines.append(f"Summary: {ep['summary']}")
    if ep["description"]:
        lines.append(f"Description: {ep['description']}")
    if ep["operationId"]:
        lines.append(f"Operation ID: {ep['operationId']}")
    if ep["tags"]:
        lines.append(f"Tags: {', '.join(ep['tags'])}")

    # Parameters
    for location, params in ep["parameters"].items():
        if params:
            lines.append(f"\n  {location.upper()} PARAMETERS:")
            for p in params:
                req = " (required)" if p["required"] else " (optional)"
                schema_str = format_schema_compact(p.get("schema", {}), 2)
                lines.append(f"    - {p['name']}: {schema_str}{req}")
                if p["description"]:
                    lines.append(f"      {p['description']}")

    # Request Body
    if ep["request_body"]:
        rb = ep["request_body"]
        req = " (required)" if rb.get("required") else " (optional)"
        lines.append(f"\n  REQUEST BODY{req}:")
        if rb.get("description"):
            lines.append(f"    {rb['description']}")
        for media_type, schema in rb.get("content", {}).items():
            lines.append(f"    Content-Type: {media_type}")
            lines.append(f"    Schema: {format_schema_compact(schema, 3)}")

    # Responses
    if ep["responses"]:
        lines.append(f"\n  RESPONSES:")
        for status_code, resp in ep["responses"].items():
            lines.append(f"    {status_code}: {resp['description']}")
            for media_type, schema in resp.get("content", {}).items():
                lines.append(f"      Content-Type: {media_type}")
                lines.append(f"      Schema: {format_schema_compact(schema, 4)}")

    lines.append("")
    return "\n".join(lines)


def format_endpoint_summary(ep):
    """One-line summary of an endpoint."""
    dep = " [DEPRECATED]" if ep["deprecated"] else ""
    tags = f" [{', '.join(ep['tags'])}]" if ep["tags"] else ""
    return f"  {ep['method']:7s} {ep['path']}{dep}{tags} — {ep['summary']}"


# ─── CLI Commands ────────────────────────────────────────────────────────────

def load_spec(filepath):
    """Load a Swagger/OpenAPI spec from JSON or YAML."""
    with open(filepath, encoding="utf-8") as f:
        if filepath.endswith((".yaml", ".yml")):
            try:
                import yaml
                return yaml.safe_load(f)
            except ImportError:
                print("ERROR: PyYAML is required for YAML files. Install: pip install pyyaml")
                sys.exit(1)
        return json.load(f)


def cmd_search(args):
    spec = load_spec(args.file)
    endpoints = extract_endpoints(spec)
    results = search_endpoints(endpoints, args.keyword)

    if not results:
        print(f"No endpoints found matching '{args.keyword}'")
        return

    max_r = args.max_results or len(results)
    results = results[:max_r]
    print(f"Found {len(results)} endpoint(s) matching '{args.keyword}':\n")
    for ep in results:
        print(format_endpoint_full(ep))


def cmd_list(args):
    spec = load_spec(args.file)
    endpoints = extract_endpoints(spec)
    print(f"Total endpoints: {len(endpoints)}\n")
    for ep in endpoints:
        print(format_endpoint_summary(ep))


def cmd_detail(args):
    spec = load_spec(args.file)
    endpoints = extract_endpoints(spec)
    method = args.method.upper()
    path = args.path

    for ep in endpoints:
        if ep["method"] == method and ep["path"] == path:
            print(format_endpoint_full(ep))
            return

    print(f"Endpoint not found: {method} {path}")
    print("Use 'list' command to see all available endpoints.")


def cmd_tags(args):
    spec = load_spec(args.file)
    endpoints = extract_endpoints(spec)
    tags = {}
    for ep in endpoints:
        for tag in ep.get("tags", ["untagged"]):
            tags.setdefault(tag, []).append(ep)

    for tag in sorted(tags):
        print(f"\n[{tag}] ({len(tags[tag])} endpoints)")
        for ep in tags[tag]:
            print(format_endpoint_summary(ep))


def cmd_tag(args):
    spec = load_spec(args.file)
    endpoints = extract_endpoints(spec)
    tag_lower = args.tag_name.lower()
    results = [ep for ep in endpoints if any(tag_lower in t.lower() for t in ep.get("tags", []))]

    if not results:
        print(f"No endpoints found with tag '{args.tag_name}'")
        return

    print(f"Endpoints tagged '{args.tag_name}':\n")
    for ep in results:
        print(format_endpoint_full(ep))


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Search and inspect Swagger/OpenAPI endpoints with resolved schemas."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # search
    p_search = subparsers.add_parser("search", help="Search endpoints by keyword")
    p_search.add_argument("file", help="Path to Swagger/OpenAPI JSON or YAML file")
    p_search.add_argument("keyword", help="Keyword(s) to search for (space-separated = AND)")
    p_search.add_argument("--max-results", "-n", type=int, default=5, help="Max results (default: 5)")

    # list
    p_list = subparsers.add_parser("list", help="List all endpoints (summary)")
    p_list.add_argument("file", help="Path to Swagger/OpenAPI JSON or YAML file")

    # detail
    p_detail = subparsers.add_parser("detail", help="Get full details of a specific endpoint")
    p_detail.add_argument("file", help="Path to Swagger/OpenAPI JSON or YAML file")
    p_detail.add_argument("method", help="HTTP method (GET, POST, etc.)")
    p_detail.add_argument("path", help="Endpoint path (e.g., /api/users)")

    # tags
    p_tags = subparsers.add_parser("tags", help="List all tags with endpoints")
    p_tags.add_argument("file", help="Path to Swagger/OpenAPI JSON or YAML file")

    # tag
    p_tag = subparsers.add_parser("tag", help="Search endpoints by tag name")
    p_tag.add_argument("file", help="Path to Swagger/OpenAPI JSON or YAML file")
    p_tag.add_argument("tag_name", help="Tag name to filter by")

    args = parser.parse_args()

    commands = {
        "search": cmd_search,
        "list": cmd_list,
        "detail": cmd_detail,
        "tags": cmd_tags,
        "tag": cmd_tag,
    }
    commands[args.command](args)


if __name__ == "__main__":
    main()
