function continuar() {

    const servico = document.getElementById("servico").value;
    const data = document.getElementById("data").value;
    const horario = document.getElementById("horario").value;

    if (!servico || !data || !horario) {
        alert("Preencha todos os campos.");
        return;
    }

    localStorage.setItem("servico", servico);
    localStorage.setItem("data", data);
    localStorage.setItem("horario", horario);

    window.location.href = "cliente.html";
}
