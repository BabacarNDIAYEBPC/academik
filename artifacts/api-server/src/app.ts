import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer } from "node:http";
import { registerRoutes } from "./routes/routes";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({
  verify: (req, _res, buf) => {
    (req as any).rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: false }));

app.use("/api", router);

export const httpServer = createServer(app);
await registerRoutes(httpServer, app);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  req.log.error({ err }, "Request failed");
  if (res.headersSent) return next(err);
  res.status(err.status || err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

export default app;
