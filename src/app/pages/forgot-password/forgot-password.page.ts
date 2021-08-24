import { ThisReceiver, ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService, FirebaseService, ValidatorService } from 'src/app/providers/providers';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  public forgotPasswordForm: FormGroup;
  public isSubmit = false;
  public submitBtnDisabled = false;

  constructor(
    private commonService: CommonService,
    private validatorService: ValidatorService,
    private router: Router,
    private firebaseService: FirebaseService
  ) {
    // console.log('sds');

    this.commonService.enableMenu(false);
    this.forgotPasswordForm = this.validatorService.forgotPasswordFormValidator();
  }

  ngOnInit() {
  }

  /**
   * goBack - Function to go back to previos page
   */
  public goBack() {
    this.commonService.goBack();
  }


  /**
   *  convenience getter for easy access to form fields
   */
  get f() {
    return this.forgotPasswordForm.controls;
  }

  /**
   * forgotPassword - function to be executed on press of Submit button
   */
  public forgotPassword() {
    this.isSubmit = true;
    this.submitBtnDisabled = true;
    this.commonService.trimForm(this.forgotPasswordForm);

    if (this.forgotPasswordForm.valid) {
      this.commonService.showLoading();
      const payload = this.forgotPasswordForm.value;
      this.firebaseService.resetPassword(payload.email)
        .then((result) => {
          this.commonService.hideLoading();
          this.submitBtnDisabled = false;
          this.commonService.translateText('success_password_reset').subscribe((msg) => {
            this.commonService.showAlert('Success', msg);
          });

        })
        .catch((error) => {
          this.commonService.hideLoading();
          this.submitBtnDisabled = false;
          this.commonService.showAlert('Error', error.message)
        });



    } else {
      this.submitBtnDisabled = false;
    }
  }

}
