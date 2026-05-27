import express from 'express';
import {WebStandardStreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import {createMcpServer} from './mcp.js';

const PORT = process.env.PORT ?? 3000;
const app = express();

app.use(express.raw({type: '*/*'}));

app.post('/mcp', async (req, res) => {
    const url = `http://localhost:${PORT}${req.originalUrl}`;
    const request = new Request(url, {
        method: req.method,
        headers: req.headers as Record<string, string>,
        body: Buffer.isBuffer(req.body) && req.body.length > 0 ? req.body : undefined,
    });

    const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
    });
    await createMcpServer().connect(transport);
    const response = await transport.handleRequest(request);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.send(Buffer.from(await response.arrayBuffer()));
});

app.listen(PORT, () => {
    console.log(`MCP server running at http://localhost:${PORT}/mcp`);
});
