mapboxgl.accessToken = 'pk.eyJ1Ijoiam9uYXRoYW53ZXN0YmVycnkiLCJhIjoiY2x0OWR4Z3k4MGg2dTJpcDlwc2o0ZXFvayJ9.Muok1VdFLcaVekq6lWlzrA';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [0, 0],
            zoom: 1
        });
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('visible');
            // Resize the map to adjust to the sidebar's new state.
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
                    'circle-radius': 4,
                    'circle-color': [
                        'match',
                        ['get', 'primary_fuel'],
                        'Hydro', '#0000CD',
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
                        'Wave and Tidal', '#00FFFF',
                        /* default */ '#FFFFFF'
                    ],
                }
            });
        });

        map.on('mouseenter', 'plant-points', function() {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'plant-points', function() {
            map.getCanvas().style.cursor = '';
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
        document.getElementById('fuel-type-selector').addEventListener('change', function() {
            var selectedFuel = this.value;

            if (selectedFuel === 'all') {
                map.setFilter('plant-points', null); // Show all features
            } else {
                map.setFilter('plant-points', ['any',
                    ['==', ['get', 'primary_fuel'], selectedFuel],
                    ['==', ['get', 'other_fuel1'], selectedFuel],
                    ['==', ['get', 'other_fuel2'], selectedFuel],
                    ['==', ['get', 'other_fuel3'], selectedFuel]
                ]);
            }
        });
        document.getElementById('capacity-slider').addEventListener('input', function(e) {
            const capacityValue = parseFloat(e.target.value);
            document.getElementById('capacity-value').textContent = capacityValue;
            map.setFilter('plant-points', ['>=', ['get', 'capacity_mw'], capacityValue]);
        });