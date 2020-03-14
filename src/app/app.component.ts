import { Component, OnInit } from '@angular/core';

import './components/icons/ukis';

import { AlertService, IAlert } from './components/global-alert/alert.service';
import { ProgressService, IProgress } from './components/global-progress/progress.service';


import { LayersService } from '@dlr-eoc/services-layers';
import { MapStateService } from '@dlr-eoc/services-map-state';
import { IMapControls } from '@dlr-eoc/map-ol';

import { getData, createLayers, styleVector } from './map-utils';

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

  vectorOlLayer: any;
  csvData: any;
  public timeValue: string;

  public range = {
    min: 0,
    max: 30,
    step: 1,
    value: 10
  }

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
    getData().then(data => {
      this.csvData = data;
      const layers = createLayers(data);
      layers.map(l => {
        if (l.id === 'world_map_json') {
          this.vectorOlLayer = l.custom_layer;
          console.log(this.vectorOlLayer)
          this.vectorOlLayer.setStyle(this.style);
        }
        this.layerSvc.addLayer(l, 'Layers')
      });

      this.range.max = data.daterage.count -1;
      this.range.step = 1;
      this.range.value = 0;
      this.timeValue = Object.keys(data.dates)[this.range.value];

      this.title = `coronavirus cases on ${this.timeValue}`
    })

  }

  style = (feature, resolution) => {
    return styleVector(feature, resolution, this.csvData, this.range.value)
  }

  public rangeChange(event) {
    // change date
    this.range.value = event.target.value;
    this.timeValue = Object.keys(this.csvData.dates)[this.range.value];
    this.title = `coronavirus cases on ${this.timeValue}`

    if (this.vectorOlLayer) {
      this.vectorOlLayer.setStyle(this.style)
    }
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
