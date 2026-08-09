const servico = localStorage.getItem("servico");
const data = localStorage.getItem("data");
const horario = localStorage.getItem("horario");

document.getElementById("resumoServico").textContent =
    "Serviço: " + servico;

document.getElementById("resumoData").textContent =
    "Data: " + data;

document.getElementById("resumoHorario").textContent =
    "Horário: " + horario;


function finalizarPagamento() {

    const tipoPagamento =
        document.getElementById("tipoPagamento").value;

    if (!tipoPagamento) {

        alert("Escolha uma forma de pagamento.");

        return;
    }

    localStorage.setItem(
        "tipoPagamento",
        tipoPagamento
    );

    window.location.href = "confirmacao.html";
}
