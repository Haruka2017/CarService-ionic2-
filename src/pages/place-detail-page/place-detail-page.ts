import { Component, Injector} from '@angular/core';
import { ModalController, Events } from 'ionic-angular';
import { Place } from '../../providers/place-service';
import { Preference } from '../../providers/preference';
import { LocalStorage } from '../../providers/local-storage';
import { CallNumber, Geolocation, InAppBrowser, LaunchNavigator, SocialSharing } from 'ionic-native';
import { ReviewsPage } from '../reviews-page/reviews-page';
import { AddReviewPage } from '../add-review-page/add-review-page';
import { BasePage } from '../base-page/base-page';
import { User } from '../../providers/user-service';
import { SignInPage } from '../sign-in-page/sign-in-page';

@Component({
  selector: 'page-place-detail-page',
  templateUrl: 'place-detail-page.html'
})
export class PlaceDetailPage extends BasePage {

  images: Array<any>;
  place: Place;
  location: any;
  unit: any;

  constructor(injector: Injector,
    private modalCtrl: ModalController,
    private storage: LocalStorage,
    private preference: Preference,
    private events: Events) {

      super(injector);

      Geolocation.getCurrentPosition().then(pos => {
        this.location = pos.coords;
      });

      this.place = this.navParams.data;
      this.unit = preference.unit;
      this.images = [];

      if (this.place.image) {
        this.images.push(this.place.image);
      }

      if (this.place.imageTwo) {
        this.images.push(this.place.imageTwo);
      }

      if (this.place.imageThree) {
        this.images.push(this.place.imageThree);
      }

      if (this.place.imageFour) {
        this.images.push(this.place.imageFour);
      }
  }

  enableMenuSwipe() {
    return false;
  }

  ionViewDidLoad() {}

  openSignUpModal() {
    let modal = this.modalCtrl.create(SignInPage);
    modal.present();
  }

  openAddReviewModal() {
    let modal = this.modalCtrl.create(AddReviewPage, { place: this.place });
    modal.present();
  }

  onLike () {

    if (User.getCurrentUser()) {
      Place.like(this.place);
      this.showToast('Liked');
    } else {
      this.openSignUpModal();
    }
  }

  onRate () {
    if (User.getCurrentUser()) {
      this.openAddReviewModal();
    } else {
      this.openSignUpModal();
    }
  }

  onShare () {
    SocialSharing.share(this.place.title, null, null, this.place.website);
  }

  onCall () {
    CallNumber.callNumber(this.place.phone, true)
  }

  openUrl () {
    new InAppBrowser(this.place.website, '_system');
  }

  goToMap() {
    LaunchNavigator.navigate([ this.place.location.latitude, this.place.location.latitude ], {
      start: [this.location.latitude, this.location.longitude]
    });
  }

  goToReviews() {
    this.navigateTo(ReviewsPage, this.place);
  }

}
