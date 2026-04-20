import {timingSafeEqual} from 'crypto';

interface AuthorizerEvent {
    headers?: Record<string, string>;
    queryStringParameters?: Record<string, string>;
}

const PASSWORD = 'changeme';

function safeCompare(a: string, b: string): boolean {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    return timingSafeEqual(aBuf, bBuf);
}

export const handler = async (event: AuthorizerEvent): Promise<{ isAuthorized: boolean }> => {
    const authHeader = event.headers?.['authorization'] ?? null;
    const queryToken = event.queryStringParameters?.['token'] ?? null;

    let token = authHeader ?? queryToken ?? '';

    const header = 'Bearer ';
    if (token.startsWith(header)) {
        token = token.slice(header.length).trim();
    }

    const isAuthorized = safeCompare(token, PASSWORD);

    return {isAuthorized};
};
