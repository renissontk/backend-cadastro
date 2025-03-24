require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const app = express();

// Servir arquivos estáticos da pasta 'frontend'
app.use(express.static(path.join(__dirname, 'frontend')));

// Rota para servir o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const allowedOrigins = [
  'https://ganhesocial.com',
  'https://api.ganhesocial.com'
];

const corsOptions = {
  origin: ["https://ganhesocial.com"], // Permitindo seu domínio
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type",
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type',
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

app.use(bodyParser.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 Conectado ao MongoDB!"))
  .catch(err => console.error("Erro ao conectar:", err));

// Criar um modelo para usuários
const UserSchema = new mongoose.Schema({
  nome: String,
  email: String,
  senha: String
});
const User = mongoose.model('User', UserSchema);

// Rota para cadastro
app.post('/api/cadastrar', async (req, res) => {
  try {
    console.log("📩 Recebendo dados:", req.body);

    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios!" });
    }

    const novoUsuario = new User({ nome, email, senha });
    await novoUsuario.save();
    
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error("❌ Erro ao cadastrar usuário:", error);
    res.status(500).json({ error: error.message || "Erro ao cadastrar usuário" });
  }
});


// Em vez de iniciar o servidor com app.listen, exporte o app para que o Vercel o invoque como uma função serverless:
module.exports = app;
