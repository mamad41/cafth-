// Initialisation Stripe — à mettre en haut du fichier
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body;

    // Validation défensive — ne casse pas si items est ok
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Panier vide ou invalide' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/commande-confirmee`,
      cancel_url:  `${process.env.FRONTEND_URL}/checkout`,
    });

    res.json({ url: session.url });

  } catch (err) {
    // Log lisible dans pm2 logs cafthe-api
    console.error('[Stripe]', err.type || '', err.message);

    res.status(500).json({
      message: 'Erreur lors de la création de la session de paiement'
    });
  }
};

module.exports = { createCheckoutSession };
