'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { PLANS } from '@/lib/razorpay';
import Sidebar from './Sidebar';

const FAQS = [
  {
    q: 'Can I switch or upgrade my plan later?',
    a: 'Yes! You can upgrade from Pro to Enterprise or switch billing cycles anytime. Your account will automatically adjust and prorate your plan without losing any data or generated blueprints.',
  },
  {
    q: 'How does the Razorpay checkout security work?',
    a: 'All transactions are processed through Razorpay using bank-grade 256-bit SSL encryption. AutoDock never stores your credit card, UPI credentials, or bank details on our servers.',
  },
  {
    q: 'Can I get a GST Invoice for my business?',
    a: 'Absoluty! During Razorpay checkout, you can input your company GSTIN to automatically receive an input-tax-credit (ITC) compliant GST tax invoice sent directly to your registered email.',
  },
  {
    q: 'What happens when I run out of credits on the Pay-As-You-Go pack?',
    a: 'Credits never expire. Once you use all 15 credits, you can simply purchase another Credit Pack for ₹299 or upgrade to Pro Builder for unlimited monthly generations.',
  },
];


export default function PricingPage({ session }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [activePlan, setActivePlan] = useState('developer'); // default
  const [credits, setCredits] = useState(3);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [showSimModal, setShowSimModal] = useState(null); // { order, plan, planId }
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const savedPlan = localStorage.getItem('autodock_user_plan');
    const savedCredits = localStorage.getItem('autodock_user_credits');
    if (savedPlan) setActivePlan(savedPlan);
    if (savedCredits) setCredits(parseInt(savedCredits, 10));
  }, []);

  const handleCheckout = async (planId) => {
    if (planId === 'developer') {
      setActivePlan('developer');
      localStorage.setItem('autodock_user_plan', 'developer');
      return;
    }

    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(`Order creation failed: ${data.error}`);
        setLoadingPlan(null);
        return;
      }

      const order = data.order;
      const targetPlan = PLANS[planId];

      if (typeof window !== 'undefined' && window.Razorpay && !order.isTestMode) {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'AutoDock AI',
          description: `${targetPlan.name} (${billingCycle})`,
          image: '/AutoDock-icon.png',
          order_id: order.orderId,
          handler: async function (response) {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
              billingCycle,
            });
          },
          prefill: {
            name: session?.user?.name || 'Dev Guest',
            email: session?.user?.email || 'developer@AutoDock.local',
          },
          theme: {
            color: '#88c0d0',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoadingPlan(null);
      } else {
        // Show Developer Test Mode Simulation Modal
        setShowSimModal({ order, plan: targetPlan, planId });
        setLoadingPlan(null);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to connect to payment server.');
      setLoadingPlan(null);
    }
  };

  const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, billingCycle }) => {
    try {
      const res = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          planId,
          billingCycle,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (planId === 'credit_pack') {
          const newCredits = credits + 15;
          setCredits(newCredits);
          localStorage.setItem('autodock_user_credits', newCredits.toString());
        } else {
          setActivePlan(planId);
          localStorage.setItem('autodock_user_plan', planId);
        }

        setPaymentSuccess(data.paymentDetails);
        setShowSimModal(null);
      } else {
        alert(`Payment verification failed: ${data.error}`);
      }
    } catch (err) {
      console.error('Verification error:', err);
      alert('Error verifying payment signature.');
    }
  };

  const simulateTestPaymentSuccess = async () => {
    if (!showSimModal) return;
    const { order, planId } = showSimModal;

    await verifyPayment({
      razorpay_order_id: order.orderId,
      razorpay_payment_id: `pay_sim_${Date.now()}`,
      razorpay_signature: 'test_signature_valid',
      planId,
      billingCycle,
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Razorpay SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <Sidebar session={session} activePath="/pricing" />

      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '40px 20px 80px' }}>
        
        {/* Header Title & Trust Badge */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '24px',
            backgroundColor: 'rgba(136, 192, 208, 0.1)',
            border: '1px solid rgba(136, 192, 208, 0.25)',
            color: 'var(--color-primary)',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '20px',
            letterSpacing: '0.5px',
          }}>
            <span>🔒 BANK-GRADE RAZORPAY CHECKOUT</span>
            <span>•</span>
            <span style={{ color: 'var(--color-success)' }}>INSTANT ACTIVATION</span>
          </div>

          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '16px', background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
            Accelerate Containerization with AutoDock Pro
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.15rem', lineHeight: '1.6', margin: '0 auto' }}>
            Choose the plan that fits your engineering workflow. From solo developers to enterprise security teams.
          </p>

          {/* Active Plan Status & Credit Counter */}
          <div style={{ marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '14px', padding: '10px 24px', borderRadius: '30px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--card-shadow)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Active Plan:</span>
            <span style={{ fontWeight: '800', color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '14px' }}>
              {PLANS[activePlan]?.name || 'Developer Free'}
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>•</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>AI Credits: <strong style={{ color: 'var(--color-primary)' }}>{credits}</strong></span>
          </div>

          {/* Billing Cycle Switcher */}
          <div style={{ marginTop: '28px', display: 'inline-flex', padding: '4px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: billingCycle === 'monthly' ? 'var(--color-primary)' : 'transparent',
                color: billingCycle === 'monthly' ? '#0b0f19' : 'var(--color-text-muted)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: billingCycle === 'yearly' ? 'var(--color-primary)' : 'transparent',
                color: billingCycle === 'yearly' ? '#0b0f19' : 'var(--color-text-muted)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Annual Billing</span>
              <span style={{ fontSize: '11px', background: 'rgba(163, 190, 140, 0.25)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '56px' }}>
          
          {/* Card 1: Developer Free */}
          <div style={{
            background: 'var(--gradient-card)',
            border: activePlan === 'developer' ? '2px solid var(--color-success)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--card-shadow)',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>Developer Free</h3>
                <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: '12px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Hobbyist</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '20px', minHeight: '38px' }}>
                Essential Docker compilation for personal prototypes & side projects.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>₹0</span>
                <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px', fontSize: '14px' }}>/ month</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
                {PLANS.developer.features.map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-success)', fontWeight: 'bold', fontSize: '16px' }}>✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleCheckout('developer')}
              disabled={activePlan === 'developer'}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                fontWeight: '700',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-primary)',
                cursor: activePlan === 'developer' ? 'default' : 'pointer',
                opacity: activePlan === 'developer' ? 0.6 : 1,
              }}
            >
              {activePlan === 'developer' ? 'Current Free Plan' : 'Select Developer Plan'}
            </button>
          </div>

          {/* Card 2: Pro Builder (Featured / High Converting) */}
          <div style={{
            background: 'linear-gradient(180deg, #152238 0%, #182842 100%)',
            border: activePlan === 'pro' ? '2px solid var(--color-primary)' : '1px solid rgba(136, 192, 208, 0.5)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            boxShadow: '0 16px 48px rgba(136, 192, 208, 0.2)',
          }}>
            <div style={{
              position: 'absolute',
              top: '-13px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--gradient-hero)',
              color: '#0b0f19',
              fontSize: '11px',
              fontWeight: '800',
              padding: '4px 16px',
              borderRadius: '20px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              boxShadow: '0 4px 12px rgba(136, 192, 208, 0.4)',
            }}>
              RECOMMENDED FOR DEV TEAMS
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '8px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>Pro Builder</h3>
                <span style={{ fontSize: '12px', background: 'rgba(136, 192, 208, 0.2)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(136, 192, 208, 0.4)', fontWeight: '700' }}>Unlimited AI</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px', minHeight: '38px' }}>
                Full suite with unlimited AI refinement chat, multi-container compose, and layer optimizer.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '2.8rem', fontWeight: '800', color: '#fff' }}>
                  ₹{billingCycle === 'yearly' ? PLANS.pro.priceYearly.toLocaleString('en-IN') : PLANS.pro.priceMonthly.toLocaleString('en-IN')}
                </span>
                <span style={{ color: '#94a3b8', marginLeft: '8px', fontSize: '14px' }}>/ {billingCycle === 'yearly' ? 'year' : 'month'}</span>
                {billingCycle === 'yearly' && (
                  <div style={{ fontSize: '12px', color: 'var(--color-success)', marginTop: '4px', fontWeight: '700' }}>Equates to ~₹799/month (Save ₹2,398)</div>
                )}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
                {PLANS.pro.features.map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', fontSize: '14px', color: '#eceff4', fontWeight: '500' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '16px' }}>✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleCheckout('pro')}
              disabled={loadingPlan === 'pro'}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: 'var(--radius-md)',
                fontWeight: '800',
                border: 'none',
                background: 'var(--color-primary)',
                color: '#0b0f19',
                cursor: 'pointer',
                fontSize: '15px',
                boxShadow: '0 4px 24px var(--color-primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              {loadingPlan === 'pro' ? (
                <span>Connecting to Razorpay...</span>
              ) : activePlan === 'pro' ? (
                'Active Pro Subscription ✓'
              ) : (
                'Upgrade to Pro Builder'
              )}
            </button>
          </div>

          {/* Card 3: Enterprise Studio */}
          <div style={{
            background: 'var(--gradient-card)',
            border: activePlan === 'enterprise' ? '2px solid #b48ead' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--card-shadow)',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>Enterprise Studio</h3>
                <span style={{ fontSize: '12px', background: 'rgba(180, 142, 173, 0.15)', color: '#b48ead', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(180, 142, 173, 0.3)', fontWeight: '600' }}>Security Shield</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '20px', minHeight: '38px' }}>
                Advanced secret masking, CI/CD pipeline export, and compliance reports.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  ₹{billingCycle === 'yearly' ? PLANS.enterprise.priceYearly.toLocaleString('en-IN') : PLANS.enterprise.priceMonthly.toLocaleString('en-IN')}
                </span>
                <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px', fontSize: '14px' }}>/ {billingCycle === 'yearly' ? 'year' : 'month'}</span>
                {billingCycle === 'yearly' && (
                  <div style={{ fontSize: '12px', color: '#b48ead', marginTop: '4px', fontWeight: '700' }}>Equates to ~₹2,399/month (Save ₹7,198)</div>
                )}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
                {PLANS.enterprise.features.map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: '#b48ead', fontWeight: 'bold', fontSize: '16px' }}>✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleCheckout('enterprise')}
              disabled={loadingPlan === 'enterprise'}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: 'var(--radius-md)',
                fontWeight: '800',
                border: 'none',
                background: '#b48ead',
                color: '#0b0f19',
                cursor: 'pointer',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loadingPlan === 'enterprise' ? (
                <span>Connecting to Razorpay...</span>
              ) : activePlan === 'enterprise' ? (
                'Active Enterprise Studio ✓'
              ) : (
                'Get Enterprise Studio'
              )}
            </button>
          </div>
        </div>

        {/* 4. Pay As You Go Credit Refill Box */}
        <div style={{
          background: 'var(--gradient-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 36px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          marginBottom: '64px',
          boxShadow: 'var(--card-shadow)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(235, 203, 139, 0.15)', border: '1px solid rgba(235, 203, 139, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              🪙
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>Blueprint Credit Pack</h3>
                <span style={{ fontSize: '11px', background: 'rgba(235, 203, 139, 0.2)', color: 'var(--color-warning)', padding: '3px 10px', borderRadius: '10px', fontWeight: '800' }}>NO SUBSCRIPTION</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
                Refill <strong>15 Instant AI Blueprint Generations</strong> for just <strong>₹299</strong>. Credits never expire.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleCheckout('credit_pack')}
            disabled={loadingPlan === 'credit_pack'}
            style={{
              padding: '14px 28px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-2)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {loadingPlan === 'credit_pack' ? 'Loading...' : 'Buy 15 Credits (₹299)'}
          </button>
        </div>

        {/* Frequently Asked Questions (FAQ Accordion) */}
        <section style={{ maxWidth: '840px', margin: '0 auto 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginTop: '6px' }}>Everything you need to know about payments & billing</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    background: 'var(--gradient-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{faq.q}</h4>
                    <span style={{ color: 'var(--color-primary)', fontSize: '18px', fontWeight: 'bold' }}>{isOpen ? '−' : '+'}</span>
                  </div>
                  {isOpen && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Enterprise SLA Callout */}
        <div style={{
          background: 'linear-gradient(135deg, #151d30 0%, #1e293b 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '10px' }}>
            Need Custom On-Premise Deployment or SLA?
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', maxWidth: '600px', margin: '0 auto 24px' }}>
            We work with enterprise security teams requiring private self-hosted AutoDock instances, custom Docker base images, and dedicated SSO integrations.
          </p>
          <a
            href="mailto:enterprise@autodock.local"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              borderRadius: '12px',
              background: 'var(--color-primary)',
              color: '#0b0f19',
              fontWeight: '700',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            ✉️ Contact Enterprise Sales
          </a>
        </div>

      </main>

      {/* Developer Mode Razorpay Simulator Modal */}
      {showSimModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(4px)',
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>💳</span>
                <div>
                  <h3 style={{ fontWeight: '700', color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>Razorpay Checkout</h3>
                  <span style={{ fontSize: '12px', color: 'var(--color-primary)' }}>AutoDock Developer Test Mode</span>
                </div>
              </div>
              <button onClick={() => setShowSimModal(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '20px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Target Plan:</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{showSimModal.plan.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Order ID:</span>
                <code style={{ color: 'var(--color-cyan)', fontSize: '12px' }}>{showSimModal.order.orderId}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Amount Payable:</span>
                <strong style={{ color: 'var(--color-success)', fontSize: '1.1rem' }}>₹{(showSimModal.order.amount / 100).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={simulateTestPaymentSuccess}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '700',
                  border: 'none',
                  background: 'var(--color-success)',
                  color: '#0b0f19',
                  cursor: 'pointer',
                  fontSize: '15px',
                }}
              >
                ✓ Simulate Successful Payment
              </button>
              <button
                onClick={() => setShowSimModal(null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '600',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Confirmation Modal */}
      {paymentSuccess && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(4px)',
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            maxWidth: '460px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(163, 190, 140, 0.2)', border: '2px solid var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: 'var(--color-success)', margin: '0 auto 20px' }}>
              ✓
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Payment Verified!</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Your Razorpay transaction was verified successfully with HMAC signature validation.
            </p>

            <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', textAlign: 'left', fontSize: '13px', fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>VERIFIED_SUCCESS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Plan Activated:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{paymentSuccess.planName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Payment ID:</span>
                <span style={{ color: 'var(--color-cyan)' }}>{paymentSuccess.paymentId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Order ID:</span>
                <span style={{ color: 'var(--color-cyan)' }}>{paymentSuccess.orderId}</span>
              </div>
            </div>

            <button
              onClick={() => setPaymentSuccess(null)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                fontWeight: '700',
                border: 'none',
                background: 'var(--color-primary)',
                color: '#0b0f19',
                cursor: 'pointer',
                fontSize: '15px',
              }}
            >
              Continue to Workspace 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
