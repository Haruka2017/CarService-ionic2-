import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { LocalStorage } from '../../providers/local-storage';
import { TranslateService } from 'ng2-translate';
import { WalkthroughPage } from '../../pages/walkthrough-page/walkthrough-page';

@Component({
  selector: 'page-settings-page',
  templateUrl: 'settings-page.html'
})
export class SettingsPage {

  settings: any = {};
  storage: LocalStorage;
  translate: TranslateService;
  navCtrl: NavController;
  events: Events;

  constructor(localStorage: LocalStorage,
    translate: TranslateService,
    events: Events,
    navCtrl: NavController) {

    this.storage = localStorage;
    this.translate = translate;
    this.navCtrl = navCtrl;
    this.events = events;

    this.storage.unit.then(unit => this.settings.unit = unit);
    this.storage.mapStyle.then(mapStyle => this.settings.mapStyle = mapStyle);
    this.storage.distance.then(distance => this.settings.distance = distance);
    this.storage.lang.then(lang => this.settings.lang = lang);
  }

  ionViewDidLoad() {

  }

  onChangeUnit() {
    this.storage.unit = this.settings.unit;
  }

  onChangeMapStyle() {
    this.storage.mapStyle = this.settings.mapStyle;
  }

  onChangeDistance() {
    this.storage.distance = this.settings.distance;
  }

  onChangeLang() {
    if (this.settings.lang) {
      this.storage.lang = this.settings.lang;
      this.translate.use(this.settings.lang);
      this.events.publish('lang:change');
    }
  }

  goToWalkthrough() {
    this.navCtrl.push(WalkthroughPage);
  }

}
