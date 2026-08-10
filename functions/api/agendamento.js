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


        /*
         * VALIDAÇÃO DOS DADOS
         */

        if (
            !nome ||
            !telefone ||
            !email ||
            !servico ||
            !data ||
            !horario ||
            !pagamento
        ) {

            return Response.json(
                {
                    sucesso: false,
                    mensagem: "Dados incompletos."
                },
                {
                    status: 400
                }
            );
        }


        /*
         * LIMITE DE VAGAS
         */

        const vagasMaximas = 5;


        /*
         * CONTA SOMENTE AGENDAMENTOS ATIVOS
         *
         * Cancelados NÃO ocupam vaga.
         */

        const resultado = await context.env.DB
            .prepare(`
                SELECT COUNT(*) AS total
                FROM agendamentos
                WHERE data = ?
                AND horario = ?
                AND status != 'cancelado'
            `)
            .bind(data, horario)
            .first();


        const totalAgendados =
            Number(resultado?.total || 0);


        /*
         * HORÁRIO LOTADO
         */

        if (totalAgendados >= vagasMaximas) {

            return Response.json(
                {
                    sucesso: false,
                    mensagem: "Este horário já está lotado."
                },
                {
                    status: 409
                }
            );
        }


        /*
         * CRIA AGENDAMENTO
         */

        await context.env.DB
            .prepare(`
                INSERT INTO agendamentos
                (
                    nome,
                    telefone,
                    email,
                    servico,
                    data,
                    horario,
                    pagamento,
                    status
                )
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


        /*
         * SUCESSO
         */

        return Response.json(
            {
                sucesso: true,
                mensagem: "Agendamento confirmado!"
            },
            {
                status: 200
            }
        );


    } catch (erro) {

        console.error(erro);


        return Response.json(
            {
                sucesso: false,
                mensagem: "Erro ao salvar o agendamento."
            },
            {
                status: 500
            }
        );
    }
}
