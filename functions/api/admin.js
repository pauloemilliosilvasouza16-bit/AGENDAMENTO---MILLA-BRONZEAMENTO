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


export async function onRequestPatch(context) {
    try {

        const dados = await context.request.json();

        const id = dados.id;
        const status = dados.status;


        if (!id || !status) {

            return new Response(
                JSON.stringify({
                    sucesso: false,
                    mensagem: "ID e status são obrigatórios."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }


        await context.env.DB
            .prepare(`
                UPDATE agendamentos
                SET status = ?
                WHERE id = ?
            `)
            .bind(status, id)
            .run();


        return new Response(
            JSON.stringify({
                sucesso: true,
                mensagem: "Agendamento atualizado."
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
                mensagem: "Erro ao atualizar o agendamento.",
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
