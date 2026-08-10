function pegarCookie(request, nome) {

    const cookies =
        request.headers.get("Cookie") || "";

    const partes =
        cookies.split(";");

    for (const parte of partes) {

        const [chave, ...valor] =
            parte.trim().split("=");

        if (chave === nome) {
            return valor.join("=");
        }
    }

    return null;
}


function base64UrlDecode(str) {

    str = str
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    while (str.length % 4) {
        str += "=";
    }

    const binary =
        atob(str);

    const bytes =
        new Uint8Array(
            binary.length
        );

    for (
        let i = 0;
        i < binary.length;
        i++
    ) {

        bytes[i] =
            binary.charCodeAt(i);
    }

    return bytes;
}


async function validarSessao(
    request,
    secret
) {

    const cookie =
        pegarCookie(
            request,
            "milla_admin_session"
        );

    if (!cookie) {
        return false;
    }


    const ultimoPonto =
        cookie.lastIndexOf(".");

    if (ultimoPonto === -1) {
        return false;
    }


    const payload =
        cookie.substring(
            0,
            ultimoPonto
        );

    const assinaturaRecebida =
        cookie.substring(
            ultimoPonto + 1
        );


    if (
        !payload ||
        !assinaturaRecebida
    ) {

        return false;
    }


    const separadorPayload =
        payload.lastIndexOf(".");

    if (separadorPayload === -1) {
        return false;
    }


    const expiracao =
        Number(
            payload.substring(
                separadorPayload + 1
            )
        );


    if (!expiracao) {
        return false;
    }


    if (
        Math.floor(
            Date.now() / 1000
        ) > expiracao
    ) {

        return false;
    }


    const encoder =
        new TextEncoder();


    try {

        const chave =
            await crypto.subtle.importKey(
                "raw",
                encoder.encode(secret),
                {
                    name: "HMAC",
                    hash: "SHA-256"
                },
                false,
                ["verify"]
            );


        return await crypto.subtle.verify(
            "HMAC",
            chave,
            base64UrlDecode(
                assinaturaRecebida
            ),
            encoder.encode(payload)
        );


    } catch (erro) {

        return false;
    }
}


/* =========================================
   HORÁRIOS PERMITIDOS
========================================= */

