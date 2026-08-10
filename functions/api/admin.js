export async function onRequestGet(context) {
    try {
        const resultado = await context.env.DB
            .prepare(`
                SELECT
                    id,
                    data,
                    horario,
                    nome,
                    telefone,
                    email,
                    servico,
                    status,
                    pagamento,
                    criado_em
                FROM agendamentos
                ORDER BY data ASC, horario ASC
            `)
            .all();

        return new Response(
            JSON.stringify({
                sucesso: true,
                agendamentos: resultado.results
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (erro) {

        return new Response(
            JSON.stringify({
                sucesso: false,
                mensagem: "Erro ao buscar os agendamentos.",
                erro: erro.message
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}
