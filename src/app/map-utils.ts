import { ICsvData } from 'scripts/globals';
import olTopoJSON from 'ol/format/TopoJSON';
import olVectorSource from 'ol/source/Vector';
import { VectorImage as olVectorImageLayer, Tile as olTilelayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { Fill as olFill, Stroke as olStroke, Style as olStyle } from 'ol/style';
import { LayersService, CustomLayer } from '@dlr-eoc/services-layers';


export function getColor(value: number) {

    let color = '#ffffff';
    if (value > 0 && value <= 10) {
        color = '#fff5f0';

    }
    else if (value > 10 && value <= 50) {
        color = '#fee0d2';

    }
    else if (value > 50 && value <= 100) {
        color = '#cb181d';

    }
    else if (value > 100 && value <= 300) {
        color = '#fcbba1';

    }
    else if (value > 300 && value <= 600) {
        color = '#fc9272';

    }
    else if (value > 600 && value <= 1200) {
        color = '#ef3b2c';
    }
    else if (value > 1200 && value <= 2400) {
        color = '#fb6a4a';
    }
    else if (value > 2400 && value <= 4800) {
        color = '#a50f15';
    }
    else if (value > 4800) {

        color = '#67000d';
    }

    return color;
}

export async function getData() {
    /* const vectors = await fetch('assets/data/world-countries.json').then((response) => {
        return response.json();
    }) */
    // const _locations = vectors.objects.countries1.geometries.map(item => item.properties.name);

    const coronaData: ICsvData = await fetch('assets/data/coronavirus-source-data.json').then((response) => {
        return response.json();
    })

    /** not in world-countries to smale */
    const mappings = {
        "Andorra": "Spain - France ---",
        "Bahrain": 'Saudi Arabia ---',
        "Cote d'Ivoire": "Ivory Coast",
        "Democratic Republic of Congo": "Democratic Republic of the Congo",
        "Faeroe Islands": " ---",
        "French Polynesia": " ---",
        "Gibraltar": "Spain ---",
        "Guernsey": "France ---"
    }

    return coronaData;
}

export const styleVector = (feature, resolution, data: ICsvData, dateIndex: number) => {
    const dates = Object.keys(data.dates);
    const date = dates[dateIndex];
    const locations = data.locations;

    const name = feature.get('name');
    if (locations[name]) {
        const locationIndex = locations[name];
        // console.log(data.dates[date], locationIndex)
        const loc = data.dates[date][locationIndex];

        if (loc) {
            feature.set('total_cases', loc.total_cases || null);
            return new olStyle({
                fill: new olFill({
                    color: getColor(loc.total_cases)
                }),
                stroke: new olStroke({
                    color: '#319FD3',
                    width: 1
                })
            })
        } else {
            return new olStyle({
                fill: new olFill({
                    color: 'rgba(0, 0, 0, 0.6)'
                }),
                stroke: new olStroke({
                    color: '#319FD3',
                    width: 1
                })
            })
        }

    } else {
        return new olStyle({
            fill: new olFill({
                color: 'rgba(0, 0, 0, 0.6)'
            }),
            stroke: new olStroke({
                color: '#319FD3',
                width: 1
            })
        })
    }
}




export function createLayers(data: ICsvData) {
    const olJsonLayer = new olVectorImageLayer({
        source: new olVectorSource({
            url: 'assets/data/world-countries.json',
            format: new olTopoJSON({
                // don't want to render the full world polygon (stored as 'land' layer),
                // which repeats all countries
                layers: ['countries1']
            }),
            overlaps: false,
            wrapX: false,
            attributions: [`vector data from <a href='https://github.com/deldersveld/topojson'>deldersveld</a>`]
        })
    });

    const layers = [
        /* new CustomLayer({
            name: 'osm',
            id: 'osm_tile',
            visible: true,
            type: 'custom',
            // continuousWorld :false, // not working??
            custom_layer: new olTilelayer({
                source: new OSM({
                    // wrapX: false
                })
            })
        }), */
        new CustomLayer({
            name: 'world map',
            id: 'world_map_json',
            visible: true,
            type: 'custom',
            custom_layer: olJsonLayer,
            // continuousWorld :false, // not working??
            popup: true
        })
    ];

    return layers;
}