export enum OrderState {
    Pending = 'PENDING',
    Confirmed = 'CONFIRMED',
    Shipped = 'SHIPPED',
    Delivered = 'DELIVERED',
    Cancelled = 'CANCELLED',
}

export interface Customer {
    id: string;
    name: string;
    country: string;
    createdAt: string;
    lastOrderAt: string | null;
}

export interface LineItem {
    productId: string;
    name: string;
    quantity: number;
    /** @description Unit price in base currency units (e.g. cents) */
    price: number;
}

export interface Order {
    id: string;
    customerId: string;
    state: OrderState;
    currency: string;
    /** @description Total order amount in base currency units (e.g. cents) */
    amount: number;
    createdAt: string;
    completedAt: string | null;
    lineItems: LineItem[];
}
