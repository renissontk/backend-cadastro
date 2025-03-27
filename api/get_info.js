import axios from "axios";
import connectDB from "./db.js";
import User from "./User.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Método não permitido." });
    }

    // Conectar ao banco de dados
    await connectDB();

    // Obter o token da query string
    const { token, nome_usuario } = req.query;

    if (!token) {
        return res.status(400).json({ error: "O parâmetro 'token' é obrigatório." });
    }

    if (!nome_usuario) {
        return res.status(400).json({ error: "O parâmetro 'nome_usuario' é obrigatório." });
    }

    try {
        // Buscar usuário pelo token fixo salvo no MongoDB
        const usuario = await User.findOne({ token });

        if (!usuario) {
            return res.status(403).json({ error: "Acesso negado. Token inválido." });
        }

        // Chamar a API bind_tk para obter o ID da conta
        const bindTkUrl = `http://api.ganharnoinsta.com/bind_tk.php?token=afc012ec-a318-433d-b3c0-5bf07cd29430&sha1=e5990261605cd152f26c7919192d4cd6f6e22227&nome_usuario=${nome_usuario}`;

        const bindResponse = await axios.get(bindTkUrl);
        const bindData = bindResponse.data;

        // Se a resposta indicar sucesso, retorna os detalhes solicitados
        if (bindData.status === "success") {
            return res.status(200).json({
                message: "Conta vinculada com sucesso!",
                id_conta: bindData.id_conta,
                detalhes: {
                    status: bindData.status,
                    id_conta: bindData.id_conta,
                    id_tiktok: bindData.id_tiktok || bindData.id_conta,
                    s: bindData.s || "3"
                }
            });
        }

        // Se a resposta for 'WRONG_USER', retorna uma mensagem genérica
        if (bindData.status === "fail" && bindData.message === "WRONG_USER") {
            return res.status(200).json({ message: "Conta vinculada com sucesso!" });
        }

        return res.status(400).json({ error: "Erro ao vincular conta." });

    } catch (error) {
        console.error("Erro ao processar requisição:", error);
        return res.status(500).json({ error: "Erro interno ao processar requisição." });
    }
}
