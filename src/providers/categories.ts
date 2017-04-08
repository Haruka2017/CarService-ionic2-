import { Injectable } from '@angular/core';
import Parse from 'parse';

@Injectable()
export class Category extends Parse.Object {

  constructor() {
    super('Category');
  }

  static load(): Promise<Category[]> {

    return new Promise((resolve, reject) => {
      let query = new Parse.Query(this);
      query.find().then(data => {
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  get title(): string {
    return this.get('title');
  }

  get icon() {
    return this.get('icon');
  }

  get image() {
    return this.get('image');
  }

  get imageThumb() {
    return this.get('imageThumb');
  }

}

Parse.Object.registerSubclass('Category', Category);
