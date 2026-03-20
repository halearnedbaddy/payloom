import { Request, Response } from 'express';
import { prisma } from '../config/database';

function getSellerId(req: Request, res: Response): string | null {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return null;
  }
  return req.user.userId;
}

async function getStoreId(sellerId: string): Promise<string | null> {
  const store = await prisma.store.findUnique({ where: { sellerId }, select: { id: true } });
  return store?.id ?? null;
}

export const getReceipts = async (req: Request, res: Response) => {
  try {
    const sellerId = getSellerId(req, res);
    if (!sellerId) return;
    const storeId = await getStoreId(sellerId);
    if (!storeId) return res.json({ success: true, data: [] });

    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.receipt.count({ where: { storeId } }),
    ]);

    res.json({
      success: true,
      data: receipts,
      pagination: { page: parseInt(page as string), limit: parseInt(limit as string), total },
    });
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch receipts' });
  }
};

export const getReceipt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const receipt = await prisma.receipt.findFirst({
      where: {
        OR: [{ id }, { receiptNumber: id }],
      },
      include: {
        posTransaction: {
          include: {
            items: true,
            session: { select: { sessionNumber: true } },
          },
        },
      },
    });

    if (!receipt) {
      return res.status(404).json({ success: false, error: 'Receipt not found' });
    }

    res.json({ success: true, data: receipt });
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch receipt' });
  }
};

export const getReceiptHtml = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const receipt = await prisma.receipt.findFirst({
      where: { OR: [{ id }, { receiptNumber: id }] },
      include: {
        posTransaction: { include: { items: true } },
      },
    });

    if (!receipt) {
      return res.status(404).send('<h1>Receipt not found</h1>');
    }

    const items = Array.isArray(receipt.items) ? receipt.items as any[] : [];
    const itemRows = items.map((item: any) => `
      <tr>
        <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0">${item.name || item.product_name || ''}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:right">KES ${Number(item.unit_price || item.unitPrice || 0).toLocaleString()}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:right">KES ${Number(item.total || 0).toLocaleString()}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Receipt ${receipt.receiptNumber}</title>
  <style>
    body { font-family: 'Courier New', monospace; max-width: 400px; margin: 0 auto; padding: 20px; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #00C896; padding-bottom: 12px; margin-bottom: 16px; }
    .logo { font-size: 22px; font-weight: bold; color: #00C896; }
    .store-name { font-size: 16px; color: #003D29; font-weight: bold; }
    .receipt-num { font-size: 12px; color: #666; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 11px; color: #666; text-transform: uppercase; padding: 4px; border-bottom: 1px solid #ddd; }
    .totals { margin-top: 12px; border-top: 2px solid #00C896; padding-top: 12px; }
    .total-row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 13px; }
    .grand-total { font-size: 18px; font-weight: bold; color: #00C896; }
    .payment-box { background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 6px; padding: 10px; margin: 16px 0; font-size: 13px; }
    .verified { color: #27AE60; font-weight: bold; }
    .footer { text-align: center; font-size: 11px; color: #999; margin-top: 20px; border-top: 1px dashed #ddd; padding-top: 12px; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">PAYLOOM INSTANTS</div>
    <div class="store-name">${receipt.sellerName || 'Store'}</div>
    <div class="receipt-num">Receipt #${receipt.receiptNumber}</div>
    <div style="font-size:11px;color:#666">${new Date(receipt.createdAt).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>KES ${Number(receipt.subtotal).toLocaleString()}</span></div>
    ${Number(receipt.tax) > 0 ? `<div class="total-row"><span>Tax (16% VAT)</span><span>KES ${Number(receipt.tax).toLocaleString()}</span></div>` : ''}
    ${Number(receipt.discount) > 0 ? `<div class="total-row" style="color:#E74C3C"><span>Discount</span><span>-KES ${Number(receipt.discount).toLocaleString()}</span></div>` : ''}
    <div class="total-row grand-total"><span>TOTAL</span><span>KES ${Number(receipt.total).toLocaleString()}</span></div>
  </div>

  <div class="payment-box">
    <div><strong>Payment:</strong> ${receipt.paymentMethod ?? 'N/A'}</div>
    ${receipt.mpesaCode ? `<div><strong>M-Pesa Code:</strong> ${receipt.mpesaCode}</div>` : ''}
    ${receipt.mpesaPhone ? `<div><strong>Phone:</strong> ${receipt.mpesaPhone}</div>` : ''}
    <div class="verified">✓ Payment Verified</div>
  </div>

  ${receipt.customerName ? `
  <div style="font-size:12px;margin-bottom:8px">
    <strong>Customer:</strong> ${receipt.customerName}
    ${receipt.customerPhone ? `<br><strong>Phone:</strong> ${receipt.customerPhone}` : ''}
  </div>` : ''}

  <div class="footer">
    <p>Thank you for your purchase!</p>
    ${receipt.sellerContact ? `<p>Contact: ${receipt.sellerContact}</p>` : ''}
    <p style="margin-top:8px">Powered by PayLoom Instants</p>
  </div>

  <div style="text-align:center;margin-top:16px">
    <button onclick="window.print()" style="background:#00C896;color:white;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px">🖨️ Print Receipt</button>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Get receipt HTML error:', error);
    res.status(500).send('<h1>Failed to generate receipt</h1>');
  }
};

export const markReceiptSent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.receipt.update({
      where: { id },
      data: { status: 'sent' },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Mark receipt sent error:', error);
    res.status(500).json({ success: false, error: 'Failed to update receipt' });
  }
};
