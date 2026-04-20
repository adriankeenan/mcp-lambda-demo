import {WebStandardStreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import type {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {lambdaRequestToFetchRequest, fetchResponseToLambdaResponse} from './mapping.js';
import {createMcpServer} from './mcp.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const requestBody = event.isBase64Encoded ?
            Buffer.from(event.body ?? '', 'base64').toString('utf-8') : event.body;
        console.log('Request: ', requestBody);

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
