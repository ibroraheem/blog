import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog API",
      version: "1.0.0",
      description: "A simple Express Blog API",
    },
    servers: [
      {
        url: "http://localhost:YOUR_PORT_NUMBER",
      },
    ],
  },
  // Path to your API routes folder or array of routes files.
  apis: ["./routes/*.ts"],
};

export default swaggerOptions;
