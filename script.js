window.addEventListener("DOMContentLoaded", () => {

    const orbitalPathShow = document.querySelector("#OrbitalPathShow"),
        freeLook = document.querySelector("#freeLook"),
        ISSHorizon = document.querySelector("#ISSHorizon"),
        // url = "http://api.open-notify.org/iss-now.json",
        url = 'https://api.wheretheiss.at/v1/satellites/25544',
        myIcon = L.icon({
            iconUrl: 'src/iss.svg',
            iconSize: [40, 40]
        });

    let latitude = 0,
        longitude = 0,
        timestamp = 0,
        altitude = 0,
        velocity = 0,
        footprint = 0;


    let map = L.map('map').setView([latitude, longitude], 3);
    let iss = L.marker([latitude, longitude], {icon: myIcon}).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const circle = L.circle([latitude, longitude], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.1,
        radius: footprint,
        weight: 1
    }).addTo(map);

    function showHorizon() {
        if (ISSHorizon.checked) {
            circle.setRadius(footprint)
        } else circle.setRadius(0);
    }

    ISSHorizon.addEventListener("click", () => {
        showHorizon();
    })


// fetch ISS data
    async function issLocation(url) {
        const loc = await fetch(url);
        const json = await loc.json();
        latitude = json.latitude;
        longitude = json.longitude;
        timestamp = json.timestamp;
        altitude = json.altitude;
        velocity = json.velocity;
        footprint = (json.footprint * 1000) / 2;

        console.log(latitude, longitude, altitude, velocity);
    }

    issLocation(url).then(() => {
        renderIssPosition(latitude, longitude, timestamp);
    })



    function renderIssPosition(latitude, longitude) {
        issLocation(url).then(() => {

            iss.setLatLng([latitude, longitude])
                .bindPopup(`Latitude: ${latitude.toFixed(2)}<br>
                            Longitude: ${longitude.toFixed(2)}<br>
                            Altitude: ${altitude.toFixed(2)} km<br>
                            Velocity: ${velocity.toFixed(2)} km/h<br>
                   `);

            circle.setLatLng([latitude, longitude]);
            if (freeLook.checked) map.panTo([latitude, longitude], animate = true);
            showHorizon();
            console.log(footprint);
        })

    }

    const interval = setInterval(() => renderIssPosition(latitude, longitude, timestamp), 1000);


})