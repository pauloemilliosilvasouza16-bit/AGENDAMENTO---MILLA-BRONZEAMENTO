function base64UrlDecode(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");

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

    const payload = cookie.substring(0, ultimoPonto);
    const assinaturaRecebida = cookie.substring(ultimoPonto + 1);

    if (!payload || !assinaturaRecebida) {
        return false;
    }

    const separadorPayload = payload.lastIndexOf(".");

    if (separadorPayload === -1) {
        return false;
    }

    const usuario = payload.substring(0, separadorPayload);
    const expiracao = Number(
        payload.substring(separadorPayload + 1)
    );

    if (!usuario || !expiracao) {
        return false;
    }

    if (Math.floor(Date.now() / 1000) > expiracao) {
        return false;
    }

    const encoder = new TextEncoder();

    try {

        const chave = await crypto.subtle.importKey(
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
function base64urlEncode(bytes) {

    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}


async function criarAssinatura(valor, segredo) {

    const encoder = new TextEncoder();

    const chave = await crypto.subtle.importKey(
        "raw",
        encoder.encode(segredo),
        {
            name: "HMAC",
            hash: "SHA-256"
        },
        false,
        ["sign"]
    );

    const assinatura =
        await crypto.subtle.sign(
            "HMAC",
            chave,
            encoder.encode(valor)
        );

    return base64urlEncode(
        new Uint8Array(assinatura)
    );
}


export async function onRequestPost(context) {
    try {
        const dados =
            await context.request.json();

        const usuario = dados.usuario;
        const senha = dados.senha;

        if (!usuario || !senha) {
            return Response.json(
                {
                    sucesso: false,
                    mensagem: "Usuário e senha são obrigatórios."
                },
                {
                    status: 400
                }
            );
        }

        if (
            usuario !== context.env.ADMIN_USER ||
            senha !== context.env.ADMIN_PASSWORD
        ) {
            return Response.json(
                {
                    sucesso: false,
                    mensagem: "Usuário ou senha incorretos."
                },
                {
                    status: 401
                }
            );
        }     

        const agora =
            Math.floor(Date.now() / 1000);

        const expiracao =
            agora + (8 * 60 * 60);

        const payload =
            `${usuario}.${expiracao}`;

        const assinatura =
            await criarAssinatura(
                payload,
                context.env.ADMIN_SESSION_SECRET
            );

        const cookie =
            `milla_admin_session=${payload}.${assinatura}; ` +
            `Path=/; ` +
            `HttpOnly; ` +
            `Secure; ` +
            `SameSite=Strict; ` +
            `Max-Age=28800`;

        return Response.json(
            {
                sucesso: true
            },
            {
                status: 200,
                headers: {
                    "Set-Cookie": cookie
                }
            }
        );

    } catch (erro) {

        return Response.json(
            {
                sucesso: false,
                mensagem: "Erro ao realizar login."
            },
            {
                status: 500
            }
        );
    }
}
