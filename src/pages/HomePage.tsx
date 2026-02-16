import { Link } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';
import { useEffect, useRef } from 'react';
import heroImg from '@/assets/images/hero-ecommerce.jpg';
import sellerImg from '@/assets/images/seller-store.jpg';
import secureImg from '@/assets/images/secure-payment.jpg';
import productsImg from '@/assets/images/products-showcase.jpg';

export function HomePage() {
  const { t } = useTranslations();
  const fadeRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        });
      },
      { threshold: 0.08 }
    );
    fadeRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const addFadeRef = (el: HTMLElement | null) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el);
  };

  return (
    <div className="payloom-landing">
      {/* NAV */}
      <nav className="pl-nav">
        <Link to="/" className="pl-logo">
          Halearnedu<em>Web</em>
        </Link>
        <div className="pl-nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#products">Products</a>
          <Link to="/legal">Legal</Link>
        </div>
        <div className="pl-nav-actions">
          <Link to="/login" className="pl-btn-ghost">
            {t('common.logIn')}
          </Link>
          <Link to="/signup" className="pl-btn-cta">
            {t('common.getStarted')}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pl-hero" style={{ position: 'relative' }}>
        <div className="pl-hero-inner">
          <div className="pl-hero-content fade-up" ref={addFadeRef}>
            <div className="pl-hero-badge">
              <span className="pl-dot" />
              Powering Commerce Across Africa
            </div>
            <h1>
              Your Products. Our Sellers. <span className="pl-grad">One Powerful Marketplace.</span>
            </h1>
            <p>
              Halearnedu Web provides the products — our verified sellers create stores and sell them to buyers everywhere. All payments flow through one secure Pesapal merchant account.
            </p>
            <div className="pl-hero-btns">
              <Link to="/signup" className="pl-btn-hero">
                Become a Seller
              </Link>
              <a href="#how" className="pl-btn-outline">
                See how it works
              </a>
            </div>
            <div className="pl-hero-stats">
              <div className="pl-hero-stat">
                <div className="pl-num">5K+</div>
                <div className="pl-lbl">Active sellers</div>
              </div>
              <div className="pl-hero-stat">
                <div className="pl-num">₦120M+</div>
                <div className="pl-lbl">Processed monthly</div>
              </div>
              <div className="pl-hero-stat">
                <div className="pl-num">50K+</div>
                <div className="pl-lbl">Products listed</div>
              </div>
            </div>
          </div>

          <div className="pl-hero-visual fade-up delay-2" ref={addFadeRef}>
            <div className="pl-float-card pl-fc1">
              <div className="pl-fc-icon">🛒</div>
              <div className="pl-fc-label">New order</div>
              <div className="pl-fc-value pl-green">+₦18,500</div>
            </div>
            <div className="pl-float-card pl-fc2">
              <div className="pl-fc-label">Payment confirmed</div>
              <div className="pl-fc-value">Pesapal ✓</div>
            </div>
            <div className="pl-float-card pl-fc3">
              <div className="pl-fc-label">Store visits today</div>
              <div className="pl-fc-value">1,247</div>
            </div>

            <div className="pl-phone-outer">
              <div className="pl-phone-inner">
                <div className="pl-phone-bar">
                  <div className="pl-phone-notch" />
                </div>
                <div className="pl-phone-content">
                  <div className="pl-p-header">
                    <div className="pl-p-avatar">HW</div>
                    <div>
                      <div className="pl-p-title">Halearnedu Store</div>
                      <div className="pl-p-sub">halearnedu.com/store</div>
                    </div>
                  </div>
                  <div className="pl-p-product">
                    <div className="pl-p-img">📱</div>
                    <div className="pl-p-pname">Smart Watch Pro X</div>
                    <div className="pl-p-price">₦45,000</div>
                    <button className="pl-p-btn">Pay with Pesapal →</button>
                  </div>
                  <div className="pl-p-success">
                    <div className="pl-p-success-icon">✓</div>
                    <div className="pl-p-success-text">
                      Payment confirmed!
                      <br />
                      Seller earns commission
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HERO IMAGE BANNER */}
      <section className="fade-up" ref={addFadeRef} style={{ padding: '0 6vw', maxWidth: 1200, margin: '-40px auto 0' }}>
        <img
          src={heroImg}
          alt="Halearnedu Web marketplace showcasing diverse products"
          style={{ width: '100%', borderRadius: 20, boxShadow: '0 24px 80px rgba(10,12,24,0.18)', display: 'block' }}
        />
      </section>

      {/* PRODUCTS SHOWCASE */}
      <div className="pl-section" id="products">
        <div className="fade-up" ref={addFadeRef}>
          <div className="pl-section-label">Our Products</div>
          <div className="pl-section-title">Curated products ready for sellers to list</div>
          <div className="pl-section-sub">
            Halearnedu Web sources and supplies quality products. Sellers simply create a store, list them, and earn commissions on every sale.
          </div>
        </div>
        <div className="pl-products-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem', alignItems: 'center' }}>
          <div className="fade-up" ref={addFadeRef}>
            <img src={productsImg} alt="Product showcase" style={{ width: '100%', borderRadius: 16, boxShadow: '0 12px 40px rgba(10,12,24,0.1)' }} />
          </div>
          <div className="fade-up delay-1" ref={addFadeRef}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {[
                { cat: '📱 Electronics', desc: 'Smartphones, smartwatches, earbuds, tablets & accessories' },
                { cat: '👗 Fashion & Apparel', desc: 'Trendy clothing, shoes, bags & jewelry for every style' },
                { cat: '💄 Beauty & Wellness', desc: 'Skincare, cosmetics, fragrances & health essentials' },
                { cat: '🏠 Home & Living', desc: 'Décor, kitchen gadgets, furniture & lifestyle products' },
                { cat: '🎮 Gadgets & Gaming', desc: 'Consoles, accessories, VR gear & tech innovations' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: '#fff', border: '1px solid #e8eaf5', borderRadius: 14,
                  padding: '1.2rem 1.4rem', boxShadow: '0 2px 12px rgba(10,12,24,0.04)',
                  transition: 'transform .2s, box-shadow .2s', cursor: 'default',
                }}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0a0c18', marginBottom: 4 }}>{item.cat}</div>
                  <div style={{ fontSize: '0.88rem', color: '#4a4f72', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES BENTO */}
      <div className="pl-section" id="features">
        <div className="fade-up" ref={addFadeRef}>
          <div className="pl-section-label">Features</div>
          <div className="pl-section-title">Everything built for sellers & buyers</div>
          <div className="pl-section-sub">
            Powerful tools for sellers to manage stores, and a seamless buying experience for customers — all powered by Pesapal.
          </div>
        </div>

        <div className="pl-bento">
          {/* BC1: Seller Stores */}
          <div className="pl-bento-card pl-bc1 fade-up" ref={addFadeRef}>
            <div className="pl-bento-icon" style={{ background: '#ebf0ff' }}>🏪</div>
            <div className="pl-bento-tag" style={{ background: '#ebf0ff', color: '#4361ee' }}>
              Seller Stores
            </div>
            <h3>Create your own branded store</h3>
            <p>
              Sellers register, create a store, and list Halearnedu Web products. Each store gets a unique link to share with customers.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <img src={sellerImg} alt="Seller managing store" style={{ width: '100%', borderRadius: 12, boxShadow: '0 4px 20px rgba(10,12,24,0.08)' }} />
            </div>
          </div>

          {/* BC2: Paystack Payments */}
          <div className="pl-bento-card pl-bc2 fade-up delay-1" ref={addFadeRef}>
            <div className="pl-bento-icon" style={{ background: '#f0fff8' }}>💳</div>
            <div className="pl-bento-tag" style={{ background: '#f0fff8', color: '#049a74' }}>
              Secure Payments
            </div>
            <h3>One merchant. Total security.</h3>
            <p>
              All payments flow through Halearnedu Web's Pesapal merchant account. Buyers pay securely, sellers earn commissions.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <img src={secureImg} alt="Secure payment processing" style={{ width: '100%', borderRadius: 12, boxShadow: '0 4px 20px rgba(10,12,24,0.08)' }} />
            </div>
          </div>

          {/* BC3: Refund & Buyer Protection */}
          <div className="pl-bento-card pl-bc3 fade-up delay-2" ref={addFadeRef}>
            <div className="pl-bento-icon" style={{ background: 'rgba(6,214,160,0.1)' }}>🛡️</div>
            <div className="pl-bento-tag" style={{ background: 'rgba(6,214,160,0.1)', color: '#049a74' }}>
              Buyer Protection
            </div>
            <h3>Shop with total confidence</h3>
            <p>
              All payments are processed securely through Pesapal. If something goes wrong, we issue a full refund — no questions asked.
            </p>
            <div className="pl-payment-flow">
              {[
                { icon: '💳', bg: '#ebf0ff', text: 'Pay via Pesapal or M-Pesa', sub: 'Card, Paybill, or bank transfer' },
                { icon: '🔍', bg: '#fff3eb', text: 'Every order is tracked', sub: 'Full visibility from purchase to delivery' },
                { icon: '💰', bg: 'rgba(6,214,160,0.1)', text: 'Easy refunds if issues arise', sub: 'Refund processed within 48 hours' },
              ].map((step, i) => (
                <div key={i} className="pl-flow-step">
                  <div className="pl-flow-icon" style={{ background: step.bg }}>{step.icon}</div>
                  <div>
                    <div className="pl-flow-text">{step.text}</div>
                    <div className="pl-flow-sub">{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BC4: Commissions & Withdrawals */}
          <div className="pl-bento-card pl-bc4 fade-up delay-1" ref={addFadeRef}>
            <div className="pl-bento-icon" style={{ background: '#fff3eb' }}>💸</div>
            <div className="pl-bento-tag" style={{ background: '#fff3eb', color: '#ff6b35' }}>
              Seller Earnings
            </div>
            <h3>Earn commissions on every sale</h3>
            <p>
              Sellers earn a commission for every product sold through their store. Withdraw earnings anytime to your bank account or mobile money.
            </p>
            <div className="pl-withdrawal-demo">
              <div className="pl-wd-card">
                <div className="pl-wd-icon">🏦</div>
                <div className="pl-wd-name">Bank Transfer</div>
                <div className="pl-wd-speed pl-wd-instant">24hrs</div>
              </div>
              <div className="pl-wd-card">
                <div className="pl-wd-icon">📱</div>
                <div className="pl-wd-name">Mobile Money</div>
                <div className="pl-wd-speed pl-wd-instant">Instant</div>
              </div>
              <div className="pl-balance-bar">
                <div>
                  <div className="pl-bal-label">Seller earnings</div>
                  <div className="pl-bal-amount">₦124,750</div>
                </div>
                <button className="pl-bal-btn">Withdraw</button>
              </div>
            </div>
          </div>

          {/* BC5: Product Catalog */}
          <div className="pl-bento-card pl-bc5 fade-up" ref={addFadeRef}>
            <div className="pl-bento-icon" style={{ background: '#f5f0ff' }}>📦</div>
            <div className="pl-bento-tag" style={{ background: '#f5f0ff', color: '#7b2d8b' }}>
              Product Catalog
            </div>
            <h3>Thousands of products</h3>
            <p>Browse our catalog and list products in your store with one click.</p>
            <div className="pl-currency-list">
              {[
                { emoji: '📱', code: '2,400+', name: 'Electronics' },
                { emoji: '👗', code: '3,100+', name: 'Fashion items' },
                { emoji: '💄', code: '1,800+', name: 'Beauty products' },
                { emoji: '🏠', code: '950+', name: 'Home & living' },
              ].map((c, i) => (
                <div key={i} className="pl-curr-item">
                  <span className="pl-curr-flag">{c.emoji}</span>
                  <div>
                    <div className="pl-curr-code">{c.code}</div>
                    <div className="pl-curr-name">{c.name}</div>
                  </div>
                  <span className="pl-curr-rate">Available</span>
                </div>
              ))}
            </div>
          </div>

          {/* BC6: Dispute Resolution */}
          <div className="pl-bento-card pl-bc6 fade-up delay-1" ref={addFadeRef}>
            <div className="pl-bento-icon" style={{ background: '#e8f8ff' }}>⚖️</div>
            <div className="pl-bento-tag" style={{ background: '#e8f8ff', color: '#006fa8' }}>
              Buyer Protection
            </div>
            <h3>100% buyer protection</h3>
            <p>Disputes resolved within 48 hours. Evidence-based decisions protect both buyers and sellers.</p>
            <div className="pl-dispute-meter">
              <div className="pl-dm-row">
                <span className="pl-dm-label">Resolution rate</span>
                <span className="pl-dm-val">99.1%</span>
              </div>
              <div className="pl-dm-bar-bg">
                <div className="pl-dm-bar-fill" style={{ width: '99.1%' }} />
              </div>
              <div className="pl-dm-row">
                <span className="pl-dm-label">Avg resolution time</span>
                <span className="pl-dm-val">18 hrs</span>
              </div>
              <div className="pl-dm-bar-bg">
                <div className="pl-dm-bar-fill" style={{ width: '55%', background: 'linear-gradient(90deg,#4361ee,#7b2d8b)' }} />
              </div>
            </div>
          </div>

          {/* BC7: Analytics */}
          <div className="pl-bento-card pl-bc7 fade-up delay-2" ref={addFadeRef}>
            <div className="pl-bento-icon" style={{ background: '#fff5e6' }}>📊</div>
            <div className="pl-bento-tag" style={{ background: '#fff5e6', color: '#b45309' }}>
              Seller Dashboard
            </div>
            <h3>Track your performance</h3>
            <p>Real-time sales, store visits, earnings, and order analytics — all in one dashboard.</p>
            <div className="pl-analytics-mini">
              {[
                { color: '#4361ee', label: 'Sales today', val: '₦82,400' },
                { color: '#06d6a0', label: 'Store visits', val: '1,247' },
                { color: '#ff6b35', label: 'Conversion rate', val: '31.2%' },
              ].map((row, i) => (
                <div key={i} className="pl-an-row">
                  <div className="pl-an-dot" style={{ background: row.color }} />
                  <div className="pl-an-label">{row.label}</div>
                  <div className="pl-an-val">{row.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="pl-how-section" id="how">
        <div className="pl-how-inner">
          <div className="fade-up" ref={addFadeRef}>
            <div className="pl-section-label" style={{ color: '#06d6a0' }}>How it works</div>
            <div className="pl-section-title" style={{ color: '#fff', maxWidth: 600 }}>
              Start selling in three simple steps
            </div>
            <div className="pl-section-sub" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3.5rem' }}>
              No inventory needed. No upfront costs. Halearnedu Web provides the products — you provide the customers.
            </div>
          </div>
          <div className="pl-how-steps">
            {[
              {
                num: '1',
                title: 'Create your seller store',
                text: 'Sign up as a seller, name your store, and customize your brand. It takes less than 2 minutes to get started.',
              },
              {
                num: '2',
                title: 'List products from our catalog',
                text: 'Browse Halearnedu Web\'s product catalog and add items to your store. Set your prices and share your store link everywhere.',
              },
              {
                num: '3',
                title: 'Earn on every sale',
                text: 'When a buyer purchases from your store, payment goes through Pesapal. You earn your commission and can withdraw anytime.',
              },
            ].map((step, i) => (
              <div key={i} className={`pl-how-step fade-up${i > 0 ? ` delay-${i}` : ''}`} ref={addFadeRef}>
                <div className="pl-how-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
          <div className="pl-how-visual fade-up delay-1" ref={addFadeRef}>
            <div className="pl-hv-step">
              <div className="pl-hv-icon">🏪</div>
              <div className="pl-hv-label">Seller lists</div>
              <div className="pl-hv-value">Halearnedu products</div>
            </div>
            <div className="pl-how-vis-divider" />
            <div className="pl-hv-step">
              <div className="pl-hv-icon">💳</div>
              <div className="pl-hv-label">Buyer pays via</div>
              <div className="pl-hv-value">Pesapal</div>
            </div>
            <div className="pl-how-vis-divider" />
            <div className="pl-hv-step">
              <div className="pl-hv-icon">💰</div>
              <div className="pl-hv-label">Seller earns</div>
              <div className="pl-hv-value">Commission</div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="pl-proof-section">
        <div className="pl-proof-inner">
          <div className="fade-up" ref={addFadeRef} style={{ textAlign: 'center' }}>
            <div className="pl-section-label" style={{ textAlign: 'center' }}>Trusted by sellers</div>
            <div className="pl-section-title" style={{ margin: '0 auto 0.8rem', textAlign: 'center' }}>
              Sellers love Halearnedu Web
            </div>
            <div className="pl-section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
              Real stories from real people earning with Halearnedu Web.
            </div>
          </div>
          <div className="pl-proof-grid">
            {[
              {
                text: '"I never imagined I could run an online store without buying inventory. Halearnedu Web provides the products and I just sell. My earnings have been incredible."',
                initials: 'AO',
                bg: 'linear-gradient(135deg,#4361ee,#7b2d8b)',
                name: 'Adebayo Ogundimu',
                role: 'Seller, Lagos',
              },
              {
                text: '"The Pesapal integration is seamless. My customers pay with cards, bank transfers, even USSD — and I get my commissions within hours."',
                initials: 'NK',
                bg: 'linear-gradient(135deg,#06d6a0,#00b4d8)',
                name: 'Ngozi Kalu',
                role: 'Seller, Abuja',
              },
              {
                text: '"As a buyer, I love that my money is protected until I confirm delivery. It gives me confidence to shop from any Halearnedu seller."',
                initials: 'CM',
                bg: 'linear-gradient(135deg,#ff6b35,#ffd60a)',
                name: 'Chidi Mwangi',
                role: 'Buyer, Port Harcourt',
              },
            ].map((card, i) => (
              <div key={i} className={`pl-proof-card fade-up${i > 0 ? ` delay-${i}` : ''}`} ref={addFadeRef}>
                <div className="pl-proof-stars">★★★★★</div>
                <p>{card.text}</p>
                <div className="pl-proof-author">
                  <div className="pl-proof-av" style={{ background: card.bg }}>
                    {card.initials}
                  </div>
                  <div>
                    <div className="pl-proof-name">{card.name}</div>
                    <div className="pl-proof-role">{card.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pl-cta-section">
        <div className="pl-cta-inner fade-up" ref={addFadeRef}>
          <h2>Ready to start earning with Halearnedu Web?</h2>
          <p>Join thousands of sellers across Africa. Create your free store and start earning commissions today.</p>
          <div className="pl-cta-btns">
            <Link to="/signup" className="pl-btn-cta-white">
              Create free seller account
            </Link>
            <Link to="/login" className="pl-btn-cta-ghost">
              I'm a buyer
            </Link>
          </div>
          <div className="pl-cta-note">
            {t('home.alreadyHaveAccount')}{' '}
            <Link to="/login">{t('common.logIn')}</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pl-footer">
        <div className="pl-f-logo">
          Halearnedu<em>Web</em>
        </div>
        <div className="pl-f-links">
          <Link to="/legal">Legal</Link>
          <a href="/legal#terms">Terms</a>
          <a href="/legal#privacy">Privacy</a>
        </div>
        <div className="pl-f-copy">© 2026 Halearnedu Web</div>
      </footer>
    </div>
  );
}
