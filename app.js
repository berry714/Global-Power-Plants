document.addEventListener('DOMContentLoaded', function () {
    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9uYXRoYW53ZXN0YmVycnkiLCJhIjoiY2x0OWR4Z3k4MGg2dTJpcDlwc2o0ZXFvayJ9.Muok1VdFLcaVekq6lWlzrA';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [0, 0],
        zoom: 1
    });
            var popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });        
            function toggleSidebar() {
                document.getElementById('sidebar').classList.toggle('visible');
                map.resize();
            }
        
    map.on('load', function() {
        map.addSource('powerPlants', {
            type: 'geojson',
            data: 'modified_power_plant_data.geojson'
        });
        
        map.addLayer({
            id: 'plant-points',
            type: 'circle',
            source: 'powerPlants',
            paint: {
                // Adjust circle radius based on zoom level and capacity
                'circle-radius': [
                    'interpolate', ['linear'], ['zoom'],
                    // At zoom level 0, circles start with a radius of 1-5 based on capacity
                    0, ['step',
                        ['get', 'capacity_mw'],
                        1, // Base size for plants with capacity < 10 MW
                        10, 2, // Size increases at 10 MW
                        100, 3, // Size increases at 100 MW
                        500, 4,
                        1000, 5, // Size increases at 1000 MW
                        5000, 6,
                        10000, 7 // Size increases at 10000 MW
                    ],
                    5, ['step',
                        ['get', 'capacity_mw'],
                        2, // Base size for plants with capacity < 10 MW
                        10, 4, // Size increases at 10 MW
                        100, 6, // Size increases at 100 MW
                        500, 8,
                        1000, 10, // Size increases at 1000 MW
                        5000, 12,
                        10000, 14 // Size increases at 10000 MW
                    ],
                    10, ['step',
                        ['get', 'capacity_mw'],
                        3, // Base size for plants with capacity < 10 MW
                        10, 6, // Size increases at 10 MW
                        100, 9, // Size increases at 100 MW
                        500, 12,
                        1000, 15, // Size increases at 1000 MW
                        5000, 18,
                        10000, 21 // Size increases at 10000 MW
                    ],
                    // At zoom level 15, increase circle radius significantly based on capacity
                    15, ['step',
                        ['get', 'capacity_mw'],
                        5, // Base size for plants with capacity < 10 MW
                        10, 10, // Size increases at 10 MW
                        100, 15, // Size increases at 100 MW
                        500, 20,
                        1000, 25, // Size increases at 1000 MW
                        5000, 30,
                        10000, 35 // Size increases at 10000 MW
                    ]
                ],
                'circle-color': [
                    'match',
                    ['get', 'primary_fuel'],
                    'Hydro', '#00FFFF',
                    'Solar', '#FFD700',
                    'Gas', '#87CEEB',
                    'Oil', '#000000',
                    'Biomass', '#006400',
                    'Other', '#b61e2b',
                    'Coal', '#6f7d8b',
                    'Wind', '#FF7F50',
                    'Waste', '#8B4513',
                    'Nuclear', '#8fa833',
                    'Geothermal', '#800080',
                    'Storage', '#fb95ff',
                    'Cogeneration', '#008080',
                    'Petcoke', '#36454F',
                    'Wave and Tidal', '#0000CD',
                    /* default */ '#FFFFFF'
                ],
            }
        });
        
        // Add a over effect when mousing over a point
        map.on('mouseenter', 'plant-points', function(e) {
            // Change the cursor style.
            map.getCanvas().style.cursor = 'pointer';
            var coordinates = e.features[0].geometry.coordinates.slice();
            var name = e.features[0].properties.name;
            // Ensure that if the map is zoomed out such that multiple copies of the feature are visible, the popup appears over the correct one.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            // Set the content and location of the popup, then add it to the map.
            popup.setLngLat(coordinates)
                .setHTML(name) // Set the name as the popup content
                .addTo(map);
        });
        
        // Remover hover effect
        map.on('mouseleave', 'plant-points', function() {
            map.getCanvas().style.cursor = '';
            popup.remove(); // Remove the popup
        });        
        
        map.on('click', 'plant-points', function(e) {
            var feature = e.features[0];
            var properties = feature.properties;
            var generationDataContent = '';
            var estimatedGenerationDataContent = '';
            
            // Check for generation data
            if (properties.generation_gwh_2014 ||
                properties.generation_gwh_2015 ||
                properties.generation_gwh_2016 ||
                properties.generation_gwh_2017 ||
                properties.generation_gwh_2018 ||
                properties.generation_gwh_2019) {
                
                generationDataContent = `
                    <h2>Generation Data:</h2>
                    ${properties.generation_gwh_2014 ? `<p><strong>2014:</strong> ${properties.generation_gwh_2014}</p>` : ''}
                    ${properties.generation_gwh_2015 ? `<p><strong>2015:</strong> ${properties.generation_gwh_2015}</p>` : ''}
                    ${properties.generation_gwh_2016 ? `<p><strong>2016:</strong> ${properties.generation_gwh_2016}</p>` : ''}
                    ${properties.generation_gwh_2017 ? `<p><strong>2017:</strong> ${properties.generation_gwh_2017}</p>` : ''}
                    ${properties.generation_gwh_2018 ? `<p><strong>2018:</strong> ${properties.generation_gwh_2018}</p>` : ''}
                    ${properties.generation_gwh_2019 ? `<p><strong>2019:</strong> ${properties.generation_gwh_2019}</p>` : ''}
                `;
            }
            
            // Check for estimated generation data
            if (properties.estimated_generation_gwh_2013 ||
                properties.estimated_generation_gwh_2014 ||
                properties.estimated_generation_gwh_2015 ||
                properties.estimated_generation_gwh_2016 ||
                properties.estimated_generation_gwh_2017) {
                
                estimatedGenerationDataContent = `
                    <h2>Estimated Generation Data:</h2>
                    ${properties.estimated_generation_gwh_2013 ? `<p><strong>2013:</strong> ${properties.estimated_generation_gwh_2013}</p>` : ''}
                    ${properties.estimated_generation_gwh_2014 ? `<p><strong>2014:</strong> ${properties.estimated_generation_gwh_2014} (${properties.estimated_generation_note_2014})</p>` : ''}
                    ${properties.estimated_generation_gwh_2015 ? `<p><strong>2015:</strong> ${properties.estimated_generation_gwh_2015} (${properties.estimated_generation_note_2015})</p>` : ''}
                    ${properties.estimated_generation_gwh_2016 ? `<p><strong>2016:</strong> ${properties.estimated_generation_gwh_2016} (${properties.estimated_generation_note_2016})</p>` : ''}
                    ${properties.estimated_generation_gwh_2017 ? `<p><strong>2017:</strong> ${properties.estimated_generation_gwh_2017} (${properties.estimated_generation_note_2017})</p>` : ''}
                `;
            }
            var sidebarContent = `
                <h1>${properties.name}</h1>
                <p><strong>Country:</strong> ${properties.country_long} (${properties.country})</p>
                <p><strong>Capacity (MW):</strong> ${properties.capacity_mw}</p>
                <p><strong>Primary Fuel:</strong> ${properties.primary_fuel}</p>
                ${properties.other_fuel1 ? `<p><strong>Secondary Fuel:</strong> ${properties.other_fuel1}</p>` : ''}
                ${properties.other_fuel2 ? `<p><strong>Tertiary Fuel:</strong> ${properties.other_fuel2}</p>` : ''}
                ${properties.other_fuel3 ? `<p><strong>Other Fuel:</strong> ${properties.other_fuel3}</p>` : ''}
                <p><strong>Source:</strong> ${properties.source}</p>
                ${properties.commissioning_year ? `<p><strong>Commissioning Year:</strong> ${parseInt(properties.commissioning_year)}</p>` : ''}
                ${generationDataContent}
                ${estimatedGenerationDataContent}
                ${properties.url ? `<p><a href="${properties.url}" target="_blank">More Details</a></p>` : ''}
            `;
            document.getElementById('sidebar').innerHTML = sidebarContent;
            document.getElementById('sidebar').classList.add('visible');
            map.resize(); // Ensure the map layout adjusts with the sidebar visible
        });
        
        // Close the sidebar when clicking anywhere on the map outside of points
        map.on('click', function(e) {
            if (!map.queryRenderedFeatures(e.point, { layers: ['plant-points'] }).length) {
                document.getElementById('sidebar').classList.remove('visible');
                map.resize(); // Adjust the map size back after the sidebar is hidden
            }
        });

        const selectAllCheckbox = document.getElementById('selectAll');
        const otherCheckboxes = document.querySelectorAll('#fuel-type-filters .checkboxes input[type="checkbox"]:not(#selectAll)');

        // Toggle all checkboxes based on "Select All"
        selectAllCheckbox.addEventListener('change', function () {
            otherCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateMapBasedOnFuelType(); // Assuming this function updates the map display
        });

        // Update "Select All" based on other checkboxes
        otherCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                if (!this.checked) {
                    selectAllCheckbox.checked = false;
                } else {
                    const allChecked = Array.from(otherCheckboxes).every(cb => cb.checked);
                    selectAllCheckbox.checked = allChecked;
                }
                updateMapBasedOnFuelType(); // Assuming this function updates the map display
            });
        });

        function updateMapBasedOnFuelType() {
            const selectedFuelTypes = Array.from(document.querySelectorAll('#fuel-type-filters input[type="checkbox"]:checked')).map(checkbox => checkbox.id);
            const filterPrimary = document.getElementById('filterPrimary').checked;
            const filterSecondary = document.getElementById('filterSecondary').checked;
        
            if (selectedFuelTypes.length > 0) {
                let filters = ['any'];
        
                selectedFuelTypes.forEach(fuelType => {
                    if (filterPrimary) {
                        filters.push(['==', ['get', 'primary_fuel'], fuelType]);
                    }
                    if (filterSecondary) {
                        filters.push(['==', ['get', 'other_fuel1'], fuelType]);
                        filters.push(['==', ['get', 'other_fuel2'], fuelType]);
                        filters.push(['==', ['get', 'other_fuel3'], fuelType]);
                    }
                });
        
                map.setFilter('plant-points', filters);
            } else {
                // When no checkboxes are selected, apply a filter that cannot be true to show no data.
                // This example assumes you do not have a fuel type called "none".
                map.setFilter('plant-points', ['==', ['get', 'primary_fuel'], 'none']);
            }
        }        
        
        updateMapBasedOnFuelType();

        // Initialize event listeners for both fuel type checkboxes and filter option changes
        document.querySelectorAll('#fuel-type-filters input[type="checkbox"], .filter-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateMapBasedOnFuelType);
        });       
        
        // Capacity slider functionality
        document.getElementById('capacity-slider').addEventListener('input', function(e) {
            const capacityValue = parseFloat(e.target.value);
            document.getElementById('capacity-value').textContent = capacityValue;
            map.setFilter('plant-points', ['>=', ['get', 'capacity_mw'], capacityValue]);
        });
        
        // Toggle filters functionality
        document.getElementById('toggle-filters-btn').addEventListener('click', function() {
            var legend = document.getElementById('fuel-type-filters');
            legend.style.display = legend.style.display === "none" ? "block" : "none";
        });
    });
});