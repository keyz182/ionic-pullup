import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { IonPullUpFooterState, IonPullDownHeaderState} from '../../../../src/index';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  footerState: IonPullUpFooterState;
  headerState: IonPullDownHeaderState;

  constructor(public navCtrl: NavController) {
    this.footerState = IonPullUpFooterState.Collapsed;
    this.headerState = IonPullDownHeaderState.Collapsed;
  }

  footerExpanded() {
    console.log('Footer expanded!');
  }

  footerCollapsed() {
    console.log('Footer collapsed!');
  }

  toggleFooter() {
    this.footerState = this.footerState == IonPullUpFooterState.Collapsed ? IonPullUpFooterState.Expanded : IonPullUpFooterState.Collapsed;
  }

  headerExpanded() {
    console.log('Header expanded!');
  }

  headerCollapsed() {
    console.log('Header collapsed!');
  }

  toggleHeader() {
    this.headerState = this.headerState == IonPullDownHeaderState.Collapsed ? IonPullDownHeaderState.Expanded : IonPullDownHeaderState.Collapsed;
  }

  onStateChange(content){
    setTimeout(()=>{
      content.resize();
    }, 300);
  }

}
