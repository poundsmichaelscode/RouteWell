import { Router } from "express";
import { authRouter } from "./auth.routes";
import { customerRouter, driverRouter, routeRouter, vehicleRouter } from "./crud.routes";
import { dashboardRouter } from "./dashboard.routes";
import { deliveryRouter } from "./delivery.routes";
import { userRouter } from "./user.routes";
import { notificationRouter } from "./notification.routes";

export const apiRouter = Router();
apiRouter.use("/auth", authRouter);
apiRouter.use("/deliveries", deliveryRouter);
apiRouter.use("/customers", customerRouter);
apiRouter.use("/drivers", driverRouter);
apiRouter.use("/vehicles", vehicleRouter);
apiRouter.use("/routes", routeRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/notifications", notificationRouter);
