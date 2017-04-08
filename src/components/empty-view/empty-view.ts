import { Component, Input } from '@angular/core';

@Component({
  selector: 'empty-view',
  templateUrl: 'empty-view.html'
})
export class EmptyView {

  @Input() text: string = '';
  @Input() icon: string = 'alert';

  constructor() {}

}
