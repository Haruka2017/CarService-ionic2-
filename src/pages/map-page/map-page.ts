import { Component, Injector } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import { Place } from '../../providers/place-service';
import { MapStyle } from '../../providers/map-style';
import { PlaceDetailPage } from '../place-detail-page/place-detail-page';
import { BasePage } from '../base-page/base-page';
import { LocalStorage } from '../../providers/local-storage';
import { Http } from '@angular/http';
import { CameraPosition, GoogleMap, GoogleMapsEvent,
  GoogleMapsLatLng, GoogleMapsLatLngBounds, Geocoder, GeocoderRequest,
  GeocoderResult, GoogleMapsMarker } from 'ionic-native';

@Component({
  selector: 'page-map-page',
  templateUrl: 'map-page.html'
})
export class MapPage extends BasePage {

  params: any = {};
  places: Place[];
  map: GoogleMap;
  isViewLoaded: boolean;


  centerPos: any;

  markers = [];
  timeout: number[] = [];
  pathLength = 100;
  stepInterval = 2000;
  path: { lat: number, lng: number }[][] = [[{ lat: 0, lng: 0 }]];
  nextpath: { lat: number, lng: number }[][] = [[{ lat: 0, lng: 0 }]];

  //this is google map api key
  apiKey = "AIzaSyBDFWQFBlWDecL2pzPvBAWHzhZvAylpGPI"


