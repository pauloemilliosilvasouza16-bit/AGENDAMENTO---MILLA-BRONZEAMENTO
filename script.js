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

    if (!data || !horario) {
        return;
    }


    /*
     * Nenhuma data selecionada
     */

    if (!data.value) {

        horario.disabled = true;
        horario.innerHTML = "";

        const opcao = document.createElement("option");

        opcao.value = "";
        opcao.textContent = "Selecione primeiro a data";

        horario.appendChild(opcao);

        return;
    }


    /*
     * Estado de carregamento
     */

    horario.disabled = true;
    horario.innerHTML = "";

    const carregando =
        document.createElement("option");

    carregando.value = "";
    carregando.textContent =
        "Carregando horários...";

    horario.appendChild(carregando);


    try {

        const resposta = await fetch(
            `/api/horarios?data=${encodeURIComponent(data.value)}`,
            {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store"
            }
        );


        /*
         * Verifica resposta HTTP
         */

        if (!resposta.ok) {

            throw new Error(
                `Erro HTTP ${resposta.status}`
            );

        }


        const resultado =
            await resposta.json();


        console.log(
            "Resposta da API de horários:",
            resultado
        );


        /*
         * O horarios.js atual retorna diretamente:
         *
         * [
         *   {
         *      horario: "08:00",
         *      ocupados: 0,
         *      vagas: 5,
         *      disponivel: true
         *   }
         * ]
         *
         * Também aceitamos caso a API
         * esteja retornando { horarios: [...] }.
         */

        let listaHorarios = resultado;


        if (
            resultado &&
            !Array.isArray(resultado) &&
            Array.isArray(resultado.horarios)
        ) {

            listaHorarios =
                resultado.horarios;

        }


        /*
         * Verifica se recebeu uma lista válida
         */

        if (!Array.isArray(listaHorarios)) {

            throw new Error(
                "Formato inválido retornado pela API."
            );

        }


        horario.innerHTML = "";


        /*
         * Opção inicial
         */

        const inicial =
            document.createElement("option");

        inicial.value = "";
        inicial.textContent =
            "Selecione um horário";

        horario.appendChild(inicial);


        /*
         * Nenhum horário retornado
         */

        if (listaHorarios.length === 0) {

            const vazio =
                document.createElement("option");

            vazio.value = "";
            vazio.textContent =
                "Nenhum horário disponível";

            horario.appendChild(vazio);

            horario.disabled = true;

            return;
        }


        /*
         * Cria os horários
         */

        listaHorarios.forEach(function (item) {

            const opcao =
                document.createElement("option");


            const hora =
                item.horario;


            const vagas =
                Number(item.vagas || 0);


            opcao.value = hora;


            /*
             * Horário disponível
             */

            if (vagas > 0) {

                opcao.textContent =
                    `${hora} — ${vagas} ${
                        vagas === 1
                            ? "vaga disponível"
                            : "vagas disponíveis"
                    }`;

                opcao.disabled = false;

            }


            /*
             * Horário lotado
             */

            else {

                opcao.textContent =
                    `${hora} — LOTADO`;

                opcao.disabled = true;

            }


            horario.appendChild(opcao);

        });


        /*
         * Libera o campo
         */

        horario.disabled = false;


    } catch (erro) {

        console.error(
            "Erro ao carregar horários:",
            erro
        );


        horario.innerHTML = "";


        const erroOpcao =
            document.createElement("option");

        erroOpcao.value = "";

        erroOpcao.textContent =
            "Erro ao carregar horários";

        horario.appendChild(erroOpcao);


        horario.disabled = true;

    }

}


/* =====================================================
   QUANDO A PÁGINA CARREGAR
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const data =
            document.getElementById("data");


        if (data) {

            data.addEventListener(
                "change",
                carregarHorarios
            );

        }


        /*
         * Se já existir uma data selecionada,
         * carrega os horários automaticamente.
         */

        carregarHorarios();

    }
);


/* =====================================================
   BOTÃO CONTINUAR
===================================================== */

window.continuar = function () {

    const data =
        document.getElementById("data").value;


    const horario =
        document.getElementById("horario").value;


    if (!data) {

        alert(
            "Escolha uma data."
        );

        return;
    }


    if (!horario) {

        alert(
            "Escolha um horário."
        );

        return;
    }


    /*
     * Salva os dados do agendamento
     */

    localStorage.setItem(
        "data",
        data
    );


    localStorage.setItem(
        "horario",
        horario
    );


    localStorage.setItem(
        "servico",
        "Bronzeamento"
    );


    /*
     * Vai para os dados do cliente
     */

    window.location.href =
        "cliente.html";

};
