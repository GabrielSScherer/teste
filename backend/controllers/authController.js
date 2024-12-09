const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Registro de usuário (POST /auth/register)
router.post('/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body;

    // Validações (campos obrigatórios, email e senha)
    if (!name || !email || !password || password !== confirmpassword) {
        return res.status(400).json({ msg: 'Preencha todos os campos corretamente.' });
    }

    // Verifica se o e-mail já está registrado
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ msg: 'E-mail já cadastrado.' });
    }

    // Cria um novo usuário
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: passwordHash });

    try {
        await user.save();

        // Gera o token JWT após o registro
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Retorna o token junto com uma mensagem de sucesso
        res.status(201).json({ msg: 'Usuário registrado com sucesso!', token });
    } catch (error) {
        res.status(500).json({ msg: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

// Login de usuário (POST /auth/login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }

    // Gera o token JWT para o login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ msg: 'Login realizado com sucesso!', token });
});


module.exports = router;
