const OrderModel = require("../../order/models/OrderModel");

const createCheckoutSession = async (req, res) => {
  try {
    // ✅ Initialisation locale : Stripe ne cherchera la clé qu'au moment du clic sur "Payer"
    // Cela évite que le serveur plante au démarrage si process.env n'est pas encore prêt.
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    const { cartItems, totalAmount, shippingAddress } = req.body;

    // 1. Vérification de l'utilisateur (req.client ou req.user selon ton auth middleware)
    const currentUser = req.client || req.user;

    if (!currentUser || !currentUser.id) {
      return res
        .status(401)
        .json({ message: "Session expirée, veuillez vous reconnecter." });
    }

    // 2. ENREGISTREMENT EN BASE DE DONNÉES
    // On crée la commande avant d'envoyer le client vers Stripe
    const orderId = await OrderModel.createOrder(
      currentUser.id,
      totalAmount,
      cartItems,
    );

    // 3. PRÉPARATION DES ARTICLES POUR STRIPE (Conversion en centimes)
    const line_items = cartItems.map((item) => {
      const unitPrice = parseFloat(item.prix_final || item.prix_ttc || 0);

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: item.nom_produit || item.nom || "Article CafThé",
            metadata: {
              sku: item.reference_sku,
            },
          },
          unit_amount: Math.round(unitPrice * 100), // Stripe veut des centimes (ex: 10.00€ -> 1000)
        },
        quantity: item.quantite,
      };
    });

    // 4. CRÉATION DE LA SESSION DE PAIEMENT STRIPE
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      metadata: {
        order_id: orderId.toString(),
        client_id: currentUser.id.toString(),
      },
      // CLIENT_URL doit être défini dans ton .env (ex: https://reactjs-cafthe...)
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
      customer_email: currentUser.email,
    });

    // On renvoie l'URL de paiement Stripe au Front-end
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
