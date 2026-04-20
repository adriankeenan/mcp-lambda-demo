import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {z} from 'zod';
import {fieldsSchema, filterFields} from './utils.js';
import {CUSTOMERS, ORDERS} from "./data";
import {customerSchema, orderSchema} from "./zod";

export function createMcpServer(): McpServer {
    const server = new McpServer({name: 'test-server', version: '1.0.0'});

    server.registerTool('get_customers', {
        description: 'Get a list of customers',
        inputSchema: {
            ...fieldsSchema,
        },
        outputSchema: {
            customers: z.array(customerSchema.partial()),
        },
    }, async ({_fields}) => {
        return {structuredContent: {customers: filterFields(CUSTOMERS, _fields)}, content: []};
    });

    server.registerTool('get_customer_orders', {
        description: 'Get orders',
        inputSchema: {
            customerId: z.string().describe('The ID of the customer').optional(),
            ...fieldsSchema,
        },
        outputSchema: {
            orders: z.array(orderSchema.partial()),
        },
    }, async ({customerId, _fields}) => {
        const orders = ORDERS.filter(order => !customerId || order.customerId === customerId);
        return {structuredContent: {orders: filterFields(orders, _fields)}, content: []};
    });

    return server;
}
