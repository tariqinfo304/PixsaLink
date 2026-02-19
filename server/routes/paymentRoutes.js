import express from 'express';
import { createPayment, getPayments, deletePayment } from '../controllers/paymentController.js';
import { protect, checkLicense } from '../middleware/auth.js';
import { getClientId } from '../middleware/getClientId.js';

const router = express.Router();

router.use(protect);
router.use(checkLicense);
router.use(getClientId);

router.post('/', createPayment);
router.get('/', getPayments);
router.delete('/:id', deletePayment);

export default router;
