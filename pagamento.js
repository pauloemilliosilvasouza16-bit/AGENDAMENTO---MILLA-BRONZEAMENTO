export async function onRequestPost(context) {
    try {
        const dados = await context.request.json();

        const {
            nome,
            telefone,
            email,
            servico,
            data,
            horario,
            pagamento
        } = dados;

        if (!nome || !telefone || !email || !servico || !data || !horario || !pagamento) {
            return new Response(
                JSON.stringify({
                    sucesso: false,
                    mensagem: "Dados incompletos."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const vagasMaximas = 5;

        const resultado = await context.env.DB
            .prepare(`
                SELECT COUNT(*) AS total
                FROM agendamentos
                WHERE data = ? AND horario = ?
            `)
            .bind(data, horario)
            .first();

        const totalAgendados = resultado?.total || 0;

        if (totalAgendados >= vagasMaximas) {
            return new Response(
                JSON.stringify({
                    sucesso: false,
                    mensagem: "Este horário já está lotado."
                }),
                {
                    status: 409,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        await context.env.DB
            .prepare(`
                INSERT INTO agendamentos
                (nome, telefone, email, servico, data, horario, pagamento, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
                nome,
                telefone,
                email,
                servico,
                data,
                horario,
                pagamento,
                "confirmado"
            )
            .run();

        return new Response(
            JSON.stringify({
                sucesso: true,
                mensagem: "Agendamento confirmado!"
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
                mensagem: "Erro ao salvar o agendamento.",
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
