const process = require('process');
const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
console.log(STRIPE_PUBLISHABLE_KEY);
console.log(STRIPE_SECRET_KEY);

const stripe = require('stripe')(STRIPE_SECRET_KEY);
const inventory = require('./data/products.json');

exports.handler = async (event) => {
  const { id, quantity } = JSON.parse(event.body);
  console.log(id);
  console.log(quantity);

  const product = inventory.find(p => p.id === id);
  console.log(product);

  const validatedQuantity = quantity > 0 && quantity < 11 ? quantity : 1;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    billing_address_collection: 'auto',
    shipping_address_collection: {
      allowed_countries: ['US', 'CA'],
    },
    success_url: `${process.env.URL}/success.html`,
    cancel_url: process.env.URL,
    line_items: [
      {
        name: product.name,
        description: product.description,
        images: [product.image],
        amount: product.amount,
        currency: product.currency,
        quantity: validatedQuantity,
      },
    ],
  });

  console.log(session.line_items);

  return {
    statusCode: 200,
    body: JSON.stringify({
      sessionId: session.id,
      publishableKey: STRIPE_PUBLISHABLE_KEY
    }),
  };
};
