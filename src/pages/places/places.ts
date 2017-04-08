import { Component, Injector } from '@angular/core';
import { Place } from '../../providers/place-service';
import { Preference } from '../../providers/preference';
import { Category } from '../../providers/categories';
import { PlaceDetailPage } from '../place-detail-page/place-detail-page';
import { Geolocation } from 'ionic-native';
import { BasePage } from '../base-page/base-page';
import { AppConfig } from '../../app/app.config';
import { AdMob } from 'ionic-native';

@Component({
  selector: 'page-places',
  templateUrl: 'places.html'
})
export class PlacesPage extends BasePage {

  params: any = {};
  places: Place[];
  category: Category;

  constructor(injector: Injector, private preference: Preference) {
    super(injector);

    this.params.category = this.navParams.data;
    this.params.filter = 'nearby';
    this.params.unit = this.preference.unit;

    this.showLoadingView();
    this.onReload();

    AdMob.createBanner({
      adId: AppConfig.BANNER_ID,
      autoShow: true,
    });
  }

  enableMenuSwipe() {
    return false;
  }

  goToPlace(place) {
    this.navigateTo(PlaceDetailPage, place);
  }

  loadData() {

    Place.load(this.params).then(data => {

      for (let place of data) {
        this.places.push(place);
      }

      this.onRefreshComplete(data);

      if (this.places.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }

    }, error => {
      this.onRefreshComplete();
      this.showErrorView();
    });
  }

  onFilter(filter) {
    this.params.filter = filter;
    this.showLoadingView();
    this.onReload();
  }

  onLoadMore(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;
    this.params.page++;
    this.loadData();
  }

  onReload(refresher = null) {

    this.refresher = refresher;

    this.places = [];
    this.params.page = 0;

    if (this.params.filter === 'nearby') {

      Geolocation.getCurrentPosition().then(pos => {
        this.params.location = pos.coords;
        this.loadData();
      }, error => {
        this.showErrorView();
        this.translate.get('ERROR_LOCATION_UNAVAILABLE').subscribe(res => this.showToast(res));
      });

    } else {
      this.params.location = null;
      this.loadData();
    }
  }

}
