import {WebStandardStreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import type {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {lambdaRequestToFetchRequest, fetchResponseToLambdaResponse} from './mapping.js';
import {createMcpServer} from './mcp.js';

const HTML_RESPONSE: APIGatewayProxyResultV2 = {
    statusCode: 400,
    headers: {'Content-Type': 'text/html'},
    body: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>MCP Endpoint</title></head>
<body>
  <h1>MCP Endpoint</h1>
  <p>This endpoint is for use by MCP (Model Context Protocol) tools only.</p>
  <p>It is not intended to be accessed directly from a browser.</p>
</body>
</html>`,
};

function isMcpRequest(contentType: string | undefined, body: string | null | undefined): boolean {
    if (!contentType?.includes('application/json')) {
        return false;
    }
    try {
        const parsed = JSON.parse(body ?? '');
        return parsed !== null && typeof parsed === 'object' && 'jsonrpc' in parsed;
    } catch {
        return false;
    }
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const requestBody = event.isBase64Encoded ?
            Buffer.from(event.body ?? '', 'base64').toString('utf-8') : event.body;
        console.log('Request: ', requestBody);

        if (!isMcpRequest(event.headers['content-type'], requestBody)) {
            return HTML_RESPONSE;
        }

        const request = lambdaRequestToFetchRequest(event);
        const transport = new WebStandardStreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true,
        });
        await createMcpServer().connect(transport);
        const response = await transport.handleRequest(request);
        return fetchResponseToLambdaResponse(response);
    } catch (error) {
        console.error('Error handling request:', error);
        throw error;
    }
};
