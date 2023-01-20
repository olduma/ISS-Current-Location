window.addEventListener("DOMContentLoaded", () => {

    const orbitalPathShow = document.querySelector("#OrbitalPathShow"),
        freeLook = document.querySelector("#freeLook"),
        ISSHorizon = document.querySelector("#ISSHorizon");

    const url = 'https://api.wheretheiss.at/v1/satellites/25544';
    const myIcon = L.icon({
        iconUrl: 'src/iss.svg',
        iconSize: [40, 40]
    });
    const map = L.map('map').setView([0, 0], 3);
    const iss = L.marker([0, 0], {icon: myIcon}).addTo(map);
    const circle = L.circle([0, 0], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.1,
        radius: 1,
        weight: 1
    }).addTo(map);


    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // show or hide Horizon
    function showHorizon(footprint = 1) {
        if (ISSHorizon.checked) {
            circle.setRadius((footprint * 1000) / 2);
        } else circle.setRadius(0);
    }

    // fetch ISS data
    async function issLocation(url) {
        const loc = await fetch(url);
        const json = await loc.json();

        iss.setLatLng([json.latitude, json.longitude])
            .bindPopup(`
                        Latitude: ${json.latitude.toFixed(2)}<br>
                        Longitude: ${json.longitude.toFixed(2)}<br>
                        Altitude: ${json.altitude.toFixed(2)} km<br>
                        Velocity: ${json.velocity.toFixed(2)} km/h<br>
                        `);

        circle.setLatLng([json.latitude, json.longitude]);
        if (freeLook.checked) map.panTo([json.latitude, json.longitude], animate = true);
        showHorizon(json.footprint);

    }

    setInterval(() => issLocation(url), 1000);
})