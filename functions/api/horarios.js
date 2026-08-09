export async function onRequestGet(context) {

    const url = new URL(context.request.url);
    const data = url.searchParams.get("data");

    if (!data) {
        return Response.json(
            { error: "Data não informada" },
            { status: 400 }
        );
    }

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

    const resultado = [];

    for (const horario of horarios) {

        const consulta = await context.env.DB
            .prepare(`
                SELECT COUNT(*) AS quantidade
                FROM agendamentos
                WHERE data = ?
                AND horario = ?
                AND status = 'confirmado'
            `)
            .bind(data, horario)
            .first();

        const ocupados = Number(consulta?.quantidade || 0);
        const vagas = Math.max(0, 5 - ocupados);

        resultado.push({
            horario: horario,
            ocupados: ocupados,
            vagas: vagas,
            disponivel: ocupados < 5
        });
    }

    return Response.json(resultado);
}
