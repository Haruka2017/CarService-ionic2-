import { Component, Injector } from '@angular/core';
import { Review } from '../../providers/review-service';
import { BasePage } from '../base-page/base-page';

@Component({
  selector: 'page-reviews-page',
  templateUrl: 'reviews-page.html'
})
export class ReviewsPage extends BasePage {

  reviews: any;
  private params: any = {};

  constructor(injector: Injector) {
    super(injector);
    this.params.place = this.navParams.data;
  }

  enableMenuSwipe() {
    return false;
  }

  ionViewDidLoad() {
    this.showLoadingView();
    this.onReload();
  }

  loadData() {
    Review.load(this.params).then(reviews => {
      this.reviews = reviews;

      if (this.reviews.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }

      this.onRefreshComplete(reviews);

    }, error => {
      this.showErrorView();
      this.onRefreshComplete();
    });
  }

  onLoadMore(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;
    this.params.page++;
    this.loadData();
  }

  onReload(refresher = null) {
    this.refresher = refresher;
    this.reviews = [];
    this.params.page = 0;
    this.loadData();
  }

}
