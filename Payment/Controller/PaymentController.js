const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const OrderModel = require("../../order/models/OrderModel");

/**
 * Gère la création de la commande en base et l'ouverture de la session Stripe
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { cartItems, totalAmount } = req.body;

    // 1. Vérification de l'utilisateur (injecté par verifyToken via le cookie)
    // On utilise req.client car c'est le nom standard dans tes middlewares
    if (!req.client || !req.client.id) {
      return res.status(401).json({ message: "Utilisateur non identifié." });
    }

    console.log(`Création commande pour le client ID: ${req.client.id}`);

    // 2. ENREGISTREMENT EN BASE DE DONNÉES
    // On passe l'ID du client, le total et les articles au modèle
    const orderId = await OrderModel.createOrder(
      req.client.id,
      totalAmount,
      cartItems,
    );

    // 3. PRÉPARATION DES ARTICLES POUR STRIPE (Conversion en centimes)
    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.nom,
          // Optionnel : tu peux ajouter des images ici si tu en as
        },
        // Stripe veut des centimes (ex: 10.50€ -> 1050)
        unit_amount: Math.round(parseFloat(item.prixFinal) * 100),
      },
      quantity: item.quantite,
    }));

    // 4. CRÉATION DE LA SESSION DE PAIEMENT STRIPE
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      // On stocke l'ID de la commande MySQL dans Stripe pour le suivi
      metadata: {
        order_id: orderId.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
      customer_email: req.client.email, // Pré-remplit l'email sur Stripe
    });

    // 5. RÉPONSE AU FRONTEND
    // On renvoie l'URL vers laquelle React va rediriger l'utilisateur
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("ERREUR PAIEMENT/COMMANDE:", error.message);
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la préparation de votre commande.",
      error: error.message,
    });
  }
};

module.exports = { createCheckoutSession };