const HORARIOS = [
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


const LIMITE_VAGAS = 5;


/* =========================================
   BUSCAR AGENDAMENTOS
========================================= */

export async function onRequestGet(context) {

    const autenticado =
        await validarSessao(
            context.request,
            context.env.ADMIN_SESSION_SECRET
        );


    if (!autenticado) {

        return Response.json(
            {
                sucesso: false,
                mensagem: "Não autorizado."
            },
            {
                status: 401
            }
        );
    }


    const url =
        new URL(
            context.request.url
        );


    const data =
        url.searchParams.get(
            "data"
        );


    /*
     * =====================================
     * CONSULTA DE DISPONIBILIDADE
     * =====================================
     */

    if (data) {

        try {

            const horarios = [];


            for (
                const horario
                of HORARIOS
            ) {

                const consulta =
                    await context.env.DB
                        .prepare(`
                            SELECT
                                COUNT(*) AS quantidade
                            FROM agendamentos
                            WHERE data = ?
                            AND horario = ?
                            AND status = 'confirmado'
                        `)
                        .bind(
                            data,
                            horario
                        )
                        .first();


                const ocupados =
                    Number(
                        consulta?.quantidade ||
                        0
                    );


                const vagas =
                    Math.max(
                        0,
                        LIMITE_VAGAS -
                        ocupados
                    );


                horarios.push({

                    horario: horario,

                    ocupados: ocupados,

                    vagas: vagas,

                    disponivel:
                        ocupados <
                        LIMITE_VAGAS

                });

            }


            return Response.json(
                {
                    sucesso: true,
                    data: data,
                    horarios: horarios
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
                        "Erro ao consultar disponibilidade."
                },
                {
                    status: 500
                }
            );
        }
    }


    /*
     * =====================================
     * LISTAGEM NORMAL DO PAINEL
     * =====================================
     */

    try {

        const resultado =
            await context.env.DB
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
                    ORDER BY
                        data ASC,
                        horario ASC
                `)
                .all();


        return Response.json(
            {
                sucesso: true,
                agendamentos:
                    resultado.results
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
                    "Erro ao buscar os agendamentos."
            },
            {
                status: 500
            }
        );
    }
}


/* =========================================
   CRIAR AGENDAMENTO MANUAL
========================================= */

export async function onRequestPost(context) {

    const autenticado =
        await validarSessao(
            context.request,
            context.env.ADMIN_SESSION_SECRET
        );


    if (!autenticado) {

        return Response.json(
            {
                sucesso: false,
                mensagem: "Não autorizado."
            },
            {
                status: 401
            }
        );
    }


    try {

        const dados =
            await context.request.json();


        const nome =
            String(
                dados.nome || ""
            ).trim();


        const telefone =
            String(
                dados.telefone || ""
            ).trim();


        const email =
            String(
                dados.email || ""
            ).trim();


        const servico =
            String(
                dados.servico || ""
            ).trim();


        const data =
            String(
                dados.data || ""
            ).trim();


        const horario =
            String(
                dados.horario || ""
            ).trim();


        const pagamento =
            String(
                dados.pagamento || "Pendente"
            ).trim();


        const statusSolicitado =
            String(
                dados.status || "pendente"
            ).trim().toLowerCase();


        /*
         * =====================================
         * VALIDAÇÃO DOS CAMPOS
         * =====================================
         */

        if (
            !nome ||
            !telefone ||
            !servico ||
            !data ||
            !horario
        ) {

            return Response.json(
                {
                    sucesso: false,
                    mensagem:
                        "Nome, telefone, serviço, data e horário são obrigatórios."
                },
                {
                    status: 400
                }
            );
        }


        /*
         * =====================================
         * VALIDA HORÁRIO
         * =====================================
         */

        if (
            !HORARIOS.includes(
                horario
            )
        ) {

            return Response.json(
                {
                    sucesso: false,
                    mensagem:
                        "Horário inválido."
                },
                {
                    status: 400
                }
            );
        }


        /*
         * =====================================
         * STATUS PERMITIDOS
         * =====================================
         */

        const status =
            statusSolicitado ===
            "confirmado"
                ? "confirmado"
                : "pendente";


        /*
         * =====================================
         * VERIFICA VAGAS
         *
         * Apenas CONFIRMADOS ocupam
         * as 5 vagas atualmente.
         * =====================================
         */

        const consulta =
            await context.env.DB
                .prepare(`
                    SELECT
                        COUNT(*) AS quantidade
                    FROM agendamentos
                    WHERE data = ?
                    AND horario = ?
                    AND status = 'confirmado'
                `)
                .bind(
                    data,
                    horario
                )
                .first();


        const ocupados =
            Number(
                consulta?.quantidade ||
                0
            );


        /*
         * Se o novo agendamento for
         * confirmado, precisa existir vaga.
         */

        if (
            status === "confirmado" &&
            ocupados >= LIMITE_VAGAS
        ) {

            return Response.json(
                {
                    sucesso: false,
                    mensagem:
                        "Este horário está lotado."
                },
                {
                    status: 409
                }
            );
        }


        /*
         * =====================================
         * CRIA AGENDAMENTO
         * =====================================
         */

        const resultado =
            await context.env.DB
                .prepare(`
                    INSERT INTO agendamentos (
                        data,
                        horario,
                        nome,
                        telefone,
                        email,
                        servico,
                        status,
                        pagamento
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `)
                .bind(
                    data,
                    horario,
                    nome,
                    telefone,
                    email,
                    servico,
                    status,
                    pagamento
                )
                .run();


        return Response.json(
            {
                sucesso: true,
                mensagem:
                    "Agendamento criado com sucesso.",
                id:
                    resultado.meta?.last_row_id ||
                    null
            },
            {
                status: 201
            }
        );


    } catch (erro) {

        console.error(erro);


        return Response.json(
            {
                sucesso: false,
                mensagem:
                    "Erro ao criar o agendamento."
            },
            {
                status: 500
            }
        );
    }
}


/* =========================================
   CANCELAR / ATUALIZAR AGENDAMENTO
========================================= */

export async function onRequestPatch(context) {

    const autenticado =
        await validarSessao(
            context.request,
            context.env.ADMIN_SESSION_SECRET
        );


    if (!autenticado) {

        return Response.json(
            {
                sucesso: false,
                mensagem: "Não autorizado."
            },
            {
                status: 401
            }
        );
    }


    try {

        const dados =
            await context.request.json();


        const id =
            dados.id;


        const status =
            dados.status;


        if (
            !id ||
            !status
        ) {

            return Response.json(
                {
                    sucesso: false,
                    mensagem:
                        "ID e status são obrigatórios."
                },
                {
                    status: 400
                }
            );
        }


        await context.env.DB
            .prepare(`
                UPDATE agendamentos
                SET status = ?
                WHERE id = ?
            `)
            .bind(
                status,
                id
            )
            .run();


        return Response.json(
            {
                sucesso: true,
                mensagem:
                    "Agendamento atualizado."
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
                    "Erro ao atualizar o agendamento."
            },
            {
                status: 500
            }
        );
    }
}
