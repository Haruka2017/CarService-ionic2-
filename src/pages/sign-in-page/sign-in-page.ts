import { Component, Injector } from '@angular/core';
import { ViewController, Events } from 'ionic-angular';
import { BasePage } from '../base-page/base-page';
import { SignUpPage } from '../sign-up-page/sign-up-page';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { User } from '../../providers/user-service';

@Component({
  selector: 'page-sign-in-page',
  templateUrl: 'sign-in-page.html'
})
export class SignInPage extends BasePage {

  form: FormGroup;
  trans: any;

  constructor(injector: Injector,
    private formBuilder: FormBuilder,
    private events: Events,
    private viewCtrl: ViewController) {

    super(injector);

    this.form = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    let trans = ['LOGGED_IN_AS', 'INVALID_CREDENTIALS', 'ERROR_UNKNOWN'];

    this.translate.get(trans).subscribe(values => {
      this.trans = values;
    });

    this.events.subscribe('user:login', (userEventData) => {
      this.onCancel();
    });
  }

  enableMenuSwipe() {
    return false;
  }

  ionViewDidLoad() {
  }

  onCancel() {
    this.viewCtrl.dismiss();
  }

  onSubmit() {

    this.showLoadingView();

    User.signIn(this.form.value).then(user => {
      this.showContentView();
      this.showToast(`${ this.trans.LOGGED_IN_AS } ${ user.get('email') }`);
      this.events.publish('user:login', user);
    }, error => {

      if (error.code === 101) {
        this.showToast(this.trans.INVALID_CREDENTIALS);
      } else {
        this.showToast(this.trans.ERROR_UNKNOWN);
      }
      this.showErrorView();
    });
  }

  goToSignUp() {
    this.navigateTo(SignUpPage);
  }

}
