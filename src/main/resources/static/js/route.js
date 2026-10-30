/* ============================================================
   route.js — carregamento, desenho e instruções da rota
   ============================================================ */

App.rota = {
    linha: null,

    async carregar() {
        const resposta = await fetch(App.CONFIG.arquivoRota);
        if (!resposta.ok) {
            throw new Error("Não foi possível carregar a rota.");
        }

        const dados = await resposta.json();
        if (dados.code !== "Ok" || !dados.routes?.length) {
            throw new Error("O arquivo não contém uma rota válida.");
        }

        const rota = dados.routes[0];
        const coords = rota.geometry?.coordinates;
        if (!coords?.length) {
            throw new Error("A rota não possui coordenadas.");
        }

        // OSRM entrega [lng, lat]; Leaflet usa [lat, lng].
        App.estado.pontos = coords.map(([lng, lat]) => [lat, lng]);

        this.desenhar();
        this.montarInstrucoes(rota.legs?.[0]?.steps || []);
        return rota;
    },

    desenhar() {
        const mapa = App.estado.mapa;
        const pontos = App.estado.pontos;

        this.linha = L.polyline(pontos, {
            color: App.mapa.corRota(),
            weight: 5,
            opacity: 0.95,
        }).addTo(mapa);

        L.marker(pontos[0]).addTo(mapa).bindPopup("Início da rota");
        L.marker(pontos[pontos.length - 1])
            .addTo(mapa)
            .bindPopup("Fim da rota");

        mapa.fitBounds(this.linha.getBounds(), { padding: [30, 30] });
    },

    montarInstrucoes(steps) {
        if (!steps.length) return;

        const { stepsList, stepsWrap } = App.dom;
        stepsList.innerHTML = "";
        App.estado.stepEls = [];

        steps.forEach((step) => {
            const [lng, lat] = step.maneuver.location;
            const destino = [lat, lng];

            const li = document.createElement("li");
            li.className = "step";
            li.innerHTML =
                `<span class="step__icon">${App.util.iconeManobra(
                    step.maneuver
                )}</span>` +
                `<span class="step__body">` +
                `<span class="step__text">${App.util.textoManobra(
                    step
                )}</span>` +
                `<span class="step__meta">${App.util.distanciaCurta(
                    step.distance
                )}</span>` +
                `</span>`;

            li.addEventListener("click", () => {
                App.estado.mapa.setView(destino, 15, { animate: true });
                App.estado.stepEls.forEach((el) =>
                    el.classList.remove("step--active")
                );
                li.classList.add("step--active");
            });

            stepsList.appendChild(li);
            App.estado.stepEls.push(li);
        });

        stepsWrap.hidden = false;
    },
};
