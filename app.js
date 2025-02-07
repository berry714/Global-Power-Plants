// Wait until the HTML document is fully loaded before running the code.
document.addEventListener('DOMContentLoaded', function () {
    // Set the access token for Mapbox GL JS.
    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9uYXRoYW53ZXN0YmVycnkiLCJhIjoiY202dTNwODAyMGFzejJrcTQ1ZHZuN3hkMiJ9._qgwvbFblwbJ10bCAYpoBw';
    
    // Initialize a new Mapbox map.
    const map = new mapboxgl.Map({
        container: 'map', // Specify the HTML element ID that will contain the map.
        style: 'mapbox://styles/jonathanwestberry/clu7k2gvq02eo01pt8c89fksc', // Set the style of the map.
        center: [0, 0], // Set the initial geographic center point of the map.
        zoom: 1 // Set the initial zoom level of the map.
    });
    
    // Initialize a new Popup instance without a close button and not closing on click.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    }); 
        
    // Add an event listener that runs when the map has finished loading.
    map.on('load', function() {
        // Add the power consumption and GHG emissions dataset
        map.addSource('consumption-emissions', {
            type: 'geojson',
            data: 'updated_countries.geojson'
        });
        map.addLayer({
            id: 'emissions',
            type: 'circle',
            source: 'consumption-emissions',
            layout: {
                'visibility': 'none', // Set the initial visibility to 'none'
            },
            paint: {
                // Define circle color, size, etc.
                'circle-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'greenhouse_gas_emissions'],
                    0, '#d9ef8b',
                    10, '#a6d96a',
                    100, '#66bd63',
                    500, '#1a9850',
                    1000, '#006837'
                  ],
                  'circle-radius': 5,
            },
            'filter': ['>', ['get', 'greenhouse_gas_emissions'], 0] // This line ensures that only points with GHG emissions data are displayed
        });

        // Add the global power plants dataset
        map.addSource('power-plants', {
            type: 'geojson',
            data: 'modified_power_plant_data.geojson'
        });
        // Add a new layer to the map to display the data from the GeoJSON source.
        map.addLayer({
            id: 'power-plants', // Unique ID for the layer.
            type: 'circle', // Specify that the layer is of type 'circle' to represent points on the map.
            source: 'power-plants', // Reference the source of data for this layer.
            paint: {
                // Adjust circle radius based on zoom level and capacity
                'circle-radius': [
                    // Dynamic scaling of circle radius
                    'interpolate', ['linear'], ['zoom'],
                    // At zoom level 0
                    0, ['step',
                        ['get', 'capacity_mw'],
                        1, // Base size
                        1000, 1.9, // Size increases at 1000 MW
                        5000, 5.5, // Size increases at 5000 MW
                        10000, 10 // Size increases at 10000 MW
                    ],
                    // At zoom level 15, increase circle radius
                    15, ['step',
                        ['get', 'capacity_mw'],
                        10, // Base size
                        1000, 14, // Size increases at 1000 MW
                        5000, 30, // Size increases at 5000 MW
                        10000, 50 // 10000 MW
                    ]
                ],

                // Set the color of each power plant fuel type (markers)
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
                    'Petcoke', '#d4d4d4',
                    'Wave and Tidal', '#0000CD',
                    /* default */ '#FFFFFF'
                ],
            }
        });

        // Add a hover effect for country centroids
        map.on('mouseenter', 'emissions', function(e) {
            // Change the cursor style.
            map.getCanvas().style.cursor = 'pointer';

            // Extract coordinates from the feature.
            var coordinates = e.features[0].geometry.coordinates.slice();

            // Extract properties from the feature.
            var properties = e.features[0].properties;
            var country = properties.COUNTRY;
            var greenhouseGasEmissions = properties.greenhouse_gas_emissions.toFixed(2); // Formatting number to two decimal places
            var electricityDemand = properties.electricity_demand.toFixed(2);
            var electricityGeneration = properties.electricity_generation.toFixed(2);

            // Ensure the popup appears over the correct feature when the map is zoomed out.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Set content for the popup.
            var popupContent = `<strong>${country}</strong><br>` +
                            `<strong>GHG Emissions:</strong> ${greenhouseGasEmissions} MtCO2e<br>` +
                            `<strong>Electricity Demand:</strong> ${electricityDemand} TWh<br>` +
                            `<strong>Electricity Generation:</strong> ${electricityGeneration} TWh`;

            // Set the content and location of the popup, then add it to the map.
            popup.setLngLat(coordinates)
                .setHTML(popupContent)
                .addTo(map);
        });

        // Add a 'mouseleave' event to reset cursor style
        map.on('mouseleave', 'emissions', function() {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

        // Add a hover effect when mousing over a power plant point to: 1. (By changing the cursor style) indicate each marker as a clickable point, and 2. Show (as a popup) the name of each power plant, country and owner (if applicable)
        map.on('mouseenter', 'power-plants', function(e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var name = e.features[0].properties.name;
            var capacity = e.features[0].properties.capacity_mw;
            var owner = e.features[0].properties.owner;
            
            // Change the cursor style.
            map.getCanvas().style.cursor = 'pointer';

            // Ensure that if the map is zoomed out such that multiple copies of the feature are visible, the popup appears over the correct one.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Set content for popup
            var popupContent = `<strong>${name}</strong> <br><strong>Capacity:</strong> ${capacity} MW`;
            
            // Add owner information only if it exists
            if (owner && owner.trim() !== '') {
                popupContent += `<br><strong>Owner:</strong> ${owner}`;
            }

            // Set the content and location of the popup, then add it to the map.
            popup
                .setLngLat(coordinates)
                .setHTML(popupContent) // Set the popup content
                .addTo(map);
        });
        
        // Remove hover effect when no longer over a point
        map.on('mouseleave', 'power-plants', function() {
            map.getCanvas().style.cursor = '';
            popup.remove(); // Remove the popup
        });        
        
        // Add click event to open a sidebar containing more detailed information on each power plant
        map.on('click', 'power-plants', function(e) {
            var properties = e.features[0].properties;
            var generationDataContent = '';
            var estimatedGenerationDataContent = '';
            
            // Check for generation data to only display headers if data is available for that power plant
            if (properties.generation_gwh_2014 ||
                properties.generation_gwh_2015 ||
                properties.generation_gwh_2016 ||
                properties.generation_gwh_2017 ||
                properties.generation_gwh_2018 ||
                properties.generation_gwh_2019) {
                
                // Populate generation data to be added to sidebar content
                generationDataContent = `
                    <h3>Generation Data:</h3>
                    ${properties.generation_gwh_2014 ? `<p><strong>2014:</strong> ${properties.generation_gwh_2014}</p>` : ''}
                    ${properties.generation_gwh_2015 ? `<p><strong>2015:</strong> ${properties.generation_gwh_2015}</p>` : ''}
                    ${properties.generation_gwh_2016 ? `<p><strong>2016:</strong> ${properties.generation_gwh_2016}</p>` : ''}
                    ${properties.generation_gwh_2017 ? `<p><strong>2017:</strong> ${properties.generation_gwh_2017}</p>` : ''}
                    ${properties.generation_gwh_2018 ? `<p><strong>2018:</strong> ${properties.generation_gwh_2018}</p>` : ''}
                    ${properties.generation_gwh_2019 ? `<p><strong>2019:</strong> ${properties.generation_gwh_2019}</p>` : ''}
                `;
            }
            
            // Check for estimated generation data to only display headers if data is available for that power plant
            if (properties.estimated_generation_gwh_2013 ||
                properties.estimated_generation_gwh_2014 ||
                properties.estimated_generation_gwh_2015 ||
                properties.estimated_generation_gwh_2016 ||
                properties.estimated_generation_gwh_2017) {
                
                // Populate estimated generation data to be added to sidebar content
                estimatedGenerationDataContent = `
                    <h3>Estimated Generation Data:</h3>
                    ${properties.estimated_generation_gwh_2013 ? `<p><strong>2013:</strong> ${properties.estimated_generation_gwh_2013}</p>` : ''}
                    ${properties.estimated_generation_gwh_2014 ? `<p><strong>2014:</strong> ${properties.estimated_generation_gwh_2014} (${properties.estimated_generation_note_2014})</p>` : ''}
                    ${properties.estimated_generation_gwh_2015 ? `<p><strong>2015:</strong> ${properties.estimated_generation_gwh_2015} (${properties.estimated_generation_note_2015})</p>` : ''}
                    ${properties.estimated_generation_gwh_2016 ? `<p><strong>2016:</strong> ${properties.estimated_generation_gwh_2016} (${properties.estimated_generation_note_2016})</p>` : ''}
                    ${properties.estimated_generation_gwh_2017 ? `<p><strong>2017:</strong> ${properties.estimated_generation_gwh_2017} (${properties.estimated_generation_note_2017})</p>` : ''}
                `;
            }

            // Set the content of the sidebar
            var sidebarContent = `
                <h1>${properties.name}</h1>
                ${properties.owner ? `<p><strong>Owner:</strong> ${properties.owner}</p>` : ''}
                <p><strong>Country:</strong> ${properties.country_long} (${properties.country})</p>
                <p><strong>Capacity:</strong> ${properties.capacity_mw} MW</p>
                <p><strong>Primary Fuel:</strong> ${properties.primary_fuel}</p>
                ${properties.other_fuel1 ? `<p><strong>Other Fuel:</strong> ${properties.other_fuel1}</p>` : ''}
                ${properties.other_fuel2 ? `<p><strong>Other Fuel:</strong> ${properties.other_fuel2}</p>` : ''}
                ${properties.other_fuel3 ? `<p><strong>Other Fuel:</strong> ${properties.other_fuel3}</p>` : ''}
                <p><strong>Source:</strong> ${properties.source}</p>
                ${properties.commissioning_year ? `<p><strong>Commissioning Year:</strong> ${parseInt(properties.commissioning_year)}</p>` : ''}
                ${generationDataContent}
                ${estimatedGenerationDataContent}
                ${properties.url ? `<p><a href="${properties.url}" target="_blank">More Details</a></p>` : ''}
            `;

            // Update the sidebar element to display the sidebarContent of the clicked powerplant and move the sidebar into the display by updating its classList  to sidebar.visible
            document.getElementById('sidebar').innerHTML = sidebarContent;
            document.getElementById('sidebar').classList.add('visible');
        });
        
        // Close the sidebar when clicking anywhere on the map outside of points
        map.on('click', function(e) {
            if (!map.queryRenderedFeatures(e.point, { layers: ['power-plants'] }).length) { // If there are no features present at the point where the click event occured
                document.getElementById('sidebar').classList.remove('visible'); // Update sidebar classList to default to remove the sidebar from the display
            }
        });

        // Get the select all checkbox
        const selectAllCheckbox = document.getElementById('selectAll');
        // Get all other fuel type checkboxes
        const otherCheckboxes = document.querySelectorAll('#fuel-type-filters .checkboxes input[type="checkbox"]:not(#selectAll)');

        // Add an event listener to the "Select All" checkbox for the "change" event
        selectAllCheckbox.addEventListener('change', function () {
            // Iterate through all other checkboxes and set their checked status to match the "Select All" checkbox
            otherCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            // Update the map display based on the current selection of checkboxes
            updateMapBasedOnFuelType();
        });

        // Add change event listeners to all other checkboxes to handle individual selections
        otherCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                // If any checkbox is unchecked, uncheck the "Select All" checkbox
                if (!this.checked) {
                    selectAllCheckbox.checked = false;
                } else {
                    // If all checkboxes are checked, check the "Select All" checkbox
                    const allChecked = Array.from(otherCheckboxes).every(cb => cb.checked);
                    selectAllCheckbox.checked = allChecked;
                }
                // Update the map display based on the current selection of checkboxes
                updateMapBasedOnFuelType();
            });
        });
        
        // Define the function that updates the map display based on selected fuel types and filter options
        function updateMapBasedOnFuelType() {
            // Collect the IDs of all checked checkboxes to determine the selected fuel types
            const selectedFuelTypes = Array.from(document.querySelectorAll('#fuel-type-filters input[type="checkbox"]:checked')).map(checkbox => checkbox.id);
            // Determine whether primary and/or secondary fuel source filters are checked
            const filterPrimary = document.getElementById('filterPrimary').checked;
            const filterSecondary = document.getElementById('filterSecondary').checked;
            
            // Check if any fuel types are selected
            if (selectedFuelTypes.length > 0) {
                let filters = ['any']; // Start with an 'any' filter to combine multiple conditions
                
                // Add filter conditions for each selected fuel type based on the primary/secondary filter options
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
                
                // Apply the constructed filter to the 'power-plants' layer to update the map display
                map.setFilter('power-plants', filters);
            } else {
                // If no checkboxes are selected, apply a filter that matches no features to hide all points
                map.setFilter('power-plants', ['==', ['get', 'primary_fuel'], 'none']);
            }
        }

        // Update the map based on the default filter settings
        updateMapBasedOnFuelType();

        // Attach change event listeners to all checkboxes to update the map whenever any filter option changes
        document.querySelectorAll('#fuel-type-filters input[type="checkbox"], .filter-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateMapBasedOnFuelType);
        });       
        
        // Add functionality to the capacity slider to filter map points based on their capacity
        document.getElementById('capacity-slider').addEventListener('input', function(e) {
            // Get the slider value and update the displayed capacity value
            const capacityValue = parseFloat(e.target.value);
            document.getElementById('capacity-value').textContent = capacityValue;
            // Apply a filter to the 'power-plants' layer to show only points with a capacity greater than or equal to the slider value
            map.setFilter('power-plants', ['>=', ['get', 'capacity_mw'], capacityValue]);
        });
        
        // Create the "Countries" button
        const emissionsLink = document.createElement('a');
        // Set the text of the countries layer button
        emissionsLink.textContent = 'Countries';
        // Set the initial class as empty
        emissionsLink.className = '';

        // Toggle the emissions layer when the countries button is clicked
        emissionsLink.onclick = function (e) {
            // Check if the emissions layer is visible or not and either set the emissionsLink class value to 'active' or to ' '.
            if (map.getLayoutProperty('emissions', 'visibility') === 'visible') {
                // Set the emissions visability to 'none' to hide the emissions layer
                map.setLayoutProperty('emissions', 'visibility', 'none');
                // If the layer is showing, set the button to ' '
                emissionsLink.className = '';
                document.getElementById('ghgLegend').style.display = 'none'; // Hide the GHG legend
            } else {
                // Set the emissions visability to 'visible' to display the emissions layer
                map.setLayoutProperty('emissions', 'visibility', 'visible');
                // If not showing, set the button to 'active'
                emissionsLink.className = 'active';
                document.getElementById('ghgLegend').style.display = 'block'; // Show the GHG legend
            }
        };
        
        // Append the "GHG Emissions" button to the menu
        document.getElementById('menu').appendChild(emissionsLink);

        // Create the "Filters" button
        const toggleFilters = document.createElement('button');
        // Set the text of the filters button
        toggleFilters.textContent = 'Filters';

        //Set the initial class as active as the filters panel is on during initial map load
        toggleFilters.className = 'active';
        
        // Toggle the filters panel when the filters button is clicked
        toggleFilters.onclick = function() {
            // Check if the filters panel is being displayed
            if (document.getElementById('fuel-type-filters').style.display === "none" || document.getElementById('fuel-type-filters').style.display === "") {
                // If the panel is not showing, display it and set the button to 'active'
                document.getElementById('fuel-type-filters').style.display = "block";
                // Set the class to active to indicate the filters panel is currently being shown
                toggleFilters.className = 'active';
            } else {
                // If the panel is showing, hide it and remove 'active' class
                document.getElementById('fuel-type-filters').style.display = "none";
                toggleFilters.className = ''; // Sets className to an empty string, indicating inactive
            }
        };

        // Append the "Filters" button to the menu
        document.getElementById('menu').appendChild(toggleFilters);
    });
});
