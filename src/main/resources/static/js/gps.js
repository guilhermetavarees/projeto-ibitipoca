/* ============================================================
   gps.js — geolocalização e distância até a rota (offline)
   ============================================================ */

App.gps = {
    marcador: null,
    watchId: null,

    toggle() {
        if (this.watchId !== null) {
            this.parar();
            return;
        }
        if (!navigator.geolocation) {
            App.dom.gps.textContent = "Indisponível";
            return;
        }

        App.dom.gps.textContent = "Buscando…";
        App.dom.btnGps.classList.add("btn--active");

        this.watchId = navigator.geolocation.watchPosition(
            (pos) => this.atualizar(pos),
            (err) => {
                App.dom.gps.textContent = "Erro";
                console.warn("GPS:", err.message);
                this.parar();
            },
            { enableHighAccuracy: true, maximumAge: 5000 }
        );
    },

    atualizar(pos) {
        const p = [pos.coords.latitude, pos.coords.longitude];
        const mapa = App.estado.mapa;

        if (!this.marcador) {
            this.marcador = L.circleMarker(p, {
                radius: 8,
                color: "#fff",
                weight: 2,
                fillColor: App.mapa.corGps(),
                fillOpacity: 1,
            }).addTo(mapa);
            mapa.setView(p, 14);
        } else {
            this.marcador.setLatLng(p);
        }

        // Distância até o ponto mais próximo da rota (sem internet).
        let min = Infinity;
        for (const ponto of App.estado.pontos) {
            const d = App.util.metros(p, ponto);
            if (d < min) min = d;
        }
        App.dom.gps.textContent = "A " + App.util.distanciaCurta(min) + " da rota";
    },

    parar() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        App.dom.btnGps.classList.remove("btn--active");
        if (!this.marcador) App.dom.gps.textContent = "Não iniciado";
    },
};
