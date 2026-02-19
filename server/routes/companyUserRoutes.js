import express from 'express';
import {
  getCompanyUsers,
  createCompanyUser,
  updateCompanyUser,
  deactivateCompanyUser,
} from '../controllers/companyUserController.js';
import { protect, checkLicense, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('company'));
router.use(checkLicense);

router.get('/', getCompanyUsers);
router.post('/', createCompanyUser);
router.put('/:id', updateCompanyUser);
router.patch('/:id/deactivate', deactivateCompanyUser);

export default router;
