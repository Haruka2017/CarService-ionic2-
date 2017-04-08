import { Injectable } from '@angular/core';
import Parse from 'parse';

@Injectable()
export class Review extends Parse.Object {

  constructor() {
    super('Review');
  }

  static create(data) {

    return new Promise((resolve, reject) => {

      let review = new Review();

      review.save(data).then(data => {
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  static load(params) {

    return new Promise((resolve, reject) => {

      let query = new Parse.Query(this);
      query.include('userData');
      query.equalTo('place', params.place);
      query.equalTo('isInappropriate', false);
      query.descending('createdAt');

      let limit = params.limit || 40;
      let page = params.page || 0;
      query.skip(page * limit);
      query.limit(limit);

      query.find().then(data => resolve(data), error => reject(error));
    });
  }

  get rating(): number {
    return this.get('rating');
  }

  get comment(): string {
    return this.get('comment');
  }

  get place(): any {
    return this.get('place');
  }

  get userData(): any {
    return this.get('userData');
  }
}

Parse.Object.registerSubclass('Review', Review);
