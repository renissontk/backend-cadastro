import connectDB from "./db.js";
import { ActionHistory, User } from "./User.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido." });
    }

    await connectDB();

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token ausente." });

    try {
        // Encontrar o usuário pelo token
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(403).json({ error: "Token inválido." });
        }

        // Extrair os campos do corpo da requisição
        const { id_pedido, id_conta, url_dir, unique_id_verificado, acao_validada, valor_confirmacao, data, quantidade_pontos, tipo_acao } = req.body;

        // Verificar se `quantidade_pontos` e `tipo_acao` foram fornecidos
        if (!quantidade_pontos || !tipo_acao) {
            return res.status(400).json({ error: "Os campos quantidade_pontos e tipo_acao são obrigatórios." });
        }

        // Criar objeto da ação com os campos mínimos
        const novaAcao = new ActionHistory({
            user: user._id,
            token: user.token,
            nome_usuario: user.nome_usuario,
            quantidade_pontos,
            tipo_acao,
            data: new Date(data)
        });

        // Apenas adicionar os outros campos se estiverem presentes
        if (id_pedido) novaAcao.id_pedido = id_pedido;
        if (id_conta) novaAcao.id_conta = id_conta;
        if (url_dir) novaAcao.url_dir = url_dir;
        if (unique_id_verificado) novaAcao.unique_id_verificado = unique_id_verificado;
        if (acao_validada !== undefined) novaAcao.acao_validada = acao_validada;
        if (valor_confirmacao !== undefined) novaAcao.valor_confirmacao = valor_confirmacao;

        await novaAcao.save();

        res.status(200).json({ message: "Ação salva com sucesso." });
    } catch (error) {
        console.error("Erro ao salvar ação:", error);
        res.status(500).json({ error: "Erro ao salvar ação." });
    }
}
