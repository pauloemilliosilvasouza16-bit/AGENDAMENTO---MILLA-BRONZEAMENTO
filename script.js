function continuar() {

    const servico = document.getElementById("servico").value;
    const data = document.getElementById("data").value;
    const horario = document.getElementById("horario").value;

    if (!servico || !data || !horario) {

        alert("Preencha todos os campos.");

        return;
    }

    alert(
        "Serviço: " + servico +
        "\nData: " + data +
        "\nHorário: " + horario
    );
}
