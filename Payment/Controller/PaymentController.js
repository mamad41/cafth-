const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const OrderModel = require("../../order/models/OrderModel");

const createCheckoutSession = async (req, res) => {
  try {
    const { cartItems, totalAmount, shippingAddress } = req.body; // shippingAddress est reçu du front, mais non utilisé ici pour l'instant

    // 1. Vérification de l'utilisateur (on vérifie req.client OU req.user selon ton middleware)
    const currentUser = req.client || req.user;

    if (!currentUser || !currentUser.id) {
      return res
        .status(401)
        .json({ message: "Session expirée, veuillez vous reconnecter." });
    }

    // 2. ENREGISTREMENT EN BASE DE DONNÉES
    // Appel de createOrder avec les 3 arguments attendus par OrderModel.js
    const orderId = await OrderModel.createOrder(
      currentUser.id,
      totalAmount,
      cartItems,
      // shippingAddress n'est pas passé ici car la table 'commande' ne le gère pas directement
    );

    // 3. PRÉPARATION DES ARTICLES POUR STRIPE
    const line_items = cartItems.map((item) => {
      // Sécurité : on s'assure d'avoir un prix valide (nom de variable identique au Front)
      const unitPrice = parseFloat(item.prix_final || item.prix_ttc || 0);

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: item.nom_produit || item.nom || "Article CafThé",
            metadata: {
              sku: item.reference_sku, // On lie le SKU ici aussi pour Stripe
            },
          },
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity: item.quantite,
      };
    });

    // 4. CRÉATION DE LA SESSION STRIPE
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      metadata: {
        order_id: orderId.toString(),
        client_id: currentUser.id.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
      customer_email: currentUser.email,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("ERREUR CRITIQUE PAIEMENT:", error.message);
    res.status(500).json({
      message: "Erreur lors de la préparation de la commande.",
      error: error.message,
    });
  }
};

module.exports = { createCheckoutSession };
