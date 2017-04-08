import { Component, Injector, ViewChild, ElementRef } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { BasePage } from '../base-page/base-page';
import { Http } from '@angular/http';

declare var google: any;
declare var window: any;
declare var navigator: any;
declare var document: any;

@Component({
  selector: 'page-map-animation',
  templateUrl: 'map-animation.html'
})
export class MapAnimationPage extends BasePage {

  @ViewChild('map') mapElement: ElementRef;

  mapJs: any;
  centerPos: any;

  params: any = {};
  isViewLoaded: boolean;

  markers = [];
//  paths: any[] = [];
  timeout: number[] = [];
  pathLength = 100;
  stepInterval = 2000;
  path: { lat: number, lng: number }[][] = [[{ lat: 0, lng: 0 }]];
  nextpath: { lat: number, lng: number }[][] = [[{ lat: 0, lng: 0 }]];

  centerMarker: any;

  //This is the number of animated map markers
  carNumbers = 2;

  //this is google map api key
  apiKey = "AIzaSyBDFWQFBlWDecL2pzPvBAWHzhZvAylpGPI"

  constructor(public injector: Injector,
    private platform: Platform,
    private http: Http, 
    private events: Events
  ) {

    super(injector);

    let self = this

    // Check if platform based
    if (typeof window.cordova != 'undefined') {
      platform.ready().then(() => {
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        setTimeout(() => {
          self.loadJsMap()
        }, 200)
      })
    } else {
      setTimeout(() => {
        self.loadJsMap()
      }, 100)
    }

  }

  loadJsMap(){
    let self = this

    if (typeof google === 'undefined') {
      console.warn('Trouble loading map');
      return
    }

    //This is defult location: when app cannot capture user's location, then this location will appear
    let x = 29.7980;
    let y = -95.2980;
    this.centerPos = {
      lat: x,
      lng: y
    }

    let latLng = new google.maps.LatLng(x, y);
    let mapOptions = {
      center: latLng,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP//Load Google RoadMap
    }

    this.mapJs = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    //This is function that capture user's location and goto that position
    this.locateMe()

    //This set default center Marker
    var image = 'assets/img/small-location.png';
    this.centerMarker = new google.maps.Marker({
      position: this.centerPos,
      map: self.mapJs,
      icon: image
    });

  }

  locateMe() {
    let self = this
    let options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

    if (navigator.geolocation) {
      let getMyLocation = function (options) {

        navigator.geolocation.getCurrentPosition(function (position) {

          //get user's current position and set Map Center
          self.centerPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }

          self.mapJs.setCenter(self.centerPos);
          self.centerMarker.setPosition(new google.maps.LatLng(self.centerPos.lat, self.centerPos.lng))

          //Start Car Animation
          self.startCarAnimation(self.carNumbers);
        }, function (err) {
          console.warn(err);
          console.warn('Please check if you enabled your location setting');

          return
        }, options)
      }

      getMyLocation(options)
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
    return {lat: newLat, lng: newLng}
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
      var latlng = new google.maps.LatLng(
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

    var marker = null;
    let self = this;

    this.timeout[carIndex] = 0;

    for (let i = 0; i < data.snappedPoints.length; i++) {

      let lat = data.snappedPoints[i].location.latitude;
      let lng = data.snappedPoints[i].location.longitude;

      setTimeout(function () {
        let direction = self.getDirectionIcon(i, data);
        if ((i == 0) && (self.markers[carIndex] == undefined)) {
          console.log("Marker created!!!");
          marker = new google.maps.Marker({
            position: { lat: lat, lng: lng },
            map: self.mapJs
          });
          if (direction != null) {
            let image = 'assets/img/' + direction + '.png';
            marker.setIcon(image);
          }
          self.markers[carIndex] = marker;
        }
        else {
          let latLng = new google.maps.LatLng(lat, lng);
          if (direction != null) {
            let image = 'assets/img/' + direction + '.png';
            self.markers[carIndex].setIcon(image);
          }
          self.markers[carIndex].setPosition(latLng);
        }
      }, i * this.stepInterval);
    }
    this.timeout[carIndex] = (data.snappedPoints.length - 1) * this.stepInterval;
  }
/*
  //This code is for rectangle path moving animation
  animate() {
    this.getAnimatePaths();
    let url_s = "https://roads.googleapis.com/v1/snapToRoads?path=";
    let url_p = this.paths.join("|");
    let url_e = "&interpolate=true&key=" + this.apiKey;
    let url = url_s + url_p + url_e;
    console.log(url)
    this.http.get(url)
      .subscribe((result) => {
        console.log(result.json())
        let data = result.json();

        this.processSnapToRoadResponse(data);
      }, (error) => {
        console.log(error)
      })
  }

  getAnimatePaths() {
    let x = this.centerPos.lat;
    let y = this.centerPos.lng;
    let lx = x - 0.002;
    let rx = x + 0.002;
    let ty = y - 0.002;
    let dy = y + 0.002;
    this.paths[0] = lx + "," + ty;
    console.log(this.paths[0]);
    this.paths[1] = lx + "," + dy;
    this.paths[2] = rx + "," + ty;
    this.paths[3] = rx + "," + dy;

    let snappedCoordinates = [];

    var latlng = new google.maps.LatLng(lx, ty);
    snappedCoordinates.push(latlng);

    latlng = new google.maps.LatLng(lx, dy);
    snappedCoordinates.push(latlng);

    latlng = new google.maps.LatLng(rx, dy);
    snappedCoordinates.push(latlng);

    latlng = new google.maps.LatLng(rx, ty);
    snappedCoordinates.push(latlng);

    latlng = new google.maps.LatLng(lx, ty);
    snappedCoordinates.push(latlng);
    let snappedPolyline = new google.maps.Polyline({
      path: snappedCoordinates,
      strokeColor: 'red',
      strokeWeight: 3
    });

    snappedPolyline.setMap(this.mapJs);
  }
*/

  getDirectionIcon(i, data) {
    let lat1 = data.snappedPoints[i].location.latitude;
    let lng1 = data.snappedPoints[i].location.longitude;

    if ((i + 1) < data.snappedPoints.length) {
      let lat2 = data.snappedPoints[i + 1].location.latitude;
      let lng2 = data.snappedPoints[i + 1].location.longitude;
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

  enableMenuSwipe() {
    return true;
  }

  ionViewWillUnload() {
    this.isViewLoaded = false;
  }

  ionViewDidLoad() {
    this.isViewLoaded = true;
  }
}