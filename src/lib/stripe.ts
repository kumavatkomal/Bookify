import Stripe from 'stripe'

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY')
  }

  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  })
}

export function getPaymentCurrency() {
  return (
    process.env.PAYMENT_CURRENCY ||
    process.env.NEXT_PUBLIC_PAYMENT_CURRENCY ||
    'inr'
  ).toLowerCase()
}
