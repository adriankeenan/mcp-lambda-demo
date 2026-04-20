import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import {HttpLambdaIntegration} from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import {NodejsFunction, NodejsFunctionProps} from 'aws-cdk-lib/aws-lambda-nodejs';
import {Construct} from 'constructs';
import * as path from 'path';
import {LambdaProps} from "aws-cdk-lib/aws-ses-actions";

export class McpStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const baseLambdaProps: Partial<NodejsFunctionProps> = {
            handler: 'handler',
            runtime: lambda.Runtime.NODEJS_24_X,
            reservedConcurrentExecutions: 25,
            timeout: cdk.Duration.seconds(10),
            memorySize: 1024,
            bundling: {
                minify: false,
                sourceMap: true,
            }
        };

        const mcpFunction = new NodejsFunction(this, 'McpServerFunction', {
            entry: path.join(__dirname, '../src/server.ts'),
            functionName: 'mcpServer',
            ...baseLambdaProps,
        });

        const authorizerFunction = new NodejsFunction(this, 'McpAuthorizerFunction', {
            entry: path.join(__dirname, '../src/authorizer.ts'),
            functionName: 'mcpAuthorizer',
            ...baseLambdaProps,
        });

        const api = new apigwv2.HttpApi(this, 'McpApi', {
            corsPreflight: {
                allowOrigins: ['*'],
                allowMethods: [apigwv2.CorsHttpMethod.POST],
                allowHeaders: ['*'],
            },
        });

        // Use CfnAuthorizer (L1) so we can omit identitySource — HTTP API authorizers
        // require ALL identity sources to be present in the request, which would prevent
        // supporting both Bearer token and query parameter simultaneously.
        const cfnAuthorizer = new apigwv2.CfnAuthorizer(this, 'McpAuthorizer', {
            apiId: api.apiId,
            authorizerType: 'REQUEST',
            name: 'McpPasswordAuthorizer',
            authorizerPayloadFormatVersion: '2.0',
            enableSimpleResponses: true,
            authorizerUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${authorizerFunction.functionArn}/invocations`,
            // We can't enable caching as the authorizer supports fetching the token from either header or query param,
            // but we can only set a single source as the cache key :(
            authorizerResultTtlInSeconds: 0,
        });

        authorizerFunction.addPermission('ApiGwInvoke', {
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:${api.apiId}/*`,
        });

        const routes = api.addRoutes({
            path: '/mcp',
            methods: [apigwv2.HttpMethod.POST],
            integration: new HttpLambdaIntegration('McpIntegration', mcpFunction),
        });

        for (const route of routes) {
            const cfnRoute = route.node.defaultChild as apigwv2.CfnRoute;
            cfnRoute.authorizationType = 'CUSTOM';
            cfnRoute.authorizerId = cfnAuthorizer.ref;
        }

        new cdk.CfnOutput(this, 'McpEndpoint', {
            description: 'MCP Server endpoint URL',
            value: `${api.url}mcp`,
        });
    }
}
