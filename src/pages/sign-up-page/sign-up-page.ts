import { Component, Injector } from '@angular/core';
import { ViewController, Events } from 'ionic-angular';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { BasePage } from '../base-page/base-page';
import { User } from '../../providers/user-service';

@Component({
  selector: 'page-sign-up-page',
  templateUrl: 'sign-up-page.html'
})
export class SignUpPage extends BasePage {

  form: FormGroup;
  trans: any;

  constructor(injector: Injector,
    private formBuilder: FormBuilder,
    private events: Events,
    private viewCtrl: ViewController) {

    super(injector);

    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });

    let trans = ['LOGGED_IN_AS', 'EMAIL_TAKEN', 'ERROR_UNKNOWN'];

    this.translate.get(trans).subscribe(values => {
      this.trans = values;
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

    User.create(this.form.value).then(user => {
      return User.signIn(this.form.value);
    }).then(user => {
      this.showContentView();
      this.showToast(`${ this.trans.LOGGED_IN_AS } ${ user.get('email') }`);
      this.events.publish('user:login', user);
      this.onCancel();
    }, error => {
      this.showErrorView();

      if (error.code === 202 || error.code === 203) {
        this.showToast(this.trans.EMAIL_TAKEN);
      } else {
        this.showToast(this.trans.ERROR_UNKNOWN);
      }
    });
  }

}
