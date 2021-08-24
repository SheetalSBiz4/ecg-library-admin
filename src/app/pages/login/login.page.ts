import { AfterViewInit, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService, FirebaseService, ValidatorService } from 'src/app/providers/providers';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements AfterViewInit {
  public loginForm: FormGroup;
  public isSubmit = false;
  public submitBtnDisabled = false;
  // used for flipping password type in password input
  public isPasswordHidden: boolean;

  constructor(
    private commonService: CommonService,
    private validatorService: ValidatorService,
    private router: Router,
    private firebaseService: FirebaseService
  ) {
    // console.log('sds');

    this.loginForm = this.validatorService.loginFormValidator();
  }

  ngAfterViewInit() {
  }
  ionViewWillEnter (){
    this.commonService.enableMenu(false);

  }

  /**
   * Function to executed on press of back to login button
   */
  public togglePassword = () => {
    this.isPasswordHidden = !this.isPasswordHidden;
  }


  /**
    * Function to check the value of checkbox
    */
  public checkBox = () => {
    this.f.termsAndConditions.setValue(!this.f.termsAndConditions.value);
  }



  /**
   *  convenience getter for easy access to form fields
   */
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Login - function to be executed on press of login button
   */
  public login() {
    this.isSubmit = true;
    this.submitBtnDisabled = true;
    this.commonService.trimForm(this.loginForm);

    if (this.loginForm.valid) {
      this.commonService.showLoading();
      const payload = this.loginForm.value;
      this.firebaseService.signIn(payload.email, payload.password, payload.termsAndConditions)
        .then((result) => {
          this.commonService.hideLoading();
          this.submitBtnDisabled = false;
          this.router.navigate(['ecg-cases'], { replaceUrl: true });
          // console.log('result', result);
        })
        .catch((error) => {
          this.commonService.hideLoading();
          this.submitBtnDisabled = false;
          this.commonService.showAlert('Error', error.message);
        });
    } else {
      this.submitBtnDisabled = false;
    }
  }

  /**
   * forgotPassword - function to be executed on press of forgot password button
   */
  public forgotPassword() {
    this.router.navigate(['forgot-password']);

  }

}
