import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const result = await dashboardService.getAnalytics(
        startDate as string | undefined, 
        endDate as string | undefined
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const dashboardController = new DashboardController();
