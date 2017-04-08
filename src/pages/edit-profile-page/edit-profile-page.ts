import { Component, Injector } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { User } from '../../providers/user-service';
import { Camera } from 'ionic-native';
import { ParseFile } from '../../providers/parse-file-service';
import { ViewController, ActionSheetController } from 'ionic-angular';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile-page.html'
})
export class EditProfilePage extends BasePage {

  form: FormGroup;
  trans: any;

  constructor(injector: Injector,
    private formBuilder: FormBuilder,
    private actionSheetCtrl: ActionSheetController,
    private viewCtrl: ViewController) {

    super(injector);

    let user = this.navParams.get('user');

    this.form = new FormGroup({
      name: new FormControl(user.get('name'), Validators.required),
      email: new FormControl(user.get('email'), Validators.required),
      password: new FormControl('', Validators.minLength(6)),
      photo: new FormControl(user.get('photo')),
    });

    let trans = ['PROFILE_UPDATED', 'PROFILE_UPDATE_ERROR', 'CAMERA', 'CANCEL',
      'CHOOSE_AN_OPTION', 'PHOTO_LIBRARY', 'FILE_UPLOADED', 'ERROR_FILE_UPLOAD'];

    this.translate.get(trans).subscribe(values => {
      this.trans = values;
    });
  }

  enableMenuSwipe() {
    return true;
  }

  ionViewDidLoad() {}

  onDismiss() {
    this.viewCtrl.dismiss();
  }

  chooseImage(sourceType: number) {

    let options = {
      sourceType: sourceType,
      destinationType: Camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000,
      quality: 80,
    }
    Camera.getPicture(options).then((imageData) => {

      this.showLoadingView();

      ParseFile.upload(imageData).then(file => {
        this.form.controls['image'].value = file;
        this.showContentView();
        this.showToast(this.trans.FILE_UPLOADED);
      }, error => {
        this.showContentView();
        this.showToast(this.trans.ERROR_FILE_UPLOAD);
      })
    });
  }

  onUpload() {

    let actionSheet = this.actionSheetCtrl.create({
      title: this.trans.CHOOSE_AN_OPTION,
      buttons: [{
        text: this.trans.PHOTO_LIBRARY,
        handler: () => {
          this.chooseImage(Camera.PictureSourceType.PHOTOLIBRARY);
        }
      }, {
        text: this.trans.CAMERA,
        handler: () => {
          this.chooseImage(Camera.PictureSourceType.CAMERA);
        }
      },{
        text: this.trans.CANCEL,
        role: 'cancel'
      }]
    });
    actionSheet.present();
  }

  onSubmit() {

    this.showLoadingView();

    User.save(this.form.value).then(() => {
      this.showContentView();
      this.showToast(this.trans.PROFILE_UPDATED);
      this.onDismiss();
    }, (error) => {
      this.showContentView();
      this.showToast(this.trans.PROFILE_UPDATE_ERROR);
    });
  }

}
