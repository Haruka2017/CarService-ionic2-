import { Component, Injector } from '@angular/core';
import { Platform } from 'ionic-angular';
import { LocationAccuracy, Diagnostic } from 'ionic-native';
import { Category } from '../../providers/categories';
import { PlacesPage } from '../places/places';
import { BasePage } from '../base-page/base-page';

@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html'
})
export class CategoriesPage extends BasePage {

  private categories: Array<Category>;

  constructor(injector: Injector, platform: Platform,) {
    super(injector);

    if (platform.is('cordova')) {

      LocationAccuracy.canRequest().then((canRequest: boolean) => {

        if (canRequest) {

          let priority = LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY;

          LocationAccuracy.request(priority).then(() => console.log('Request successful'),
          (error) => {

            if (error && error.code !== LocationAccuracy.ERROR_USER_DISAGREED) {
              this.translate.get('ERROR_LOCATION_MODE').subscribe((res: string) => {
                this.showConfirm(res).then(() => Diagnostic.switchToLocationSettings());
              });
            }
          });
        }
      });
    } else {
      console.warn('Native: tried calling LocationAccuracy.canRequest, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator');
    }
  }

  enableMenuSwipe() {
    return true;
  }

  ionViewDidLoad() {
    this.showLoadingView();
    this.loadData();
  }

  goToPlaces(category) {
    this.navigateTo(PlacesPage, category);
  }

  loadData() {
    Category.load().then(data => {
      this.categories = data;

      if (this.categories.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }

      this.onRefreshComplete();

    }, error => {
      this.showErrorView();
      this.onRefreshComplete();
    });
  }

  onReload(refresher) {
    this.refresher = refresher;
    this.loadData();
  }

}
