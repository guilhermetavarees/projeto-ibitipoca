/* ============================================================
   app.js — bootstrap: resolve DOM, inicia módulos e carrega rota
   Deve ser o último script carregado.
   ============================================================ */

(function () {
    function resolverDom() {
        App.dom = {
            app: document.getElementById("app"),
            sidebar: document.getElementById("sidebar"),
            resizer: document.getElementById("resizer"),
            status: document.getElementById("status"),
            conexao: document.getElementById("conexao"),
            distancia: document.getElementById("distancia"),
            tempo: document.getElementById("tempo"),
            gps: document.getElementById("gps"),
            stepsWrap: document.getElementById("steps-wrap"),
            stepsList: document.getElementById("steps-list"),
            btnGps: document.getElementById("btn-gps"),
            btnSim: document.getElementById("btn-sim"),
            btnTema: document.getElementById("btn-tema"),
            btnToggle: document.getElementById("btn-toggle"),
        };
    }

    function setStatus(texto, erro) {
        App.dom.status.textContent = texto;
        App.dom.status.classList.toggle("status--error", !!erro);
    }

    function atualizarConexao() {
        const online = navigator.onLine;
        App.dom.conexao.innerHTML =
            `<span class="dot ${online ? "dot--on" : "dot--off"}"></span>` +
            (online ? "Com conexão" : "Sem conexão");
    }

    function init() {
        resolverDom();

        atualizarConexao();
        window.addEventListener("online", atualizarConexao);
        window.addEventListener("offline", atualizarConexao);

        App.tema.init();
        App.sidebar.init();
        App.mapa.criar();

        App.dom.btnGps.addEventListener("click", () => App.gps.toggle());
        App.dom.btnSim.addEventListener("click", () => App.sim.toggle());

        App.rota
            .carregar()
            .then((rota) => {
                App.dom.distancia.textContent = App.util.km(rota.distance);
                App.dom.tempo.textContent = App.util.tempo(rota.duration);
                setStatus(
                    `Rota carregada: ${App.dom.distancia.textContent} · ` +
                        `${App.dom.tempo.textContent} estimados.`
                );
            })
            .catch((erro) => {
                console.error("Erro ao carregar a rota:", erro);
                setStatus(
                    `Erro ao carregar a rota: ${erro.message} ` +
                        "Execute via localhost para carregar os dados.",
                    true
                );
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
