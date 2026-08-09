export async function onRequestPost(context) {
  try {
    const dados = await context.request.json();

    const {
      nome,
      telefone,
      email,
      servico,
      data,
      horario
    } = dados;

    if (!nome || !telefone || !email || !servico || !data || !horario) {
      return new Response(
        JSON.stringify({
          sucesso: false,
          mensagem: "Todos os campos são obrigatórios."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const resultado = await context.env.DB
      .prepare(`
        INSERT INTO agendamentos
        (nome, telefone, email, servico, data, horario, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        nome,
        telefone,
        email,
        servico,
        data,
        horario,
        "pendente"
      )
      .run();

    return new Response(
      JSON.stringify({
        sucesso: true,
        mensagem: "Agendamento salvo com sucesso.",
        id: resultado.meta.last_row_id
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
