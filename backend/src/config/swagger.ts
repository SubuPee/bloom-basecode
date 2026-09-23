import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Bloom Ecommerce API",
      version: "1.0.0",
      description:
        "REST API for the Bloom Ecommerce platform and Supervision Admin Panel",
    },

    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Local development server",
      },
      {
        url: "/",
        description: "Current host (relative)",
      },
      {
        url: process.env.API_URL || "https://api.subupee.com",
        description: "Production server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {

        //  Authentication

        LoginRequest: {
          type: "object",

          required: ["email", "password"],

          properties: {
            email: {
              type: "string",
              format: "email",
              example: "admin@bloom-ecommerce.com",
            },

            password: {
              type: "string",
              format: "password",
              example: "Admin@123456",
            },
          },
        },

        LoginResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Login successful",
            },

            data: {
              type: "object",

              properties: {
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIs...",
                },

                user: {
                  type: "object",

                  properties: {
                    id: {
                      type: "string",
                    },

                    firstName: {
                      type: "string",
                      example: "Super",
                    },

                    lastName: {
                      type: "string",
                      example: "Admin",
                    },

                    email: {
                      type: "string",
                      example: "admin@bloom-ecommerce.com",
                    },

                    role: {
                      type: "string",
                      example: "Super Admin",
                    },

                    permissions: {
                      type: "array",

                      items: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
          },
        },

        // -----------------------------------------
        // Category Master
        // -----------------------------------------

        Category: {
          type: "object",

          properties: {
            id: {
              type: "string",
              example: "68b123456789abcdef123456",
            },

            categoryCode: {
              type: "string",
              example: "CAT001",
            },

            categoryName: {
              type: "string",
              example: "Electronics",
            },

            parentCategory: {
              type: "string",
              nullable: true,
              example: null,
            },

            status: {
              type: "string",
              enum: ["active", "inactive"],
              example: "active",
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CategoryCreateRequest: {
          type: "object",

          required: ["categoryCode", "categoryName"],

          properties: {
            categoryCode: {
              type: "string",
              example: "CAT001",
            },

            categoryName: {
              type: "string",
              example: "Electronics",
            },

            parentCategory: {
              type: "string",
              nullable: true,
              example: null,
            },

            status: {
              type: "string",
              enum: ["active", "inactive"],
              example: "active",
            },
          },
        },

        CategoryUpdateRequest: {
          type: "object",

          properties: {
            categoryCode: {
              type: "string",
              example: "CAT001",
            },

            categoryName: {
              type: "string",
              example: "Electronics",
            },

            parentCategory: {
              type: "string",
              nullable: true,
              example: null,
            },

            status: {
              type: "string",
              enum: ["active", "inactive"],
              example: "active",
            },
          },
        },

        CategoryStatusRequest: {
          type: "object",

          required: ["status"],

          properties: {
            status: {
              type: "string",
              enum: ["active", "inactive"],
              example: "inactive",
            },
          },
        },
      },
    },
  },

  apis: [
    "./src/routes/*.ts",
    "./src/routes/**/*.ts",
    "./src/routes/*.js",
    "./src/routes/**/*.routes.js",
    "./src/routes/**/*.js",
    "./dist/routes/*.js",
    "./dist/routes/**/*.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;