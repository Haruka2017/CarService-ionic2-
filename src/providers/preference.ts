import { Injectable } from '@angular/core';
@Injectable()
export class Preference {

  private _unit;
  private _mapStyle;
  private _distance;
  private _lang;

  get unit(): any {
    return this._unit;
  }

  set unit(val) {
    this._unit = val;
  }

  get mapStyle(): any {
    return this._mapStyle;
  }

  set mapStyle(val) {
    this._mapStyle = val;
  }

  get distance(): any {
    return this._distance;
  }

  set distance(val) {
    this._distance = val;
  }

  get lang(): any {
    return this._lang;
  }

  set lang(val) {
    this._lang = val;
  }

}
