import { z } from 'zod';

export const fieldsSchema = {
    _fields: z
        .array(z.string())
        .optional()
        .describe(
            'Optional list of fields to include in the response, using dot notation for nested fields ' +
            '(e.g. ["id", "orders.lineItems.name"]). Omit or pass [] to include all fields.'
        ),
};



type FieldTree = { [key: string]: true | FieldTree };

function buildFieldTree(fields: string[]): FieldTree {
    const tree: FieldTree = {};
    for (const field of fields) {
        const parts = field.split('.');
        let node = tree;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (i === parts.length - 1) {
                node[part] = true;
            } else {
                const existing = node[part];
                if (existing === true) break; // broader include already covers this path
                if (existing === undefined) node[part] = {};
                node = node[part] as FieldTree;
            }
        }
    }
    return tree;
}

function applyTree(data: unknown, tree: FieldTree): unknown {
    if (data === null || data === undefined) return data;
    if (Array.isArray(data)) return data.map((item) => applyTree(item, tree));
    if (typeof data === 'object') {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(tree)) {
            if (!(key in (data as object))) continue;
            const subtree = tree[key];
            const value = (data as Record<string, unknown>)[key];
            result[key] = subtree === true ? value : applyTree(value, subtree);
        }
        return result;
    }
    return data; // primitive at non-leaf node — pass through
}

/**
 * Filters `data` to only include the fields listed in `fields`.
 * Fields use dot notation for nesting, e.g. "orders.lineItems.name".
 * If `fields` is undefined or empty, returns `data` unchanged.
 */
export function filterFields<T>(data: T, fields: string[] | undefined): T {
    if (!fields || fields.length === 0) return data;
    fields = Array.from(new Set(fields));
    return applyTree(data, buildFieldTree(fields)) as T;
}
