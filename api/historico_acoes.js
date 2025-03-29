import connectDB from "./db.js";
import { ActionHistory } from "./User.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Método não permitido." });
    }

    await connectDB();

    try {
        // Buscar todas as ações e popular o usuário associado
        const historico = await ActionHistory.find().populate("user", "nome nome_usuario");

        // Formatar os dados corretamente
        const formattedData = historico.map(action => ({
            nome_usuario: action.user?.nome_usuario || "Desconhecido", // Nome da ação
            nome_cadastrado: action.user?.nome || "Desconhecido", // Nome real do usuário no sistema
            acao_validada: action.acao_validada,  
            valor_confirmacao: action.valor_confirmacao,  
            data: action.data,
            valor: action.valor,
        }));

        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Erro ao buscar histórico de ações:", error);
        res.status(500).json({ error: "Erro ao buscar histórico de ações." });
    }
}
