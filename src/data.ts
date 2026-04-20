import {Customer, Order, OrderState} from "./models";

export const CUSTOMERS: Customer[] = [
    {
        id: '1',
        name: 'Alice Smith',
        country: 'GB',
        createdAt: '2026-02-11T10:00:00Z',
        lastOrderAt: '2026-04-01T14:30:00Z',
    },
    {
        id: '2',
        name: 'Bob Johnson',
        country: 'US',
        createdAt: '2026-02-18T12:00:00Z',
        lastOrderAt: null,
    },
    {
        id: '3',
        name: 'Jane Doe',
        country: 'DE',
        createdAt: '2026-02-24T08:45:00Z',
        lastOrderAt: '2026-04-10T11:00:00Z',
    },
];

export const ORDERS: Order[] = [
    {
        id: '101',
        customerId: '1',
        state: OrderState.Delivered,
        currency: 'GBP',
        amount: 4999,
        createdAt: '2026-04-01T14:30:00Z',
        completedAt: '2026-04-05T10:00:00Z',
        lineItems: [
            {productId: 'prod-001', name: 'Widget A', quantity: 1, price: 2999},
            {productId: 'prod-002', name: 'Widget B', quantity: 2, price: 1000},
        ],
    },
    {
        id: '102',
        customerId: '1',
        state: OrderState.Cancelled,
        currency: 'GBP',
        amount: 1999,
        createdAt: '2026-03-12T09:00:00Z',
        completedAt: null,
        lineItems: [
            {productId: 'prod-003', name: 'Widget C', quantity: 1, price: 1999},
        ],
    },
    {
        id: '103',
        customerId: '3',
        state: OrderState.Delivered,
        currency: 'EUR',
        amount: 8750,
        createdAt: '2026-03-20T09:15:00Z',
        completedAt: '2026-03-25T14:00:00Z',
        lineItems: [
            {productId: 'prod-004', name: 'Gadget X', quantity: 2, price: 3500},
            {productId: 'prod-001', name: 'Widget A', quantity: 1, price: 1750},
        ],
    },
    {
        id: '104',
        customerId: '3',
        state: OrderState.Shipped,
        currency: 'EUR',
        amount: 5200,
        createdAt: '2026-04-10T11:00:00Z',
        completedAt: null,
        lineItems: [
            {productId: 'prod-005', name: 'Gizmo Pro', quantity: 1, price: 4500},
            {productId: 'prod-002', name: 'Widget B', quantity: 7, price: 100},
        ],
    },
    {
        id: '105',
        customerId: '3',
        state: OrderState.Pending,
        currency: 'EUR',
        amount: 12000,
        createdAt: '2026-04-13T17:30:00Z',
        completedAt: null,
        lineItems: [
            {productId: 'prod-006', name: 'Deluxe Kit', quantity: 1, price: 12000},
        ],
    },
];