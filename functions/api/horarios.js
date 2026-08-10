export async function onRequestGet(context) {

    try {

        const url = new URL(
            context.request.url
        );

        const data =
            url.searchParams.get("data");


        /*
         * DATA OBRIGATÓRIA
         */

        if (!data) {

            return Response.json(
                {
                    sucesso: false,
                    mensagem: "Data não informada."
                },
                {
                    status: 400
                }
            );
        }


        /*
         * HORÁRIOS DA MILLA
         */

        const horarios = [
            "08:00",
            "09:00",
            "10:00",
            "11:00",
            "13:00",
            "14:00",
            "15:00",
            "16:00",
            "17:00"
        ];


        /*
         * LIMITE DE VAGAS
         */

        const vagasMaximas = 5;


        const resultado = [];


        /*
         * VERIFICA CADA HORÁRIO
         */

        for (const horario of horarios) {

            const consulta =
                await context.env.DB
                    .prepare(`
                        SELECT COUNT(*) AS quantidade
                        FROM agendamentos
                        WHERE data = ?
                        AND horario = ?
                        AND status != 'cancelado'
                    `)
                    .bind(
                        data,
                        horario
                    )
                    .first();


            const ocupados =
                Number(
                    consulta?.quantidade || 0
                );


            const vagas =
                Math.max(
                    0,
                    vagasMaximas - ocupados
                );


            resultado.push({

                horario: horario,

                ocupados: ocupados,

                vagas: vagas,

                capacidade: vagasMaximas,

                disponivel:
                    ocupados < vagasMaximas

            });

        }


        /*
         * RETORNO
         */

        return Response.json(
            {
                sucesso: true,
                data: data,
                horarios: resultado
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
                mensagem:
                    "Erro ao consultar horários."
            },
            {
                status: 500
            }
        );
    }
}
