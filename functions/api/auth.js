export function base64UrlDecode(str) {

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


export function pegarCookie(request, nome) {

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


export async function validarSessao(request, secret) {

    const cookie = pegarCookie(
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

    const usuario =
        payload.substring(0, separadorPayload);

    const expiracao =
        Number(
            payload.substring(separadorPayload + 1)
        );

    if (!usuario || !expiracao) {
        return false;
    }

    if (
        Math.floor(Date.now() / 1000)
        > expiracao
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
