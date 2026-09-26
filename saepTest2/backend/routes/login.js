        // const router = require('express').Router();
        // const pool = require('../db');

        // router.post('/', async(req, res) => {
        //     const { email, senha } = req.body;

        //     if (!email || !senha) {
        //         return res.status(400).json({ erro: 'email ou senha obrigatórios' });
        //     }

        //     try {
        //         const result = await pool.query(
        //             'SELECT id, nome, email, nome_usuario, imagem FROM tb_usuarios WHERE email = $1 AND senha = $2 ', [email, senha],
        //         );

        //         if (result.rows.length === 0) {
        //             return res.status(401).json({ erro: `email ou senha incorretos` });
        //         }

        //         res.json({ usuario: result.rows[0] });
        //     } catch (error) {
        //         console.error(error);
        //         res.status(500).json({ erro: 'Erro ao realizar Login' });
        //     }
        // });

        // module.exports = router;