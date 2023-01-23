window.addEventListener("DOMContentLoaded", () => {

    const orbitalPathShow = document.querySelector("#OrbitalPathShow"),
        freeLook = document.querySelector("#freeLook"),
        ISSHorizon = document.querySelector("#ISSHorizon"),
        showUserLocation = document.querySelector("#user_location");

    const url = 'https://api.wheretheiss.at/v1/satellites/25544';
    const myIcon = L.icon({
        iconUrl: 'src/iss.svg',
        iconSize: [40, 40]
    });
    const map = L.map('map', {minZoom: 1.5}).setView([0, 0], 3);
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
                        Latitude: ${json["latitude"].toFixed(2)}<br>
                        Longitude: ${json["longitude"].toFixed(2)}<br>
                        Altitude: ${json["altitude"].toFixed(2)} km<br>
                        Velocity: ${json["velocity"].toFixed(2)} km/h<br>
                        `);

        circle.setLatLng([json.latitude, json.longitude]);
        if (freeLook.checked) map.panTo([json.latitude, json.longitude], animate = true);
        showHorizon(json["footprint"]);
        liveData(json);

    }

    function liveData(data) {
        const iss_lat = document.querySelector("#iss_lat"),
            iss_lon = document.querySelector("#iss_lon"),
            iss_alt = document.querySelector("#iss_alt"),
            iss_vel = document.querySelector("#iss_vel"),
            iss_vis = document.querySelector("#iss_vis"),
            iss_time = document.querySelector("#iss_time");

        iss_lat.textContent = data["latitude"].toFixed(5);
        iss_lon.textContent = data["longitude"].toFixed(5);
        iss_alt.textContent = data["altitude"].toFixed(3);
        iss_vel.textContent = data["velocity"].toFixed(3);
        iss_vis.textContent = `The ISS is in ${data.visibility}`;
        iss_time.textContent = new Date().toLocaleTimeString();

        if (data.visibility === "daylight") {
            iss_vis.style.cssText = `
                background-color: yellow;
                color: black;
            `
        } else {
            iss_vis.style.cssText = `
                background-color: black;
                color: white;
            `
        }
    }

    // updateISSFlightPath

    let polyline = L.polyline([], {color: 'blue', weight: 1}).addTo(map);
    let polylineNext = L.polyline([], {color: 'blue', weight: 1}).addTo(map);

    // updateISSFlightPath();
    orbitalPathShow.addEventListener("click", () => {
        updateISSFlightPath().catch(e => {
            new console.error(e);
        });
    })

    async function updateISSFlightPath() {
        let timeToPlot = Math.round(new Date().getTime() / 1000);

        let timestamps = `${timeToPlot},`;
        for (let i = 0; i < 45; i++) {
            timeToPlot += 130;
            timestamps += `${timeToPlot},`;
        }
        timestamps = timestamps.slice(0, -1);

        const data = await fetch(`https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${timestamps}&units=kilometers`);
        const json = await data.json();

        let lon = json[0].longitude;
        let flightPathCoordinates = [];
        let flightPathCoordinatesNext = [];

        json.forEach(item => {
            if (item.longitude >= lon) {
                flightPathCoordinates.push([item.latitude, item.longitude]);
                lon = item.longitude;
            } else {
                if (item.longitude <= flightPathCoordinates[0][1])
                    flightPathCoordinatesNext.push([item.latitude, item.longitude]);
            }
        })

        if (orbitalPathShow.checked) {
            polyline.setLatLngs(flightPathCoordinates);
            polylineNext.setLatLngs(flightPathCoordinatesNext);
        } else {
            polyline.setLatLngs([]);
            polylineNext.setLatLngs([]);
        }
    }

    //geolocation
    let userLocation = L.marker([0, 0]).setOpacity(0).addTo(map);

    showUserLocation.addEventListener("click", () => {
        navigator.geolocation.getCurrentPosition(function (position) {
            let userLat = position.coords.latitude;
            let userLon = position.coords.longitude;
            // this is just a marker placed in that position
            userLocation.setLatLng([position.coords.latitude, position.coords.longitude]);

            if (showUserLocation.checked) {
                userLocation.setOpacity(1);
                // move the map to have the location in its center
                map.panTo(new L.LatLng(userLat, userLon));
            } else {
                userLocation.setOpacity(0);
            }
        })
    })


    updateISSFlightPath().then(() => setInterval(() => issLocation(url), 1000));
    issLocation(url).then(() => setInterval(() => updateISSFlightPath(), 60000));
})