import { Component, OnInit } from '@angular/core';

import './components/icons/ukis';

import { AlertService, IAlert } from './components/global-alert/alert.service';
import { ProgressService, IProgress } from './components/global-progress/progress.service';


import { LayersService, CustomLayer } from '@dlr-eoc/services-layers';
import { MapStateService } from '@dlr-eoc/services-map-state';
import { IMapControls } from '@dlr-eoc/map-ol';

import olTopoJSON from 'ol/format/TopoJSON';
import olVectorSource from 'ol/source/Vector';
import { Vector as olVectorLayer } from 'ol/layer';
import { Fill as olFill, Stroke as olStroke, Style as olStyle } from 'ol/style';


interface IUi {
  floating: boolean;
  flipped: boolean;
  alert: null | IAlert;
  progress: null | IProgress;
}


interface ILocation {
  'new_cases': number;
  'new_deaths': number;
  'total_cases': number;
  'total_deaths': number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = '';
  shortTitle = '';

  ui: IUi = {
    floating: false,
    flipped: false,
    alert: null,
    progress: null
  };

  controls: IMapControls;

  constructor(
    private alertService: AlertService,
    private progressService: ProgressService,
    public layerSvc: LayersService,
    public mapStateSvc: MapStateService
  ) {
    this.init();
    this.controls = {
      attribution: true
    }

  }

  ngOnInit() {
    this.getData().then(data => {
      this.addlayers(data)
    })

  }

  async getData() {
    const dates = await fetch('assets/data/dates.json').then((response) => {
      return response.json();
    })

    const coronaData = await fetch('assets/data/coronavirus-source-data.json').then((response) => {
      return response.json();
    })
    return {
      dates,
      coronaData
    }
  }


  getColor(value: number) {

    let color = '#ffffff';
    if (value > 10) {

    } else if (value > 20) {
      color = '#67000d'
    }
    else if (value > 40) {
      color = '#a50f15'
    }
    else if (value > 80) {
      color = '#cb181d'
    }
    else if (value > 160) {
      color = '#fb6a4a';
    }
    else if (value > 300) {
      color = '#ef3b2c'
    }
    else if (value > 600) {
      color = '#fc9272';
    }
    else if (value > 900) {
      color = '#fcbba1';
    }
    else if (value > 1200) {
      color = '#fee0d2';
    }
    else if (value > 2000) {
      color = '#fff5f0';
    }

    return color;
  }

  addlayers(data: { dates: string[], coronaData: any }) {

    console.log(this.getColor(50));
    const date = data.dates[data.dates.length - 1];
    const locations = data.coronaData[date];

    let hasLog = false;
    const olJsonLayer = new olVectorLayer({
      source: new olVectorSource({
        url: 'assets/data/world-countries.json',
        format: new olTopoJSON({
          // don't want to render the full world polygon (stored as 'land' layer),
          // which repeats all countries
          layers: ['countries1']
        }),
        overlaps: false,
        attributions: [`vector data from <a href='https://github.com/deldersveld/topojson'>deldersveld</a>`]
      }),
      style: (feature, layer) => {
        /* if (!hasLog) {
          console.log('feature', feature.get('name'));
          console.log('layer', layer)
          hasLog = true;
        } */

        const name = feature.get('name');
        if (locations[name]) {
          const loc: ILocation = locations[name];
          feature.set('total_cases', loc.total_cases || null);

          /* if (!hasLog) {
            console.log(loc);
            hasLog = true;
          } */

          return new olStyle({
            fill: new olFill({
              color: this.getColor(loc.total_cases)
            }),
            stroke: new olStroke({
              color: '#319FD3',
              width: 1
            })
          })
        } else {
          return new olStyle({
            fill: new olFill({
              color: 'rgba(255, 255, 255, 0.6)'
            }),
            stroke: new olStroke({
              color: '#319FD3',
              width: 1
            })
          })
        }


      }
    });

    const layers = [
      new CustomLayer({
        name: 'world map',
        id: 'world_map_json',
        visible: true,
        type: 'custom',
        custom_layer: olJsonLayer,
        popup: true
      })
    ];

    layers.map(l => this.layerSvc.addLayer(l, 'Layers'));
  }

  init() {
    this.getHtmlMeta(['title', 'version', 'description', 'short-title']);

    if (this['TITLE']) {
      this.title = this['TITLE'];
    }
    if (this['SHORT-TITLE']) {
      this.shortTitle = this['SHORT-TITLE'];
    }

    this.alertService.alert$.subscribe((ev) => {
      this.setAlert(ev);
    });

    this.progressService.progress$.subscribe((ev) => {
      this.showProgress(ev);
    });
  }

  showProgress = (progress: IProgress) => {
    this.ui.progress = progress;
  }

  setAlert = (alert: IAlert) => {
    this.ui.alert = alert;
  }

  getHtmlMeta(names: string[]) {
    const ref = document.getElementsByTagName('meta');
    for (let i = 0, len = ref.length; i < len; i++) {
      const meta = ref[i];
      const name = meta.getAttribute('name');
      if (names.includes(name)) {
        this[name.toUpperCase()] = meta.getAttribute('content') || meta.getAttribute('value');
      }
    }
  }
}
