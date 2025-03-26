import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido. Use POST." });
    }

    const { id_conta, id_pedido } = req.body; // Mudado de req.query para req.body

    if (!id_conta || !id_pedido) {
        return res.status(400).json({ error: "ID da conta e ID do pedido são obrigatórios." });
    }

    const url = "https://api.ganharnoinsta.com/confirm_action.php";
    const params = {
        token: "afc012ec-a318-433d-b3c0-5bf07cd29430",
        sha1: "e5990261605cd152f26c7919192d4cd6f6e22227",
        id_conta,
        id_pedido,
        is_tiktok: 1
    };

    try {
        const response = await axios.post(url, new URLSearchParams(params));
        const data = response.data;

        if (data.status === "CONFIRMADA") {
            res.json(data);
        } else {
            res.status(404).json({ error: "Ação não confirmada." });
        }
    } catch (error) {
        console.error("Erro ao confirmar ação:", error);
        res.status(500).json({ error: "Erro ao confirmar ação." });
    }
}
