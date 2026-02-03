import { NextResponse } from "next/server"

/**
 * GET /api/docs
 * OpenAPI/Swagger documentation for the API
 */
export async function GET() {
  const apiDocs = {
    openapi: "3.0.0",
    info: {
      title: "StoryProof API",
      version: "1.0.0",
      description: "REST API for StoryProof IP protection platform",
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        description: "API Server",
      },
    ],
    paths: {
      "/api/portfolios/{address}": {
        get: {
          summary: "Get portfolio data",
          description: "Retrieve portfolio information for a wallet address",
          parameters: [
            {
              name: "address",
              in: "path",
              required: true,
              schema: {
                type: "string",
                pattern: "^0x[a-fA-F0-9]{40}$",
              },
              description: "Wallet address (0x format)",
            },
          ],
          responses: {
            "200": {
              description: "Portfolio data",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      address: { type: "string" },
                      visibility: { type: "string", enum: ["public", "private"] },
                      stats: {
                        type: "object",
                        properties: {
                          files: { type: "number" },
                          ipAssets: { type: "number" },
                          verified: { type: "number" },
                        },
                      },
                      files: { type: "array" },
                      ipAssets: { type: "array" },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid address format" },
            "500": { description: "Server error" },
          },
        },
      },
      "/api/ip-assets/{assetId}": {
        get: {
          summary: "Get IP Asset details",
          description: "Retrieve IP Asset information by ID",
          parameters: [
            {
              name: "assetId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "IP Asset data",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      assetId: { type: "string" },
                      owner: { type: "string" },
                      metadata: { type: "object" },
                      transactionHash: { type: "string" },
                      registeredAt: { type: "number" },
                      versions: { type: "array" },
                    },
                  },
                },
              },
            },
            "404": { description: "IP Asset not found" },
            "500": { description: "Server error" },
          },
        },
        patch: {
          summary: "Update IP Asset",
          description: "Update IP Asset metadata",
          parameters: [
            {
              name: "assetId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    metadata: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "IP Asset updated" },
            "500": { description: "Server error" },
          },
        },
      },
      "/api/analytics/{address}": {
        get: {
          summary: "Get analytics data",
          description: "Retrieve analytics for a wallet address",
          parameters: [
            {
              name: "address",
              in: "path",
              required: true,
              schema: {
                type: "string",
                pattern: "^0x[a-fA-F0-9]{40}$",
              },
            },
            {
              name: "period",
              in: "query",
              schema: {
                type: "string",
                enum: ["7d", "30d", "90d", "all"],
                default: "30d",
              },
            },
          ],
          responses: {
            "200": {
              description: "Analytics data",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      address: { type: "string" },
                      period: { type: "string" },
                      stats: { type: "object" },
                      charts: { type: "object" },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid address format" },
            "500": { description: "Server error" },
          },
        },
      },
      "/api/webhooks": {
        post: {
          summary: "Webhook handler",
          description: "Receive webhook events from external services",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["type", "payload"],
                  properties: {
                    type: {
                      type: "string",
                      enum: [
                        "ipfs_upload",
                        "blockchain_tx",
                        "ip_asset_registered",
                        "version_checkpoint",
                      ],
                    },
                    payload: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Webhook received" },
            "400": { description: "Invalid webhook type" },
            "500": { description: "Server error" },
          },
        },
        get: {
          summary: "Get webhook configuration",
          description: "Retrieve webhook endpoint information",
          responses: {
            "200": {
              description: "Webhook configuration",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      webhooks: {
                        type: "object",
                        properties: {
                          supported: { type: "array", items: { type: "string" } },
                          endpoint: { type: "string" },
                          method: { type: "string" },
                          format: { type: "object" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }

  return NextResponse.json(apiDocs)
}

