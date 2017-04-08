import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController, ToastController, Events } from 'ionic-angular';
import { GoogleAnalytics, StatusBar, Splashscreen } from 'ionic-native';
import Parse from 'parse';
import { TranslateService } from 'ng2-translate';
import { AppConfig } from './app.config';

import { User } from '../providers/user-service';
import { LocalStorage } from '../providers/local-storage';
import { Preference } from '../providers/preference';

import { WalkthroughPage } from '../pages/walkthrough-page/walkthrough-page';
import { AddPlacePage } from '../pages/add-place-page/add-place-page';
import { CategoriesPage } from '../pages/categories/categories';
import { SettingsPage } from '../pages/settings-page/settings-page';
import { MapPage } from '../pages/map-page/map-page';
import { FavoritesPage } from '../pages/favorites-page/favorites-page';
import { SignInPage } from '../pages/sign-in-page/sign-in-page';
import { ProfilePage } from '../pages/profile-page/profile-page';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  user: User;
  trans: any;

  pages: Array<{ title: string, icon: string, component: any }>;

  constructor(public platform: Platform,
    private events: Events,
    private storage: LocalStorage,
    private translate: TranslateService,
    private toastCtrl: ToastController,
    private preference: Preference,
    private modalCtrl: ModalController) {

    this.initializeApp();
  }

  onMenuOpened() {
    this.events.publish('onMenuOpened');
  }

  onMenuClosed() {
    this.events.publish('onMenuClosed');
  }

  buildMenu() {

    let trans = ['MAP', 'CATEGORIES', 'ADD_PLACE', 'MY_FAVORITES',
    'SETTINGS', 'LOGOUT', 'LOGGED_OUT', 'PROFILE'];

    this.translate.get(trans).subscribe(values => {

      this.trans = values;

      this.pages = [
        { title: values.MAP, icon: 'map', component: MapPage },
        { title: values.CATEGORIES, icon: 'pricetag', component: CategoriesPage},
        { title: values.ADD_PLACE, icon: 'create', component: AddPlacePage },
        { title: values.MY_FAVORITES, icon: 'heart', component: FavoritesPage },
        { title: values.SETTINGS, icon: 'settings', component: SettingsPage },
      ];

      if (User.getCurrentUser()) {
        this.pages.push({ title: values.PROFILE, icon: 'contact', component: ProfilePage })
        this.pages.push({ title: values.LOGOUT, icon: 'exit', component: null })
      }

    });
  }

  initializeApp() {

    this.events.subscribe('user:login', (userEventData) => {
      this.user = userEventData[0];
      this.buildMenu();
    });

    this.events.subscribe('lang:change', (e) => {
      this.buildMenu();
    });

    this.translate.setDefaultLang(AppConfig.DEFAULT_LANG);


    this.storage.lang.then(val => {

      let lang = val || AppConfig.DEFAULT_LANG;

      this.translate.use(lang);
      this.storage.lang = lang;
      this.preference.lang = lang;

      this.storage.skipIntroPage.then((skipIntroPage) => {
        this.rootPage = skipIntroPage ? MapPage : WalkthroughPage;
      });

      this.buildMenu();
    });

    this.storage.unit.then(val => {
      let unit = val || AppConfig.DEFAULT_UNIT;

      this.storage.unit = unit;
      this.preference.unit = unit;
    });

    this.storage.mapStyle.then(val => {

      let mapStyle = val || AppConfig.DEFAULT_MAP_STYLE;

      this.storage.mapStyle = mapStyle;
      this.preference.mapStyle = mapStyle;
    });

    Parse.serverURL = AppConfig.SERVER_URL;
    Parse.initialize(AppConfig.APP_ID);

    User.getInstance();
    this.user = User.getCurrentUser();

    if (this.user) {
      this.user.fetch();
    }

    this.platform.ready().then(() => {

      GoogleAnalytics.startTrackerWithId(AppConfig.TRACKING_ID);
      GoogleAnalytics.trackEvent('', 'App opened');
      GoogleAnalytics.debugMode();
      GoogleAnalytics.enableUncaughtExceptionReporting(true);

      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  openPage(page) {

    if ((page.component === FavoritesPage || page.component === AddPlacePage) && !User.getCurrentUser()) {

      let modal = this.modalCtrl.create(SignInPage);
      modal.present();

    } else if (page.component === null && User.getCurrentUser()) {

      User.logout().then(success => {

        let toast = this.toastCtrl.create({
          message: this.trans.LOGGED_OUT,
          duration: 3000
        });

        toast.present();

        this.buildMenu();
      });

    } else {
      this.nav.setRoot(page.component);
    }
  }
}
