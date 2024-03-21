var map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var powerPlantData;

fetch('power_plant_data.csv')
  .then(response => response.text())
  .then(csvData => {
    powerPlantData = csvData;
    displayPowerPlants();
  });

function displayPowerPlants() {
  var markers = [];
  var popupContents = [];

  // Parse CSV data
  var rows = powerPlantData.split('\n').slice(1); // Remove header row
  rows.forEach(row => {
    var values = row.split(',');
    var latitude = parseFloat(values[5]);
    var longitude = parseFloat(values[6]);
    var name = values[2];
    var country = values[0];
    var fuelType = values[7];
    var capacityMW = parseFloat(values[4]);
    var popupContent = `<b>Name:</b> ${name}<br><b>Country:</b> ${country}<br><b>Fuel Type:</b> ${fuelType}<br><b>Capacity (MW):</b> ${capacityMW}`;

    var marker = L.marker([latitude, longitude]);
    marker.bindPopup(popupContent);
    marker.bindTooltip(name, { permanent: true, direction: 'right' });

    markers.push(marker);
    popupContents.push(popupContent);
  });

  // Add markers to map
  markers.forEach(marker => {
    marker.addTo(map);
  });

  // Add control for filtering power plants by capacity
  var capacitySlider = L.control({ position: 'topright' });
  capacitySlider.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'capacity-slider');
    div.innerHTML = '<input type="range" id="capacity-range" min="0" max="5000" step="100" value="0">';
    return div;
  };
  capacitySlider.addTo(map);

  // Add event listener for slider change
  document.getElementById('capacity-range').addEventListener('input', function() {
    var minCapacity = parseFloat(this.value);
    markers.forEach((marker, index) => {
      var capacity = parseFloat(rows[index].split(',')[4]);
      if (capacity >= minCapacity) {
        marker.addTo(map);
      } else {
        map.removeLayer(marker);
      }
    });
  });

  // Add search bar for locating power plants by name or country
  var searchControl = new L.Control.Search({
    position: 'topright',
    layer: L.layerGroup(markers),
    propertyName: ['name', 'country'],
    marker: false,
    moveToLocation: function(latlng, title, map) {
      map.setView(latlng, 12);
    }
  });
  map.addControl(searchControl);
}
