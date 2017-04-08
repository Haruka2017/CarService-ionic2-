import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { CategoriesPage } from '../categories/categories';
import { LocalStorage } from '../../providers/local-storage';

@Component({
  selector: 'page-walkthrough-page',
  templateUrl: 'walkthrough-page.html'
})
export class WalkthroughPage {

  private skipIntroPage;

  constructor(public navCtrl: NavController,
    public storage: LocalStorage,
    public menu: MenuController) {

    this.menu.swipeEnable(false);
    this.storage.skipIntroPage.then(skipIntroPage => this.skipIntroPage = skipIntroPage);
  }

  ionViewDidLoad() {
  }

  goToHome() {
    this.skipIntroPage = true;
    this.storage.skipIntroPage = this.skipIntroPage;
    this.navCtrl.setRoot(CategoriesPage);
  }

}
