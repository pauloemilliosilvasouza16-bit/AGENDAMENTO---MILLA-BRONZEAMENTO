function continuarCliente() {

    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const email = document.getElementById("email").value;

    if (!nome || !telefone || !email) {

        alert("Preencha todos os campos.");

        return;
    }

    localStorage.setItem("nome", nome);
    localStorage.setItem("telefone", telefone);
    localStorage.setItem("email", email);

    window.location.href = "pagamento.html";
}