  constructor(public injector: Injector,
    private events: Events,
    private storage: LocalStorage,
    private http: Http, 
    private platform: Platform) {

    super(injector);

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

    if (this.platform.is('cordova')) {

//      this.showLoadingView();
      let latLng: GoogleMapsLatLng = new GoogleMapsLatLng(29.798, -95.298);
      this.centerPos = {
        lat: 29.798,
        lng: -95.298
      }

      GoogleMap.isAvailable().then(() => {

        this.map = new GoogleMap('map', {
          styles: MapStyle.dark(),
          backgroundColor: '#333333',
          camera: {
            'latLng': latLng,
            'tilt': 30,
            'zoom': 14,
            'bearing': 50
          }
        });

        this.map.one(GoogleMapsEvent.MAP_READY).then(() => {

          this.storage.unit.then(unit => {
            this.params.unit = unit;
            this.loadData();
          });
        });

        this.storage.mapStyle.then(mapStyle => {
          this.map.setMapTypeId(mapStyle);
        });


        this.map.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK).subscribe((map: GoogleMap) => {

          if (this.isViewLoaded) {

            this.map.getCameraPosition().then((camera: CameraPosition) => {

              let target: GoogleMapsLatLng = <GoogleMapsLatLng> camera.target;

              this.params.location = target;

//              this.showLoadingView();
              this.onReload();
            });
          }
        });

        this.map.setMyLocationEnabled(true);

      });
    } else {
      console.warn('Native: tried calling Google Maps.isAvailable, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator');
    }
  }

  goToPlace(place) {
    this.navigateTo(PlaceDetailPage, place);
  }

  onSearchAddress(event: any) {

    if (this.platform.is('cordova')) {

      let query = event.target.value;

      let request: GeocoderRequest = {
        address: query
      };

      Geocoder.geocode(request).then((results: GeocoderResult) => {

        let target: GoogleMapsLatLng = new GoogleMapsLatLng(
          results[0].position.lat,
          results[0].position.lng
        );

        let position: CameraPosition = {
          target: target,
          zoom: 10
        };

        this.map.moveCamera(position);

        this.params.location = target;

//        this.showLoadingView();
        this.onReload();
      });

    } else {
      console.warn('Native: tried calling Google Maps.isAvailable, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator');
    }
  }

  loadData() {
    this.startCarAnimation(1);

    Geolocation.getCurrentPosition().then(pos => {

      this.params.location = pos.coords;

      Place.load(this.params).then(places => {
        this.onPlacesLoaded(places);
        this.showContentView();
      }, error => {
        this.translate.get('ERROR_PLACES').subscribe(str => this.showToast(str));
        this.showErrorView();
      });

    }, error => {
      this.translate.get('ERROR_LOCATION_UNAVAILABLE').subscribe(str => this.showToast(str));
      this.showErrorView();
    });
  }

  onPlacesLoaded(places) {

    let points: Array<GoogleMapsLatLng> = [];

    for(let place of places) {

      let target: GoogleMapsLatLng = new GoogleMapsLatLng(
        place.location.latitude,
        place.location.longitude
      );

      let icon = place.category.get('icon') ? {
        url: place.category.get('icon').url(),
        size: {
          width: 32,
          height: 32
        }
      } : 'yellow';

      let markerOptions = {
        position: target,
        title: place.title,
        snippet: place.description,
        icon: icon,
        place: place,
        styles: {
          maxWidth: '80%'
        },
      };

      this.map.addMarker(markerOptions).then((marker: GoogleMapsMarker) => {

        marker.addEventListener(GoogleMapsEvent.INFO_CLICK).subscribe(e => {
          this.goToPlace(e.get('place'));
        });
      });

      points.push(target);
    }

    if (points.length) {
      this.map.moveCamera({
        target: new GoogleMapsLatLngBounds(points),
        zoom: 10
      });
    }

  }

  onReload() {
    this.map.clear();
    this.places = [];
    this.loadData();
  }

  onSearchButtonTapped() {

    if (this.platform.is('cordova')) {
      this.map.getCameraPosition().then(camera => {
        let position: GoogleMapsLatLng = <GoogleMapsLatLng> camera.target;
        this.params.location = position;
//        this.showLoadingView();
        this.onReload();
      });
    } else {
      console.warn('Native: tried calling GoogleMaps.getCameraPosition, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator');
    }
  }



  startCarAnimation(number) {

    //get car's start position randomly
    for (let i = 0; i < number; i++) {

      this.path[i] = [{ lat: 0, lng: 0 }];
      let rand = Math.random();
      if ((rand > 0.45) && (rand < 0.55))
        rand = Math.random();
      let lat = this.centerPos.lat - 0.006 + rand * 0.006;
      rand = Math.random();
      if ((rand > 0.45) && (rand < 0.55))
        rand = Math.random();
      let lng = this.centerPos.lng - 0.006 + rand * 0.006;

      this.path[i][0] = { lat: lat, lng: lng };

      console.log("firstCoors:", this.path[i][0]);
    }

    //get car's move path randomly
    this.makePathFromFirstCoors();

    //start car's moving animation
    this.animateRandomPath();

    let self = this;

    //do car's moving animation indefinitely
    this.events.subscribe("FinishedAnimate", (index) => {
      self.path[index] = self.nextpath[index].slice();
      this.makePathForOneCar(index);
      this.animateRandomPathForOneCar(index);
    });
  }

  makePathFromFirstCoors() {
    for (let i = 0; i < this.path.length; i++) {
      this.makePathForOneCar(i);
    }
  }

  makePathForOneCar(i) {
    let lat = this.path[i][0].lat;
    let lng = this.path[i][0].lng;

    for (let j = 1; j < this.pathLength; j++) {
      let location = this.getLegalPos(lat, lng);
      lat = location.lat; lng = location.lng;
      this.path[i][j] = location;
    }
    console.log("Maked path", this.path);
  }

  getLegalPos(lat, lng) {
    let newLat, newLng;
    let rand;

    do {
      rand = Math.random();
      newLat = lat - 0.0025 + rand * 0.005;
      rand = Math.random();
      newLng = lng - 0.0025 + rand * 0.005;
    } while ((Math.abs(this.centerPos.lat - newLat) < 0.0005) && (Math.abs(this.centerPos.lng - newLng) < 0.0005))
    return { lat: newLat, lng: newLng }
  }

  animateRandomPath() {
    for (let i = 0; i < this.path.length; i++) {
      this.animateRandomPathForOneCar(i)
    }
  }

  animateRandomPathForOneCar(i) {
    let url_p;
    url_p = '';

    for (let j = 0; j < this.path[i].length; j++) {
      if (j == 0)
        url_p = this.path[i][j].lat + ',' + this.path[i][j].lng;
      else
        url_p = url_p + "|" + this.path[i][j].lat + ',' + this.path[i][j].lng;
    }

    let url_s = "https://roads.googleapis.com/v1/snapToRoads?path=";
    let url_e = "&interpolate=true&key=" + this.apiKey;
    let url = url_s + url_p + url_e;
    console.log(url)
    this.http.get(url)
      .subscribe((result) => {
        console.log("randomPath: ", result.json())
        let data = result.json();
        this.processSnapToRoadResponse(i, data);
        this.setNextAnimateStartPos(i, data);
      }, (error) => {
        console.log(error)
      })
  }

  setNextAnimateStartPos(i, data) {
    this.nextpath[i] = [{ lat: 0, lng: 0 }];

    if (data.snappedPoints == undefined) {
      this.timeout[i] = this.stepInterval;
      this.nextpath[i][0].lat = this.path[i][this.pathLength - 1].lat;
      this.nextpath[i][0].lng = this.path[i][this.pathLength - 1].lat;
    }
    else {
      this.nextpath[i][0].lat = data.snappedPoints[data.snappedPoints.length - 1].location.latitude;
      this.nextpath[i][0].lng = data.snappedPoints[data.snappedPoints.length - 1].location.longitude;
    }
    let self = this;
    setTimeout(function () {
      self.events.publish('FinishedAnimate', i)
    }, this.timeout[i]);
  }

  processSnapToRoadResponse(carIndex, data) {
    let snappedCoordinates = [];
    let placeIdArray = [];

    //if there is no road of path
    if (data.snappedPoints == undefined)
      return;

    for (var i = 0; i < data.snappedPoints.length; i++) {
      var latlng = new GoogleMapsLatLng(
        data.snappedPoints[i].location.latitude,
        data.snappedPoints[i].location.longitude);
      snappedCoordinates.push(latlng);
      placeIdArray.push(data.snappedPoints[i].placeId);
    }
    /*
        //this code is to show polyline path
        let snappedPolyline = new google.maps.Polyline({
          path: snappedCoordinates,
          strokeColor: 'blue',
          strokeWeight: 3
        });
    
        snappedPolyline.setMap(this.mapJs);
    */
    this.tick(carIndex, data);

  }

  tick(carIndex, data) {

    let self = this;

    this.timeout[carIndex] = 0;

    for (let i = 0; i < data.snappedPoints.length; i++) {

      let lat = data.snappedPoints[i].location.latitude;
      let lng = data.snappedPoints[i].location.longitude;

      setTimeout(function () {
        let direction = self.getDirectionIcon(i, data);
        if ((i == 0) && (self.markers[carIndex] == undefined)) {
          console.log("Marker created!!!");

          let pos = new GoogleMapsLatLng(lat, lng);
          let markerOptions = {
            position: pos
          };
          self.map.addMarker(markerOptions).then((marker: GoogleMapsMarker) => {
            if (direction != null) {
              let image = 'www/assets/img/' + direction + '_w.png';
              console.log(image);
              marker.setIcon({
                url: image
              });
            }
            self.markers[carIndex] = marker;
          });
        }
        else {
          let latLng = new GoogleMapsLatLng(lat, lng);
          if (direction != null) {
            let image = 'www/assets/img/' + direction + '_w.png';
            console.log(image);
            self.markers[carIndex].setIcon({
              url: image
            });
          }
          self.markers[carIndex].setPosition(latLng);
        }
      }, i * this.stepInterval);
    }
    this.timeout[carIndex] = (data.snappedPoints.length - 1) * this.stepInterval;
  }

  getDirectionIcon(i, data) {
    let lat1 = data.snappedPoints[i].location.latitude;
    let lng1 = data.snappedPoints[i].location.longitude;


    if ((i + 1) < data.snappedPoints.length) {
      let lat2 = data.snappedPoints[i + 1].location.latitude;
      let lng2 = data.snappedPoints[i + 1].location.longitude;

      if (i > 0) {
        //next position is same place yet, doesn't change direction
        if ((Math.abs(lat2 - lat1) < 0.0005) && (Math.abs(lng2 - lng1) < 0.0005))
          return null;
      }

      let direction = this.getMarkerIcon(lat1, lng1, lat2, lng2)

      return direction;
    }
    return null;
  }


  getMarkerIcon(lat1, lng1, lat2, lng2) {

    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;
    let dLng = (lng2 - lng1) * Math.PI / 180;

    let y = Math.sin(dLng) * Math.cos(lat2);
    let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    var brng = Math.atan2(y, x) * 180 / Math.PI;

    var bearings = ["right", "down", "left", "up"];

    var index = brng - 45;
    if (index < 0)
      index += 360;
    index = Math.floor(index / 90);

    return (bearings[index]);
  }


}

