import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema, updateMeSchema } from '../validators/user.schema';
import { Role } from '../types';

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, validate(updateMeSchema), userController.updateMe);

router.get('/', authenticate, authorize(Role.ADMIN), userController.list);
router.post('/', authenticate, authorize(Role.ADMIN), validate(createUserSchema), userController.create);
router.patch('/:id', authenticate, authorize(Role.ADMIN), validate(updateUserSchema), userController.update);

export default router;
