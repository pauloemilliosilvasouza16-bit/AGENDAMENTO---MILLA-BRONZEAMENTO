function pegarCookie(request, nome) {

    const cookies = request.headers.get("Cookie") || "";

    const partes = cookies.split(";");

    for (const parte of partes) {

        const [chave, ...valor] = parte.trim().split("=");

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

    const binary = atob(str);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}


async function validarSessao(request, secret) {

    const cookie = pegarCookie(
        request,
        "milla_admin_session"
    );

    if (!cookie) {
        return false;
    }

    const ultimoPonto = cookie.lastIndexOf(".");

    if (ultimoPonto === -1) {
        return false;
    }

    const payload =
        cookie.substring(0, ultimoPonto);

    const assinaturaRecebida =
        cookie.substring(ultimoPonto + 1);

    if (!payload || !assinaturaRecebida) {
        return false;
    }

    const separadorPayload =
        payload.lastIndexOf(".");

    if (separadorPayload === -1) {
        return false;
    }

    const expiracao = Number(
        payload.substring(separadorPayload + 1)
    );

    if (!expiracao) {
        return false;
    }

    if (Math.floor(Date.now() / 1000) > expiracao) {
        return false;
    }

    const encoder = new TextEncoder();

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
            base64UrlDecode(assinaturaRecebida),
            encoder.encode(payload)
        );

    } catch (erro) {

        return false;
    }
}


/* =========================================
   BUSCAR AGENDAMENTOS
========================================= */

export async function onRequestGet(context) {

    const autenticado = await validarSessao(
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

        return Response.json(
            {
                sucesso: true,
                agendamentos: resultado.results
            },
            {
                status: 200
            }
        );

    } catch (erro) {

        return Response.json(
            {
                sucesso: false,
                mensagem: "Erro ao buscar os agendamentos."
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

    const autenticado = await validarSessao(
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

        const id = dados.id;
        const status = dados.status;


        if (!id || !status) {

            return Response.json(
                {
                    sucesso: false,
                    mensagem: "ID e status são obrigatórios."
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
            .bind(status, id)
            .run();


        return Response.json(
            {
                sucesso: true,
                mensagem: "Agendamento atualizado."
            },
            {
                status: 200
            }
        );

    } catch (erro) {

        return Response.json(
            {
                sucesso: false,
                mensagem: "Erro ao atualizar o agendamento."
            },
            {
                status: 500
            }
        );
    }
}
