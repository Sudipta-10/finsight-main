import { Request, Response, NextFunction } from 'express';
import { recordService } from '../services/record.service';

export class RecordController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recordService.list(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recordService.getById(req.params.id as string);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).user) throw new Error('Unauthenticated');
      const result = await recordService.create(req.body, (req as any).user.sub);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recordService.update(req.params.id as string, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await recordService.delete(req.params.id as string);
      res.json({ message: 'Record deleted' });
    } catch (err) {
      next(err);
    }
  }
}

export const recordController = new RecordController();
