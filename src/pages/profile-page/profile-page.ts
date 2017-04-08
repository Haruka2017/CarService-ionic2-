import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { User } from '../../providers/user-service';
import { EditProfilePage } from '../edit-profile-page/edit-profile-page';

@Component({
  selector: 'page-profile-page',
  templateUrl: 'profile-page.html'
})
export class ProfilePage {

  user: User;
  stats: any = {
    reviews: 0,
    places: 0,
    favorites: 0
  };

  constructor(public navCtrl: NavController, private modalCtrl: ModalController) {
    this.user = User.getCurrentUser();
    User.stats().then(stats => this.stats = stats);
  }

  ionViewDidLoad() {}

  onPresentEditModal() {
    let modal = this.modalCtrl.create(EditProfilePage, { user: this.user });
    modal.onDidDismiss(() => {
      this.user = User.getCurrentUser();
    });
    modal.present();
  }

}
