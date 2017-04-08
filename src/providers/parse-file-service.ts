import { Injectable } from '@angular/core';
import Parse from 'parse';

@Injectable()
export class ParseFile {

  constructor() {
  }

  static upload(base64) {
    return new Promise((resolve, reject) => {
      let parseFile = new Parse.File('image.jpg', { base64: base64 });
      parseFile.save().then(data => resolve(data), error => reject(error));
    });
  }
}
