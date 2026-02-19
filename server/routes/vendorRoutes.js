import express from 'express';
import { createVendor, getVendors, updateVendor, deleteVendor } from '../controllers/vendorController.js';
import { protect, checkLicense } from '../middleware/auth.js';
import { getClientId } from '../middleware/getClientId.js';

const router = express.Router();

router.use(protect);
router.use(checkLicense);
router.use(getClientId);

router.post('/', createVendor);
router.get('/', getVendors);
router.put('/:id', updateVendor);
router.delete('/:id', deleteVendor);

export default router;
