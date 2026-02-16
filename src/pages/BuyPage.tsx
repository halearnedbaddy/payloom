import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/useCurrency';
import { LoaderIcon, ShieldIcon, CheckCircleIcon, ChevronRightIcon, XIcon } from '@/components/icons';
import { Copy } from 'lucide-react';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabaseProject';
import { validateTransactionCode } from '@/lib/transactionValidation';
import { PaymentMethodModal } from '@/components/PaymentMethodModal';

interface PaymentLinkData {
  id: string;
  productName: string;
  productDescription?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  status: string;
  seller: {
    id: string;
    name: string;
    sellerProfile?: {
      rating: number;
      totalReviews: number;
      isVerified: boolean;
    };
  };
}

interface SellerPaymentMethod {
  id: string;
  provider: string;
  type: string;
  account_name: string;
  account_number: string;
  is_active: boolean | null;
  is_default: boolean | null;
  // Derived fields
  payment_type: string;
  details: Record<string, string> | null;
}

type CheckoutStep = 'details' | 'select-method' | 'submit-payment' | 'submitting' | 'success';

export function BuyPage() {
  const { linkId } = useParams<{ linkId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [link, setLink] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('details');
  const [activeImage, setActiveImage] = useState(0);
  const [sellerMethods, setSellerMethods] = useState<SellerPaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<SellerPaymentMethod | null>(null);
  const [transactionCode, setTransactionCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pesapalSuccess, setPesapalSuccess] = useState(false);

  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  // Handle return from Pesapal
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const reference = searchParams.get('reference');
    if (paymentStatus === 'success' && reference) {
      setPesapalSuccess(true);
      setShowCheckout(true);
      setCheckoutStep('success');
      setTransactionCode(reference);
    }
  }, [searchParams]);

  useEffect(() => {
    if (linkId) loadPaymentLink();
  }, [linkId]);

  const loadPaymentLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/links-api/${linkId}`, {
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
      });
      const result = await response.json();
      if (result.success && result.data) {
        setLink(result.data);
        // Load seller payment methods
        if (result.data.seller?.id) {
          loadSellerMethods(result.data.seller.id);
        }
      } else {
        setError(result.error || 'Payment link not found');
      }
    } catch (err) {
      console.error('Failed to load payment link:', err);
      setError('Failed to load payment link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSellerMethods = async (_sellerId: string) => {
    // Hardcoded payment methods: Pesapal + M-Pesa Paybill
    const hardcodedMethods: SellerPaymentMethod[] = [
      {
        id: 'pesapal-checkout',
        provider: 'Pesapal',
        type: 'card',
        account_name: 'Halearnedu Web',
        account_number: '',
        is_active: true,
        is_default: true,
        payment_type: 'PESAPAL',
        details: {},
      },
      {
        id: 'mpesa-paybill',
        provider: 'M-Pesa Paybill',
        type: 'mobile_money',
        account_name: 'Halearnedu Web',
        account_number: '522522',
        is_active: true,
        is_default: false,
        payment_type: 'PAYBILL',
        details: { paybill_number: '522522', account_number: '1348763280' },
      },
    ];
    setSellerMethods(hardcodedMethods);
  };

  const validateBuyerInfo = () => {
    if (!buyerInfo.name.trim()) {
      toast({ title: 'Required', description: 'Please enter your name', variant: 'destructive' });
      return false;
    }
    if (!buyerInfo.phone.trim()) {
      toast({ title: 'Required', description: 'Please enter your phone number', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleContinueToMethod = () => {
    if (!validateBuyerInfo()) return;
    if (sellerMethods.length > 0) {
      setCheckoutStep('select-method');
    } else {
      toast({ title: 'No Payment Methods', description: 'Seller has not configured payment methods yet', variant: 'destructive' });
    }
  };

  const handleSelectMethod = async (method: { id: string; type: string }) => {
    const found = sellerMethods.find(m => m.id === method.id);
    if (!found) return;

    setSelectedMethod(found);

    // If Pesapal selected, create order then redirect to Pesapal checkout
    if (found.payment_type === 'PESAPAL') {
      setSubmitting(true);
      setCheckoutStep('submitting');
      try {
        // Step 1: Create order
        const orderResponse = await fetch(`${SUPABASE_URL}/functions/v1/links-api/${linkId}/purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
          body: JSON.stringify({
            buyerName: buyerInfo.name,
            buyerPhone: buyerInfo.phone || undefined,
            buyerEmail: buyerInfo.email || undefined,
            deliveryAddress: buyerInfo.address || undefined,
            paymentMethod: 'PESAPAL',
          }),
        });
        const orderResult = await orderResponse.json();
        if (!orderResult.success || !orderResult.data?.transactionId) {
          throw new Error(orderResult.error || 'Failed to create order');
        }
        const orderId = orderResult.data.transactionId;
        setTransactionId(orderId);

        // Step 2: Initialize Pesapal checkout
        const pesapalResponse = await fetch(`${SUPABASE_URL}/functions/v1/pesapal-api/initialize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
          body: JSON.stringify({
            transactionId: orderId,
            amount: link?.price,
            currency: link?.currency || 'KES',
            description: link?.productName,
            buyerName: buyerInfo.name,
            buyerPhone: buyerInfo.phone,
            buyerEmail: buyerInfo.email || `${buyerInfo.phone.replace(/[^0-9]/g, '')}@payloom.app`,
            callbackUrl: `${window.location.origin}/buy/${linkId}?payment=success&reference=${orderId}`,
            metadata: {
              linkId,
              buyerName: buyerInfo.name,
              buyerPhone: buyerInfo.phone,
            },
          }),
        });
        const pesapalResult = await pesapalResponse.json();
        if (!pesapalResult.success || !pesapalResult.data?.redirect_url) {
          throw new Error(pesapalResult.error || 'Failed to initialize Pesapal payment');
        }

        // Store IDs for callback
        sessionStorage.setItem('pendingPaymentLinkId', linkId || '');
        sessionStorage.setItem('pendingPaymentTxnId', orderId);

        // Redirect to Pesapal hosted checkout page
        window.location.href = pesapalResult.data.redirect_url;
      } catch (err: any) {
        console.error('Pesapal checkout error:', err);
        toast({
          title: 'Payment Error',
          description: err.message || 'Failed to initialize payment. Please try again.',
          variant: 'destructive',
        });
        setCheckoutStep('select-method');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // For manual methods (M-Pesa etc.), go to submit-payment step
    setCheckoutStep('submit-payment');
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmitPayment = async () => {
    // Validate transaction code
    const validation = validateTransactionCode(transactionCode, selectedMethod?.payment_type);
    if (!validation.valid) {
      setCodeError(validation.error || 'Invalid code');
      return;
    }
    setCodeError(null);
    setSubmitting(true);
    setCheckoutStep('submitting');

    try {
      // Step 1: Create order
      const orderResponse = await fetch(`${SUPABASE_URL}/functions/v1/links-api/${linkId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({
          buyerName: buyerInfo.name,
          buyerPhone: buyerInfo.phone || undefined,
          buyerEmail: buyerInfo.email || undefined,
          deliveryAddress: buyerInfo.address || undefined,
          paymentMethod: selectedMethod?.payment_type || 'MPESA',
        }),
      });

      const orderResult = await orderResponse.json();
      if (!orderResult.success || !orderResult.data?.transactionId) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      const orderId = orderResult.data.transactionId;
      setTransactionId(orderId);

      // Step 2: Submit payment for validation
      const validateResponse = await fetch(`${SUPABASE_URL}/functions/v1/validate-payment/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({
          transactionId: orderId,
          transactionCode: transactionCode.trim().toUpperCase(),
          payerPhone: buyerInfo.phone,
          payerName: buyerInfo.name,
          paymentMethod: selectedMethod?.payment_type || 'MPESA',
          amountPaid: link?.price,
        }),
      });

      const validateResult = await validateResponse.json();
      if (!validateResult.success) {
        throw new Error(validateResult.error || 'Failed to submit payment');
      }

      setCheckoutStep('success');
    } catch (err: any) {
      toast({
        title: 'Submission Error',
        description: err.message || 'Failed to submit payment. Please try again.',
        variant: 'destructive',
      });
      setCheckoutStep('submit-payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoaderIcon size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <XIcon size={32} className="text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Link Not Available</h1>
          <p className="text-muted-foreground mb-6">{error || 'This payment link is invalid or has expired.'}</p>
          <Link to="/" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const discount = link.originalPrice ? Math.round(((link.originalPrice - link.price) / link.originalPrice) * 100) : 0;

  const getMethodInstructions = (method: SellerPaymentMethod) => {
    const details = method.details || {};
    switch (method.payment_type) {
      case 'PAYBILL':
        return (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <p className="text-sm font-bold text-foreground mb-3">📱 M-Pesa Paybill Instructions:</p>
            <ol className="space-y-2 text-sm text-foreground">
              <li className="flex gap-2"><span className="font-bold">1.</span><span>Go to M-Pesa → <strong>Lipa Na M-Pesa</strong> → <strong>Pay Bill</strong></span></li>
              <li className="flex gap-2 items-center">
                <span className="font-bold">2.</span>
                <span>Business Number: <strong className="font-mono text-primary">{details.paybill_number}</strong></span>
                <button onClick={() => copyToClipboard(details.paybill_number || '', 'paybill')} className="ml-2 p-1 hover:bg-muted rounded">
                  {copied === 'paybill' ? <CheckCircleIcon size={14} className="text-primary" /> : <Copy size={14} className="text-muted-foreground" />}
                </button>
              </li>
              <li className="flex gap-2 items-center">
                <span className="font-bold">3.</span>
                <span>Account Number: <strong className="font-mono text-primary">{details.account_number}</strong></span>
                <button onClick={() => copyToClipboard(details.account_number || '', 'account')} className="ml-2 p-1 hover:bg-muted rounded">
                  {copied === 'account' ? <CheckCircleIcon size={14} className="text-primary" /> : <Copy size={14} className="text-muted-foreground" />}
                </button>
              </li>
              <li className="flex gap-2"><span className="font-bold">4.</span><span>Amount: <strong className="text-primary">{formatPrice(link.price, link.currency)}</strong></span></li>
              <li className="flex gap-2"><span className="font-bold">5.</span><span>Enter your M-Pesa PIN and confirm</span></li>
            </ol>
          </div>
        );
      case 'TILL':
        return (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <p className="text-sm font-bold text-foreground mb-3">📱 M-Pesa Till Instructions:</p>
            <ol className="space-y-2 text-sm text-foreground">
              <li className="flex gap-2"><span className="font-bold">1.</span><span>Go to M-Pesa → <strong>Lipa Na M-Pesa</strong> → <strong>Buy Goods</strong></span></li>
              <li className="flex gap-2 items-center">
                <span className="font-bold">2.</span>
                <span>Till Number: <strong className="font-mono text-primary">{details.till_number}</strong></span>
                <button onClick={() => copyToClipboard(details.till_number || '', 'till')} className="ml-2 p-1 hover:bg-muted rounded">
                  {copied === 'till' ? <CheckCircleIcon size={14} className="text-primary" /> : <Copy size={14} className="text-muted-foreground" />}
                </button>
              </li>
              <li className="flex gap-2"><span className="font-bold">3.</span><span>Amount: <strong className="text-primary">{formatPrice(link.price, link.currency)}</strong></span></li>
              <li className="flex gap-2"><span className="font-bold">4.</span><span>Enter your M-Pesa PIN and confirm</span></li>
            </ol>
          </div>
        );
      case 'MPESA':
      case 'AIRTEL_MONEY':
      case 'MTN_MONEY':
        return (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <p className="text-sm font-bold text-foreground mb-3">📱 Send Money Instructions:</p>
            <ol className="space-y-2 text-sm text-foreground">
              <li className="flex gap-2"><span className="font-bold">1.</span><span>Open {method.provider}</span></li>
              <li className="flex gap-2 items-center">
                <span className="font-bold">2.</span>
                <span>Send to: <strong className="font-mono text-primary">{details.phone_number}</strong></span>
                <button onClick={() => copyToClipboard(details.phone_number || '', 'phone')} className="ml-2 p-1 hover:bg-muted rounded">
                  {copied === 'phone' ? <CheckCircleIcon size={14} className="text-primary" /> : <Copy size={14} className="text-muted-foreground" />}
                </button>
              </li>
              <li className="flex gap-2"><span className="font-bold">3.</span><span>Name: <strong>{details.account_name || method.account_name}</strong></span></li>
              <li className="flex gap-2"><span className="font-bold">4.</span><span>Amount: <strong className="text-primary">{formatPrice(link.price, link.currency)}</strong></span></li>
            </ol>
          </div>
        );
      case 'BANK_ACCOUNT':
        return (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <p className="text-sm font-bold text-foreground mb-3">🏦 Bank Transfer Instructions:</p>
            <div className="space-y-1 text-sm text-foreground">
              <p>Bank: <strong>{details.bank_name}</strong></p>
              <p>Account: <strong className="font-mono">{details.account_number || method.account_number}</strong></p>
              <p>Name: <strong>{details.account_name || method.account_name}</strong></p>
              {details.swift_code && <p>Swift: <strong className="font-mono">{details.swift_code}</strong></p>}
              <p>Amount: <strong className="text-primary">{formatPrice(link.price, link.currency)}</strong></p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">Halearnedu<em className="text-primary not-italic">Web</em></span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-primary">
            <ShieldIcon size={16} />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-card rounded-lg border border-border overflow-hidden">
              {link.images && link.images.length > 0 ? (
                <img src={link.images[activeImage]} alt={link.productName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">No image</div>
              )}
            </div>
            {link.images && link.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {link.images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${activeImage === idx ? 'border-primary' : 'border-border'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                {link.seller.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-foreground">{link.seller.name}</p>
                {link.seller.sellerProfile?.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    <CheckCircleIcon size={12} /> Verified Seller
                  </span>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{link.productName}</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">{formatPrice(link.price, link.currency)}</span>
                {link.originalPrice && link.originalPrice > link.price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">{formatPrice(link.originalPrice, link.currency)}</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-sm font-medium rounded">{discount}% OFF</span>
                  </>
                )}
              </div>
            </div>

            {link.productDescription && (
              <div>
                <h3 className="font-medium text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{link.productDescription}</p>
              </div>
            )}

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircleIcon size={16} className="text-primary" />
                <span>Halearnedu Web Protection - Secure payment processing</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircleIcon size={16} className="text-primary" />
                <span>Money-back guarantee if item not received</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircleIcon size={16} className="text-primary" />
                <span>Manual verification for fraud protection</span>
              </div>
            </div>

            <button onClick={() => setShowCheckout(true)}
              className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 transition flex items-center justify-center gap-2">
              Buy Now <ChevronRightIcon size={20} />
            </button>
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      {showCheckout && checkoutStep !== 'select-method' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !submitting && setShowCheckout(false)} />
          <div className="relative bg-card rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {checkoutStep === 'details' && 'Your Details'}
                {(checkoutStep as string) === 'select-method' && 'Select Payment Method'}
                {checkoutStep === 'submit-payment' && 'Complete Payment'}
                {checkoutStep === 'submitting' && 'Submitting...'}
                {checkoutStep === 'success' && 'Payment Submitted!'}
              </h2>
              {!submitting && (
                <button onClick={() => { setShowCheckout(false); setCheckoutStep('details'); }} className="p-2 hover:bg-muted rounded-full">
                  <XIcon size={20} />
                </button>
              )}
            </div>

            <div className="p-6 space-y-5">
              {/* Order Summary */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex gap-4">
                  {link.images?.[0] && <img src={link.images[0]} alt="" className="w-16 h-16 object-cover rounded-lg" />}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{link.productName}</p>
                    <p className="text-lg font-bold text-primary">{formatPrice(link.price, link.currency)}</p>
                  </div>
                </div>
              </div>

              {/* Step: Buyer Details */}
              {checkoutStep === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                    <input type="text" value={buyerInfo.name} onChange={e => setBuyerInfo({...buyerInfo, name: e.target.value})}
                      placeholder="John Doe" className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
                    <input type="tel" value={buyerInfo.phone} onChange={e => setBuyerInfo({...buyerInfo, phone: e.target.value})}
                      placeholder="+254712345678" className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email (Optional)</label>
                    <input type="email" value={buyerInfo.email} onChange={e => setBuyerInfo({...buyerInfo, email: e.target.value})}
                      placeholder="you@example.com" className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Delivery Address (Optional)</label>
                    <textarea value={buyerInfo.address} onChange={e => setBuyerInfo({...buyerInfo, address: e.target.value})}
                      placeholder="Enter delivery address" rows={2} className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                  </div>
                  <button onClick={handleContinueToMethod}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition">
                    Continue to Payment →
                  </button>
                </div>
              )}

              {/* Step: Select Payment Method - rendered as overlay modal */}

              {/* Step: Submit Payment */}
              {checkoutStep === 'submit-payment' && selectedMethod && (
                <div className="space-y-4">
                  {getMethodInstructions(selectedMethod)}

                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-sm text-foreground">
                    <strong>⚠️ Important:</strong> Pay the exact amount of <strong>{formatPrice(link.price, link.currency)}</strong>. 
                    After paying, enter your transaction code below.
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Transaction Code *</label>
                    <input type="text" value={transactionCode}
                      onChange={e => { setTransactionCode(e.target.value.toUpperCase()); setCodeError(null); }}
                      placeholder="e.g. SJK7Y6H4TQ" maxLength={13}
                      className="w-full px-3 py-3 border border-input rounded-lg bg-background text-foreground font-mono text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase" />
                    {codeError && <p className="text-xs text-destructive mt-1">{codeError}</p>}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setCheckoutStep('select-method')} className="flex-1 px-4 py-3 border border-input rounded-lg text-foreground hover:bg-muted transition text-sm font-medium">← Back</button>
                    <button onClick={handleSubmitPayment} disabled={!transactionCode.trim()}
                      className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50">
                      Submit Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Submitting */}
              {checkoutStep === 'submitting' && (
                <div className="py-8 text-center">
                  <LoaderIcon size={40} className="animate-spin text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-foreground mb-2">Verifying Payment...</h3>
                  <p className="text-sm text-muted-foreground">Checking transaction code <strong className="font-mono">{transactionCode}</strong></p>
                </div>
              )}

              {/* Step: Success */}
              {checkoutStep === 'success' && (
                <div className="py-4 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon size={32} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                   {pesapalSuccess ? 'Payment Successful!' : 'Payment Submitted!'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {pesapalSuccess
                      ? 'Your payment has been confirmed via Pesapal. Your order is being processed.'
                      : 'Your payment is being reviewed. You\'ll be notified once it\'s approved.'}
                  </p>
                  <div className="bg-muted rounded-lg p-4 text-left text-sm space-y-2 mb-4">
                    {transactionId && <p>Order ID: <span className="font-mono font-bold">{transactionId}</span></p>}
                    {transactionCode && <p>Reference: <span className="font-mono font-bold">{transactionCode}</span></p>}
                    <p>Status: <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pesapalSuccess ? 'bg-green-100 text-green-700' : 'bg-accent/20 text-accent'}`}>
                      {pesapalSuccess ? 'Confirmed' : 'Under Review'}
                    </span></p>
                  </div>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-left mb-4">
                    <ShieldIcon size={16} className="inline text-primary mr-1" />
                    Your payment is protected by Halearnedu Web. If there's any issue, we'll process a full refund.
                  </div>
                  <button onClick={() => { setShowCheckout(false); setCheckoutStep('details'); }}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition">
                    {pesapalSuccess ? 'Done' : 'View Payment Status'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Selection Modal */}
      <PaymentMethodModal
        isOpen={checkoutStep === 'select-method'}
        onClose={() => { setCheckoutStep('details'); }}
        onBack={() => setCheckoutStep('details')}
        onContinue={(method) => handleSelectMethod(method)}
        product={{
          name: link.productName,
          price: link.price,
          currency: link.currency,
          image: link.images?.[0],
        }}
        methods={sellerMethods.map(m => ({
          id: m.id,
          type: m.payment_type === 'PESAPAL' ? 'pesapal' as const : 'mpesa' as const,
          name: m.payment_type === 'PESAPAL' ? 'Pay via Pesapal' : `Pay via ${m.provider}`,
          description: m.payment_type === 'PESAPAL'
            ? 'Cards, M-Pesa STK Push, Bank Transfer'
            : m.details?.paybill_number
              ? `Paybill ${m.details.paybill_number} • Account ${m.details.account_number}`
              : m.details?.till_number
                ? `Till: ${m.details.till_number}`
                : m.provider,
          icon: m.payment_type === 'PESAPAL' ? (
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: '#00a86b' }}>💳</div>
          ) : (
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center font-bold text-xl shrink-0" style={{ background: '#d4f4dd', color: '#00a86b' }}>M-P</div>
          ),
        }))}
      />
    </div>
  );
}
