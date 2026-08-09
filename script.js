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

async function carregarHorarios() {

    const data = document.getElementById("data");
    const horario = document.getElementById("horario");

    if (!data || !horario) return;

    if (!data.value) {
        horario.disabled = true;
        horario.innerHTML = "";

        const opcao = document.createElement("option");
        opcao.value = "";
        opcao.textContent = "Selecione primeiro a data";
        horario.appendChild(opcao);

        return;
    }

    horario.disabled = true;
    horario.innerHTML = "";

    const carregando = document.createElement("option");
    carregando.value = "";
    carregando.textContent = "Carregando horários...";
    horario.appendChild(carregando);

    try {

        const resposta = await fetch(
            `/api/horarios?data=${encodeURIComponent(data.value)}`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao consultar horários");
        }

        const resultado = await resposta.json();

        horario.innerHTML = "";

        const inicial = document.createElement("option");
        inicial.value = "";
        inicial.textContent = "Selecione um horário";
        horario.appendChild(inicial);

        resultado.forEach(item => {

            const opcao = document.createElement("option");

            opcao.value = item.horario;

            if (item.vagas > 0) {

                opcao.textContent =
                    `${item.horario} — ${item.vagas} ${item.vagas === 1 ? "vaga" : "vagas"}`;

                opcao.disabled = false;

            } else {

                opcao.textContent =
                    `${item.horario} — LOTADO`;

                opcao.disabled = true;
            }

            horario.appendChild(opcao);
        });

        horario.disabled = false;

    } catch (erro) {

        console.error("Erro ao carregar horários:", erro);

        horario.innerHTML = "";

        const erroOpcao = document.createElement("option");
        erroOpcao.value = "";
        erroOpcao.textContent = "Erro ao carregar horários";
        horario.appendChild(erroOpcao);

        horario.disabled = true;
    }
}


// Quando a página carregar
document.addEventListener("DOMContentLoaded", function () {

    const data = document.getElementById("data");

    if (data) {
        data.addEventListener("change", carregarHorarios);
    }

    carregarHorarios();
});
