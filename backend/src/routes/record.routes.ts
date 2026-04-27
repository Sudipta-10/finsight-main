import { Router } from 'express';
import { recordController } from '../controllers/record.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createRecordSchema, updateRecordSchema, recordQuerySchema } from '../validators/record.schema';
import { Role } from '../types';

const router = Router();

router.get('/', authenticate, validate(recordQuerySchema, 'query'), recordController.list);
router.post('/', authenticate, authorize(Role.ANALYST, Role.ADMIN), validate(createRecordSchema), recordController.create);
router.get('/:id', authenticate, recordController.getById);
router.patch('/:id', authenticate, authorize(Role.ANALYST, Role.ADMIN), validate(updateRecordSchema), recordController.update);
router.delete('/:id', authenticate, authorize(Role.ADMIN), recordController.delete);

export default router;
