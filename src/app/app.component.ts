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
import { ICsvData, ICsvItem } from '../../scripts/globals';

interface IUi {
  floating: boolean;
  flipped: boolean;
  alert: null | IAlert;
  progress: null | IProgress;
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
    const coronaData: ICsvData = await fetch('assets/data/coronavirus-source-data.json').then((response) => {
      return response.json();
    })
    return coronaData;
  }


  getColor(value: number) {

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

  addlayers(data: ICsvData) {

    const dates = Object.keys(data.dates);
    const date = dates[dates.length - 1];
    const locations = data.locations;

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
          const locationIndex = locations[name];
          const loc = data.dates[date][locationIndex];
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
