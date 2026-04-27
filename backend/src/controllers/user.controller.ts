import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';

export class UserController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await userService.list(page, limit);
      res.json(result);
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.create(req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.update(req.params.id as string, req.body);
      res.json(result);
    } catch (err) { next(err); }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).user) throw new Error('Unauthenticated');
      const result = await userService.getMe((req as any).user.sub);
      res.json(result);
    } catch (err) { next(err); }
  }

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).user) throw new Error('Unauthenticated');
      const result = await userService.updateMe((req as any).user.sub, req.body);
      res.json(result);
    } catch (err) { next(err); }
  }
}

export const userController = new UserController();
