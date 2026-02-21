require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mercadopago = require('mercadopago');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database File Path
const DB_PATH = path.join(__dirname, 'database', 'db.json');

// Initialize DB
if (!fs.existsSync(path.join(__dirname, 'database'))) {
    fs.mkdirSync(path.join(__dirname, 'database'));
}

if (!fs.existsSync(DB_PATH)) {
    const initialData = {
        products: [
            { id: uuidv4(), name: "Seda King Size", price: 5.50, description: "Seda de alta qualidade.", image: "/images/seda.jpg", category: "Seda", featured: true },
            { id: uuidv4(), name: "Piteira de vidro", price: 15.00, description: "Piteira de borossilicato.", image: "/images/piteira.jpg", category: "Piteira", featured: true },
            { id: uuidv4(), name: "Dichavador de metal", price: 45.00, description: "Dichavador robusto.", image: "/images/dichavador.jpg", category: "Dichavador", featured: true },
            { id: uuidv4(), name: "Bong de vidro", price: 120.00, description: "Bong de vidro resistente.", image: "/images/bong.jpg", category: "Bong", featured: true },
            { id: uuidv4(), name: "Isqueiro especial", price: 35.00, description: "Isqueiro maçarico.", image: "/images/isqueiro.jpg", category: "Isqueiro", featured: false },
            { id: uuidv4(), name: "Cinzeiro decorativo", price: 25.00, description: "Cinzeiro de cerâmica.", image: "/images/cinzeiro.jpg", category: "Cinzeiro", featured: false }
        ],
        orders: [],
        coupons: [{ code: "PCQURA", discount: 15, type: "percentage" }]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

// Routes
app.get('/api/products', (req, res) => {
    const db = JSON.parse(fs.readFileSync(DB_PATH));
    res.json(db.products);
});

// Mercado Pago Checkout Pro Integration
app.post('/api/checkout', async (req, res) => {
    const { items, couponCode } = req.body;

    let totalDiscount = 0;
    if (couponCode === 'PCQURA') totalDiscount = 0.15;

    const preferenceItems = items.map(item => ({
        title: item.name,
        unit_price: Number((item.price * (1 - totalDiscount)).toFixed(2)),
        quantity: 1,
        currency_id: 'BRL'
    }));

    // For a real production implementation:
    /*
    mercadopago.configure({
        access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
    });

    const preference = {
        items: preferenceItems,
        back_urls: {
            success: "http://localhost:3000/success",
            failure: "http://localhost:3000/failure",
            pending: "http://localhost:3000/pending"
        },
        auto_return: "approved",
    };

    try {
        const response = await mercadopago.preferences.create(preference);
        res.json({ id: response.body.id, init_point: response.body.init_point });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    */

    res.json({
        message: "Preference created (Structure ready for Production)",
        items: preferenceItems,
        note: "In production, the MERCADO_PAGO_ACCESS_TOKEN from .env would be used."
    });
});

// Correios Shipping Calculation Structure
app.get('/api/shipping-calc', async (req, res) => {
    const { cep } = req.query;

    // In production, you would call the Correios SOAP or REST API
    // Example using axios for a hypothetical REST endpoint:
    /*
    try {
        const response = await axios.get(`https://correios-api.com/calc?cep=${cep}&user=${process.env.CORREIOS_USER}`);
        res.json(response.data);
    } catch (e) {
        res.status(500).json({ error: "Shipping calculation failed" });
    }
    */

    res.json({
        price: 18.50,
        deliveryTime: 4,
        service: "SEDEX",
        cep: cep
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
