import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/analytics', authenticate, dashboardController.getAnalytics);

export default router;
