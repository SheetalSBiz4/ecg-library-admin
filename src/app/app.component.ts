import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonService, FirebaseService } from './providers/providers';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public selectedUrl = '/ecg-cases';
  public appPages = [
    {
      title: 'ECGCases',
      url: '/ecg-cases',
      icon: 'assets/img/ecg.svg',
      icon_off: 'assets/img/ecg.svg',
    },
    // {
    //   title: 'Outbox',
    //   url: '/folder/Outbox',
    //   icon: 'assets/img/email.svg',
    //   icon_off: 'assets/img/password.svg',
    // },

  ];

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private commonService: CommonService
  ) {
    // this.commonService.enableMenu(false);
    /**
      * This function will call on route change and sidbar menu selection is managed
      * */
    this.router.events.pipe(filter(event =>
      event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {

        this.selectedUrl = event['url'];
        if (this.selectedUrl == '/') {
          this.selectedUrl = '/ecg-cases';
        }

      });
      this.appHeight();
      window.addEventListener('resize', this.appHeight)

  }

  private appHeight = () => {
    const doc = document.documentElement
    doc.style.setProperty('--app-height', `${window.innerHeight}px`)
  }


  /**
   * logout- function to be executed on press of signout button
   */
  public logout() {
    this.firebaseService.signOut();
    this.router.navigate(['login'], { replaceUrl: true });

  }

  /**
   * ionSplitPaneVisible - executed whenever the visiblity of sidemenu changes
   */
  public ionSplitPaneVisible(event) {
    this.commonService.setSideMenuVisiblity(event.detail.visible);
  }

}
