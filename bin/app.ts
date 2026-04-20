#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { McpStack } from '../infra/mcp-stack';

const app = new cdk.App();
new McpStack(app, 'McpStack');
