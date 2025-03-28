import axios from "axios";
import connectDB from "./db.js";
import User from "./User.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  // Conectar ao banco de dados
  await connectDB();

  // Obter o token e nome_usuario da query string
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

    // Chamar a API bind_tk para obter os dados da conta
    const bindTkUrl = `http://api.ganharnoinsta.com/bind_tk.php?token=afc012ec-a318-433d-b3c0-5bf07cd29430&sha1=e5990261605cd152f26c7919192d4cd6f6e22227&nome_usuario=${nome_usuario}`;
    const bindResponse = await axios.get(bindTkUrl);
    const bindData = bindResponse.data;

    // Exibir a resposta da API bind_tk para depuração
    console.log("Resposta da API bind_tk recebida:", bindData);

    // Se a API retornar WRONG_USER, não adiciona a conta
    if (bindData.message && bindData.message.trim() === "WRONG_USER") {
      return res.status(400).json({ error: "WRONG_USER" });
    }

    // Se a resposta indicar sucesso (considerando o formato esperado)
    if (
      typeof bindData.status === "string" &&
      bindData.status.trim().toLowerCase() === "success" &&
      bindData.id_conta &&
      bindData.s
    ) {
      // Definir id_tiktok com fallback para id_conta
      const idTiktok = bindData.id_tiktok || bindData.id_conta;

      // Verificar se a conta já existe no array de contas do usuário
      const contaExistente = usuario.contas.find(
        (conta) => conta.id_conta === bindData.id_conta
      );

      if (contaExistente) {
        // Se já existe, retorne a mensagem de conta já vinculada (não adiciona novamente)
        return res.status(200).json({
          message: "Conta já vinculada com sucesso!",
          id_conta: bindData.id_conta,
          detalhes: {
            status: bindData.status,
            id_conta: bindData.id_conta,
            id_tiktok: idTiktok,
            s: bindData.s,
          },
        });
      } else {
        // Se não existe, adiciona a conta ao usuário e salva no banco
        usuario.contas.push({
          nomeConta: nome_usuario,
          id_conta: bindData.id_conta,
          id_tiktok: idTiktok,
          s: bindData.s,
        });
        await usuario.save();

        return res.status(200).json({
          message: "Conta adicionada com sucesso!",
          id_conta: bindData.id_conta,
          detalhes: {
            status: bindData.status,
            id_conta: bindData.id_conta,
            id_tiktok: idTiktok,
            s: bindData.s,
          },
        });
      }
    }

    // Se o formato não corresponder ou ocorrer outro erro, retorne-o
    return res.status(400).json({ error: bindData.message || "Erro ao vincular conta." });
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    return res.status(500).json({ error: "Erro interno ao processar requisição." });
  }
}
