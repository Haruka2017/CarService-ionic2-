import { Injectable } from '@angular/core';
import Parse from 'parse';

@Injectable()
export class User extends Parse.User {

  constructor() {
    super('_User');
  }

  static getInstance() {
    return this;
  }

  static getCurrentUser() {
    return <User>Parse.User.current();
  }


  static create(data): Promise<User> {

    return new Promise((resolve, reject) => {

      let user = new User();

      data.username = data.email;

      user.save(data).then(user => {
        resolve(<User> user);
      }, error => {
        reject(error);
      });
    });
  }

  static signIn(data): Promise<User> {
    return new Promise((resolve, reject) => {
      Parse.User.logIn(data.email, data.password).then(user => resolve(<User> user), error => reject(error));
    });
  }

  static logout() {

    return new Promise((resolve, reject) => {

      Parse.User.logOut().then(success => {
        resolve(success);
      }, error => {
        reject(error);
      });
    });
  }

  static recoverPassword(email) {
    return new Promise((resolve, reject) => {

      Parse.User.requestPasswordReset(email).then(success => {
        resolve(success);
      }, error => {
        reject(error);
      });
    });
  }

  static save (data) {
    return new Promise((resolve, reject) => {
      let user = User.getCurrentUser();
      user.save(data).then(user => resolve(user), error => reject(error));
    });
  }

  static stats(): Promise<any> {
    return new Promise((resolve, reject) => {
      Parse.Cloud.run('getUserStats').then(data => resolve(data), error => reject(error));
    });
  }

  get name(): string {
    return this.get('name');
  }

  set name(val) {
    this.set('name', val);
  }

  get email(): string {
    return this.get('email');
  }

  set email(val) {
    this.set('email', val);
  }

  get username(): string {
    return this.get('username');
  }

  set username(val) {
    this.set('username', val);
  }

  get password(): string {
    return this.get('password');
  }

  set password(val) {
    this.set('password', val);
  }

  get photo(): string {
    return this.get('photo');
  }

  set photo(val) {
    this.set('photo', val);
  }

}

Parse.Object.registerSubclass('User', User);
