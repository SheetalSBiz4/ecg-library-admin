import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlertController, LoadingController, MenuController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private isWeb = false;
  private isAndroid = false;
  private isLoading = false;
  private isSideMenuVisible = new BehaviorSubject(false);
  constructor(
    private platform: Platform,
    private translate: TranslateService,
    private MenuCtrl: MenuController,
    private loadingCtrl: LoadingController,
    private location: Location,
    private alertController: AlertController
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translate.setDefaultLang('en');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use('en');

    if (this.platform.is('cordova')) {
      this.isWeb = false;
      if (this.platform.is('android')) {
        this.isAndroid = true;
      }
    } else {
      this.isWeb = true;
    }

  }

  public checkSideMenuVisible = () => {
    return this.isSideMenuVisible.asObservable();
  }

  /**
   * setSideMenuVisiblity - function to set the sideMenuVisiblity
   */
  public setSideMenuVisiblity(value) {
    this.isSideMenuVisible.next(value);
  }

  /**
   * checkIsWeb - Function to check whether the platform is web or not
   */
  public checkIsWeb() {
    return this.isWeb;
  }

  /**
   * Function to enable or disable the sidemenu on this page
   * @param value true/false -value to set sidemenu
   */
  public enableMenu = (value) => {
    this.MenuCtrl.enable(value);
  }

  /**
    * Function to trim form controls
    */
  public trimForm = (formGroup: FormGroup) => {
    Object.keys(formGroup.controls).forEach((key) =>
      formGroup.get(key).setValue(
        typeof (formGroup.get(key).value) === 'string' ? formGroup.get(key).value.trim() : formGroup.get(key).value
      )
    );
  }

  async showLoading(message?: string) {
    this.isLoading = true;
    this.loadingCtrl.create({
      message: `<ion-spinner name="crescent" color="tertiary" class="app-loader-icon"></ion-spinner>`,
      // duration: 30000,
      duration: 1500,
      translucent: true,
      cssClass: 'custom-loading',
      spinner: null
    }).then(loader => {
      loader.present().then(() => {
        if (!this.isLoading) {
          loader.dismiss();
        }
      });
    });
  }

  async hideLoading() {
    this.loadingCtrl.getTop().then(loader => {
      if (loader) {
        this.isLoading = false;
        loader.dismiss();
      } else {
        setTimeout(() => {
          if (this.isLoading) {
            this.hideLoading()
          }
        }, 3000);
      }
    });
  }

  /**
   * goBack - function to go back to the previous page in router history
   */
  public goBack() {
    this.location.back();
  }

  /**
    * Function to translate text from component
    * @param: translateWord
    */
  public translateText(translateWord: string) {
    return this.translate.get(translateWord);
  }

  /**
    * Translate given string
    */
  getTranslate(key, params?) {
    return this.translate.instant(key, params);
  }

  private checkIfAlertExist() {
    return this.alertController.getTop();
  }

  /**
   * Function to show a default alert with custom message
   * @param message
   */
  public async showAlert(title, message, confirmCallback?: any, cancelCallBack?: any) {
    let existingALert = await this.checkIfAlertExist();
    if (existingALert) {
      existingALert.dismiss();
    }
    this.alertController.getTop().then((existingalert) => { })
    const alert = await this.alertController.create({
      cssClass: 'ecg-alert',
      header: '',
      // subHeader: 'Subtitle',
      message: message,
      buttons: [
        {
          text: 'X',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            cancelCallBack && cancelCallBack();
            // console.log('Confirm Cancel: blah');
          }
        },
        {
          text: 'Ok',
          cssClass: 'primary',
          handler: () => {
            confirmCallback && confirmCallback();
            // console.log('Confirm Okay');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Function to show a default alert with custom message
   * @param message
   */
  public async showConfirmation(title, message, confirmCallback, cancelCallBack, btnText?: any) {
    let existingALert = await this.checkIfAlertExist();
    if (existingALert) {
      existingALert.dismiss();
    }
    const alert = await this.alertController.create({
      cssClass: 'ecg-alert cancel',
      header: '',
      message: message,
      buttons: [
        {
          text: 'X',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            cancelCallBack && cancelCallBack();
            // console.log('Confirm Cancel: blah');
          }
        }, {
          text: btnText || 'Delete',
          cssClass: 'primary',
          handler: () => {
            confirmCallback && confirmCallback();
            // console.log('Confirm Okay');
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Function to show a default alert with custom message
   * @param message
   */
   public async showConfirmationWithButton(title, message, confirmCallback, cancelCallBack, yesBtnText?: any, noBtnText?: any) {
    let existingALert = await this.checkIfAlertExist();
    if (existingALert) {
      existingALert.dismiss();
    }
    const alert = await this.alertController.create({
      cssClass: 'ecg-logout-alert',
      header: '',
      message: message,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            cancelCallBack && cancelCallBack();
          }
        },
        {
          text: 'Yes',
          handler: () => {
            confirmCallback && confirmCallback();
          }
        }
      ]
    });
    await alert.present();
  }
}
