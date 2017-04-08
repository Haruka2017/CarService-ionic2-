import { Component, Injector } from '@angular/core';
import { Place } from '../../providers/place-service';
import { BasePage } from '../base-page/base-page';
import { PlaceDetailPage } from '../place-detail-page/place-detail-page';

@Component({
  selector: 'page-favorites-page',
  templateUrl: 'favorites-page.html'
})
export class FavoritesPage extends BasePage {

  params: any = {};
  places: any = [];

  constructor(injector: Injector) {
    super(injector);

    this.showLoadingView();
    this.onReload();
  }

  enableMenuSwipe() {
    return true;
  }

  goToPlace(place) {
    this.navigateTo(PlaceDetailPage, place);
  }

  loadData() {

    Place.loadFavorites(this.params).then(data => {

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

  onLoadMore(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;
    this.params.page++;
    this.loadData();
  }

  onReload(refresher = null) {
    this.refresher = refresher;
    this.places = [];
    this.params.page = 0;
    this.loadData();
  }

}
