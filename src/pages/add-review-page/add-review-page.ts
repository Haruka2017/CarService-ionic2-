import { Component, Injector } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Review } from '../../providers/review-service';
import { BasePage } from '../base-page/base-page';

@Component({
  selector: 'page-add-review-page',
  templateUrl: 'add-review-page.html'
})
export class AddReviewPage extends BasePage {

  review: any = {
    rating: 3,
    comment: ''
  };

  constructor(injector: Injector, private viewCtrl: ViewController) {
    super(injector);
    this.review.place = this.navParams.get('place');
  }

  enableMenuSwipe() {
    return false;
  }

  ionViewDidLoad() {
  }

  onSubmit() {

    this.showLoadingView();

    Review.create(this.review).then(review => {
      this.showContentView();
      this.onDismiss();
      this.translate.get('REVIEW_ADDED').subscribe(str => this.showToast(str));
    }, error => {
      this.showErrorView();
      this.translate.get('ERROR_REVIEW_ADD').subscribe(str => this.showToast(str));
    });
  }

  onDismiss() {
    this.viewCtrl.dismiss();
  }

}
