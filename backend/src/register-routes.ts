import { Application } from "express";
import { router as baseRouter } from "./routes";
import { API_PREFIX } from "./config/constants";
import { accessRoutes } from "./modules/access/access.routes";
import { academicsRoutes } from "./modules/academics/academics.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { campusRoutes } from "./modules/campus/campus.routes";
import { financeRoutes } from "./modules/finance/finance.routes";
import { insightsRoutes } from "./modules/insights/insights.routes";
import { operationsRoutes } from "./modules/operations/operations.routes";
import { peopleRoutes } from "./modules/people/people.routes";
import { userRoutes } from "./modules/users/user.routes";
import { assessmentRoutes } from "./modules/assessment/assessment.routes";
import { uploadRoutes } from "./modules/uploads/upload.routes";

export const registerRoutes = (app: Application): void => {
  app.use(baseRouter);
  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}`, accessRoutes);
  app.use(`${API_PREFIX}`, assessmentRoutes);
  app.use(`${API_PREFIX}/users`, userRoutes);
  app.use(`${API_PREFIX}`, academicsRoutes);
  app.use(`${API_PREFIX}`, campusRoutes);
  app.use(`${API_PREFIX}`, financeRoutes);
  app.use(`${API_PREFIX}`, insightsRoutes);
  app.use(`${API_PREFIX}`, peopleRoutes);
  app.use(`${API_PREFIX}`, operationsRoutes);
  app.use(`${API_PREFIX}`, uploadRoutes);
};
