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
            tipoPagamento
        } = dados;

        if (
            !nome ||
            !telefone ||
            !email ||
            !servico ||
            !data ||
            !horario ||
            !tipoPagamento
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
         * VALORES DO SERVIÇO
         */

        const valorIntegral = 100;
        const valorSinal = 30;

        let valor;

        if (tipoPagamento === "integral") {
            valor = valorIntegral;
        } else if (tipoPagamento === "sinal") {
            valor = valorSinal;
        } else {
            return Response.json(
                {
                    sucesso: false,
                    mensagem: "Forma de pagamento inválida."
                },
                {
                    status: 400
                }
            );
        }

        /*
         * VERIFICA DISPONIBILIDADE
         */

        const vagasMaximas = 5;

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
         * TOKEN DO MERCADO PAGO
         *
         * Será configurado como variável
         * secreta no Cloudflare.
         */

        const accessToken =
            context.env.MERCADOPAGO_ACCESS_TOKEN;

        if (!accessToken) {
            return Response.json(
                {
                    sucesso: false,
                    mensagem: "Mercado Pago não configurado."
                },
                {
                    status: 500
                }
            );
        }

        /*
         * CRIA PREFERÊNCIA
         */

        const preferencia = {
            items: [
                {
                    title:
                        `${servico} - ${data} ${horario}`,

                    quantity: 1,

                    unit_price: valor
                }
            ],

            payer: {
                name: nome,
                email: email
            },

            external_reference:
                JSON.stringify({
                    nome,
                    telefone,
                    email,
                    servico,
                    data,
                    horario,
                    tipoPagamento
                }),

            back_urls: {
                success:
                    "https://SEU-DOMINIO.com/confirmacao.html",

                failure:
                    "https://SEU-DOMINIO.com/pagamento.html",

                pending:
                    "https://SEU-DOMINIO.com/confirmacao.html"
            },

            auto_return: "approved"
        };

        const resposta =
            await fetch(
                "https://api.mercadopago.com/checkout/preferences",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${accessToken}`
                    },

                    body:
                        JSON.stringify(preferencia)
                }
            );

        const resultadoMercadoPago =
            await resposta.json();

        if (!resposta.ok) {

            console.error(
                "Erro Mercado Pago:",
                resultadoMercadoPago
            );

            return Response.json(
                {
                    sucesso: false,
                    mensagem:
                        "Não foi possível criar o pagamento."
                },
                {
                    status: 500
                }
            );
        }

        /*
         * RETORNA LINK DO CHECKOUT
         */

        return Response.json(
            {
                sucesso: true,

                preference_id:
                    resultadoMercadoPago.id,

                checkout_url:
                    resultadoMercadoPago.init_point,

                valor: valor
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
                    "Erro ao criar pagamento."
            },
            {
                status: 500
            }
        );
    }
}
