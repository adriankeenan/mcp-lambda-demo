import type {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';

export function lambdaRequestToFetchRequest(event: APIGatewayProxyEventV2): Request {
    const url = `https://${event.headers['host']}${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`;
    const {method} = event.requestContext.http;
    const bodyless = ['HEAD', 'GET'].includes(method);
    const bodyBytes = event.body && !bodyless
        ? (event.isBase64Encoded ? Buffer.from(event.body, 'base64') : Buffer.from(event.body))
        : undefined;

    return new Request(url, {
        method,
        headers: event.headers as Record<string, string>,
        body: bodyless ? undefined : bodyBytes,
    });
}

export async function fetchResponseToLambdaResponse(response: Response): Promise<APIGatewayProxyResultV2> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
        headers[key] = value;
    });

    return {
        statusCode: response.status,
        headers,
        body: await response.text(),
    };
}
