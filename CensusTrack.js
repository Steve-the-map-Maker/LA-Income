console.log("coming from CensusTrack.js!!");

let incomeDataByTract = {}; // Global object to hold income data

async function fetchLACensusTracts() {
    const queryURL = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/8/query?where=STATE='06' AND (COUNTY='037' OR COUNTY='059')&outFields=*&outSR=4326&f=geojson";

    try {
        const response = await fetch(queryURL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Ensure the income data is fetched before proceeding
        incomeDataByTract = await fetchACSIncomeData();

        // Prepare the enriched GeoJSON with median income data
        const dataWithIncome = {
            ...data,
            features: data.features.map(feature => ({
                ...feature,
                properties: {
                    ...feature.properties,
                    medianIncome: incomeDataByTract[
                        `${feature.properties.STATE.padStart(2, '0')}${feature.properties.COUNTY.padStart(3, '0')}${feature.properties.TRACT.padStart(6, '0')}`
                    ]?.medianIncome || 0,
                }
            }))
        };

        // Initialize or update the map source with enriched data
        if (!map.getSource("la-oc-census-tracts")) {
            map.addSource("la-oc-census-tracts", {
                type: "geojson",
                data: dataWithIncome
            });
        } else {
            map.getSource("la-oc-census-tracts").setData(dataWithIncome);
        }

        // Define or update the layer styling for income data visualization
        if (!map.getLayer("la-oc-census-tracts-layer")) {
            map.addLayer({
                id: "la-oc-census-tracts-layer",
                type: "fill",
                source: "la-oc-census-tracts",
                paint: {
                    "fill-color": [
                        "interpolate",
                        ["linear"],
                        ["get", "medianIncome"],
                        0, "#808080",  // Less than 30,000
                        30000, "#a1d99b",  // 30,000 to 59,999
                        60000, "#74c476",  // 60,000 to 89,999
                        90000, "#41ab5d",  // 90,000 to 119,999
                        120000, "#238b45",  // 120,000 to 149,999
                        150000, "#005a32"  // 150,000 and more
                    ],
                    "fill-opacity": 0.75,
                    "fill-outline-color": "#000000"
                }
            });
        }

        // Add click handler to display income data
        map.on("click", "la-oc-census-tracts-layer", function (e) {
            if (e.features.length > 0) {
                const tractID = e.features[0].properties.TRACT;
                const incomeData = e.features[0].properties.medianIncome;
                const incomeMessage = incomeData > 0 ? `Median Income: $${incomeData}` : "Income data not available";
                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`<strong>Census Tract ID:</strong> ${tractID}<br>${incomeMessage}`)
                    .addTo(map);
            }
        });

    } catch (error) {
        console.error("Error fetching LA and Orange County metro census tracts:", error);
    }
}

// This ensures that the map and income data are ready before fetching tracts
map.on("load", async function () {
    try {
        // Fetch income data first and store it globally or pass it to the tract fetching function
        const incomeDataByTract = await fetchACSIncomeData();  // Ensure this is completed and fetch the income data
        await fetchLACensusTracts();  // Now, fetch the tracts and enrich them with income data
        
        // After both datasets are ready, draw the histogram
        drawIncomeHistogram(incomeDataByTract);
    } catch (error) {
        console.error("Error in map loading or income data fetching:", error);
    }
});
