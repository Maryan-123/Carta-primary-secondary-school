import { Router } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { API_PREFIX } from "../config/constants";
import { checkDatabaseConnection } from "../config/database";
import { sendSuccess } from "../utils/api-response";

const router = Router();

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "School Management Backend API",
      version: "1.0.0"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: []
});

router.get(`${API_PREFIX}/health`, async (_request, response, next) => {
  try {
    await checkDatabaseConnection();
    sendSuccess(response, 200, "School management backend is running", {
      server: "online",
      database: "connected",
      environment: process.env.NODE_ENV ?? "development",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

router.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export { router };
