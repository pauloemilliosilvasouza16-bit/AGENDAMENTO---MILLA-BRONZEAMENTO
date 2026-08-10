const servico = localStorage.getItem("servico");
const data = localStorage.getItem("data");
const horario = localStorage.getItem("horario");

document.getElementById("resumoServico").textContent =
    "Serviço: " + servico;

document.getElementById("resumoData").textContent =
    "Data: " + data;

document.getElementById("resumoHorario").textContent =
    "Horário: " + horario;

async function finalizarPagamento() {

    const tipoPagamento =
        document.getElementById("tipoPagamento").value;

    if (!tipoPagamento) {
        alert("Escolha uma forma de pagamento.");
        return;
    }

    const nome = localStorage.getItem("nome");
    const telefone = localStorage.getItem("telefone");
    const email = localStorage.getItem("email");

    if (!nome || !telefone || !email) {
        alert("Os dados do cliente não foram encontrados.");
        return;
    }

    const dados = {
        nome: nome,
        telefone: telefone,
        email: email,
        servico: servico,
        data: data,
        horario: horario,
        pagamento: tipoPagamento
    };

    try {

        const resposta = await fetch("/api/agendamento", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(
                resultado.mensagem ||
                "Não foi possível realizar o agendamento."
            );
            return;
        }

        localStorage.setItem(
            "tipoPagamento",
            tipoPagamento
        );

        window.location.href = "confirmacao.html";

    } catch (erro) {

        console.error(erro);

        alert("Erro de conexão. Tente novamente.");
    }
}
