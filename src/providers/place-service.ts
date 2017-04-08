import { Injectable } from '@angular/core';
import Parse from 'parse';

@Injectable()
export class Place extends Parse.Object {

  constructor() {
    super('Place');
  }

  distance(location, unit) {

    if (!location) {
      return null;
    }

    var geoPoint = new Parse.GeoPoint({
      latitude: location.latitude,
      longitude: location.longitude
    });

    if (unit === 'km') {
      return this.location.kilometersTo(geoPoint).toFixed(2) + ' ' + unit;
    } else {
      return this.location.milesTo(geoPoint).toFixed(2) + ' ' + unit;
    }
  }

  static like(place) {

    return new Promise((resolve, reject) => {
      Parse.Cloud.run('likePlace', { placeId: place.id }).then(data => {
        resolve(data);
      }, error => {
        reject(error);
      });
     });
  }

  static load(params): Promise<Place[]> {

    return new Promise((resolve, reject) => {

      let page = params.page || 0;
      let limit = params.limit || 50;
      let distance = params.distance || 100;

      let query = new Parse.Query(this);
      var subQuery = new Parse.Query(this);
      var subQueryTwo = new Parse.Query(this);

      subQuery.greaterThan('expiresAt', new Date());
      subQueryTwo.doesNotExist('expiresAt');

      query = Parse.Query.or(subQuery, subQueryTwo);
      query.include('category');
      query.equalTo('isApproved', true);

      if (params.category) {
        query.equalTo('category', params.category);
      }

      if (params.search && params.search !== '') {
        query.contains('canonical', params.search);
      }

      if (params.location) {

        var point = new Parse.GeoPoint({
          latitude: params.location.latitude,
          longitude: params.location.longitude
        });

        if (params.unit && params.unit === 'km') {
          query.withinKilometers('location', point, distance);
        } else {
          query.withinMiles('location', point, distance);
        }
      } else {
        query.descending('createdAt');
      }

      query.skip(page * limit);
      query.limit(limit);

      query.find().then(data => resolve(data), error => reject(error));
    });
  }

  static loadFavorites(params): Promise<Place[]> {

    return new Promise((resolve, reject) => {

      let page = params.page || 0;
      let limit = params.limit || 50;

      let query = new Parse.Query(this);
      query.equalTo('isApproved', true);
      query.equalTo('likes', Parse.User.current());

      query.skip(page * limit);
      query.limit(limit);

      query.find().then(data => resolve(data), error => reject(error));
    });
  }

  static create(data): Promise<Place> {

    return new Promise((resolve, reject) => {

      let place = new Parse.Object('Place');

      place.save(data).then(data => {
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  get title(): string {
    return this.get('title');
  }

  set title(val) {
    this.set('title', val);
  }

  get description(): string {
    return this.get('description');
  }

  set description(val) {
    this.set('description', val);
  }

  get phone(): string {
    return this.get('phone');
  }

  set phone(val) {
    this.set('phone', val);
  }

  get website(): string {
    return this.get('website');
  }

  set website(val) {
    this.set('website', val);
  }

  get address(): string {
    return this.get('address');
  }

  set address(val) {
    this.set('address', val);
  }

  get category() {
    return this.get('category');
  }

  set category(val) {
    this.set('category', val);
  }

  get image() {
    return this.get('image');
  }

  set image(val) {
    this.set('image', val);
  }

  get location() {
    return this.get('location');
  }

  set location(val) {
    var geoPoint = new Parse.GeoPoint({
      latitude: val.lat,
      longitude: val.lng
    });
    this.set('location', geoPoint);
  }

  get imageTwo() {
    return this.get('imageTwo');
  }

  get imageThree() {
    return this.get('imageThree');
  }

  get imageFour() {
    return this.get('imageFour');
  }

  get imageThumb() {
    return this.get('imageThumb');
  }

  get ratingCount() {
    return this.get('ratingCount');
  }

  get ratingTotal() {
    return this.get('ratingTotal');
  }

  get rating() {

    if (!this.ratingCount && !this.ratingTotal) {
      return null;
    }

    return Math.round(this.ratingTotal / this.ratingCount);
  }

}

Parse.Object.registerSubclass('Place', Place);
