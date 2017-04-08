import { Component, Injector } from '@angular/core';
import { ActionSheetController, Platform, Events } from 'ionic-angular';
import { BasePage } from '../base-page/base-page';
import { Place } from '../../providers/place-service';
import { MapStyle } from '../../providers/map-style';
import { ParseFile } from '../../providers/parse-file-service';
import { Category } from '../../providers/categories';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraPosition, GoogleMap, GoogleMapsEvent, GoogleMapsMarker,
  GoogleMapsMarkerOptions, GoogleMapsLatLng, Geocoder, GeocoderRequest, GeocoderResult } from 'ionic-native';

@Component({
  selector: 'page-add-place-page',
  templateUrl: 'add-place-page.html'
})
export class AddPlacePage extends BasePage {

  form: FormGroup;
  categories: any;
  map: GoogleMap;
  marker: GoogleMapsMarker;
  trans: any;
  isViewLoaded: boolean;

  constructor(injector: Injector,
    private formBuilder: FormBuilder,
    private platform: Platform,
    private place: Place,
    private events: Events,
    private actionSheetCtrl: ActionSheetController) {

    super(injector);

    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      description: new FormControl(''),
      address: new FormControl(''),
      phone: new FormControl(''),
      website: new FormControl('http://')
    });

    let trans = ['PROFILE_UPDATED', 'PROFILE_UPDATE_ERROR', 'CAMERA', 'CANCEL',
      'CHOOSE_AN_OPTION', 'PHOTO_LIBRARY', 'FILE_UPLOADED', 'ERROR_FILE_UPLOAD'];

    this.translate.get(trans).subscribe(values => {
      this.trans = values;
    });

    this.events.subscribe('onMenuOpened', (e) => {
      if (this.map) {
        this.map.setClickable(false);
      }
    });

    this.events.subscribe('onMenuClosed', (e) => {
      if (this.map) {
        this.map.setClickable(true);
      }
    });
  }

  enableMenuSwipe() {
    return true;
  }

  ionViewWillUnload() {

    this.isViewLoaded = false;

    if (this.map) {
      this.map.clear();
      this.map.setZoom(1);
      this.map.setCenter(new GoogleMapsLatLng(0, 0));
    }
  }

  ionViewDidLoad() {

    this.isViewLoaded = true;

    Category.load().then(categories => {
      this.categories = categories;
    });

    if (this.platform.is('cordova')) {

      GoogleMap.isAvailable().then(() => {

        this.map = new GoogleMap('map_add', {
          styles: MapStyle.dark(),
          backgroundColor: '#333333'
        });

        this.map.one(GoogleMapsEvent.MAP_READY);
        this.map.setMyLocationEnabled(true);

        this.map.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK).subscribe((map: GoogleMap) => {

          if (this.isViewLoaded) {

            this.map.getCameraPosition().then((camera: CameraPosition) => {

              let target: GoogleMapsLatLng = <GoogleMapsLatLng> camera.target;

              if (this.marker) {
                this.marker.setPosition(target);
              } else {

                let markerOptions: GoogleMapsMarkerOptions = {
                  position: target,
                  icon: 'yellow'
                };

                this.map.addMarker(markerOptions).then((marker: GoogleMapsMarker) => {
                  this.marker = marker;
                });
              }
            });
          }

        });

        this.map.on(GoogleMapsEvent.CAMERA_CHANGE).subscribe(camera => {
          if (this.marker) {
            this.marker.setPosition(camera.target);
          }
        });
      });
    }
  }

  onSearchAddress(event: any) {

    let query = event.target.value;

    let request: GeocoderRequest = {
      address: query
    }

    Geocoder.geocode(request).then((results: GeocoderResult) => {

      // create LatLng object
      let target: GoogleMapsLatLng = new GoogleMapsLatLng(
        results[0].position.lat,
        results[0].position.lng
      );

      // create CameraPosition
      let position: CameraPosition = {
        target: target,
        zoom: 10
      };

      // move the map's camera to position
      this.map.moveCamera(position);

      // create new marker
      let markerOptions: GoogleMapsMarkerOptions = {
        position: target
      };

      this.map.addMarker(markerOptions).then((marker: GoogleMapsMarker) => {
        this.marker = marker;
      });
    });
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
        this.place.image = file;
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

    this.place.title = this.form.value.name;
    this.place.category = this.form.value.category;
    this.place.description = this.form.value.description;
    this.place.address = this.form.value.address;
    this.place.website = this.form.value.website;
    this.place.phone = this.form.value.phone;

    this.marker.getPosition().then(position => {

      this.place.location = position;

      this.place.save().then(place => {
        this.showContentView();
        this.translate.get('PLACE_ADDED').subscribe(str => this.showToast(str));
      }, error => {
        this.showContentView();
        this.translate.get('ERROR_PLACE_ADD').subscribe(str => this.showToast(str));
      });
    });

  }

}
