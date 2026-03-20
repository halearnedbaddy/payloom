import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getReceipts, getReceipt, getReceiptHtml, markReceiptSent } from '../controllers/receiptController';

const router = Router();

router.get('/view/:id', getReceiptHtml);

router.use(authenticate);
router.get('/', getReceipts);
router.get('/:id', getReceipt);
router.patch('/:id/sent', markReceiptSent);

export default router;
