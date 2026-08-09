const nome = localStorage.getItem("nome");
const servico = localStorage.getItem("servico");
const data = localStorage.getItem("data");
const horario = localStorage.getItem("horario");
const tipoPagamento = localStorage.getItem("tipoPagamento");


document.getElementById("cliente").textContent =
    "Cliente: " + nome;

document.getElementById("servico").textContent =
    "Serviço: " + servico;

document.getElementById("data").textContent =
    "Data: " + data;

document.getElementById("horario").textContent =
    "Horário: " + horario;


if (tipoPagamento === "integral") {

    document.getElementById("pagamento").textContent =
        "Pagamento: Valor integral";

} else {

    document.getElementById("pagamento").textContent =
        "Pagamento: Sinal";
}
