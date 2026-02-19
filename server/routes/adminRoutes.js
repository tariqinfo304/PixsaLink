import express from 'express';
import {
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
  issueLicense,
  getAllVendors,
  getDirectClients,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin'));

router.post('/create-company', createCompany);
router.get('/companies', getCompanies);
router.put('/company/:id', updateCompany);
router.delete('/company/:id', deleteCompany);
router.post('/issue-license', issueLicense);
router.get('/vendors', getAllVendors);
router.get('/direct-clients', getDirectClients);

export default router;
