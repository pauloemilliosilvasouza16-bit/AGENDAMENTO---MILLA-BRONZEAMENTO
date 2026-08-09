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


function carregarHorarios() {

    const data = document.getElementById("data");
    const horario = document.getElementById("horario");

    if (!data.value) {
        horario.disabled = true;
        return;
    }

    horario.disabled = false;

    horario.innerHTML = "";

    const opcaoInicial = document.createElement("option");

    opcaoInicial.value = "";
    opcaoInicial.textContent = "Selecione um horário";

    horario.appendChild(opcaoInicial);


    horarios.forEach(function(hora) {

        const opcao = document.createElement("option");

        opcao.value = hora;
        opcao.textContent = hora;

        horario.appendChild(opcao);

    });

}


function continuar() {

    const servico =
        document.getElementById("servico").value;

    const data =
        document.getElementById("data").value;

    const horario =
        document.getElementById("horario").value;


    if (!data) {

        alert("Escolha uma data.");

        return;
    }


    if (!horario) {

        alert("Escolha um horário.");

        return;
    }


    localStorage.setItem("servico", servico);
    localStorage.setItem("data", data);
    localStorage.setItem("horario", horario);


    window.location.href = "cliente.html";
}
