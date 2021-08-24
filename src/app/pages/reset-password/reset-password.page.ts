import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService, FirebaseService, ValidatorService } from 'src/app/providers/providers';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {

  public resetPasswordForm: FormGroup;
  public isSubmit = false;
  public submitBtnDisabled = false;
  private mode;
  private oobCode

  constructor(
    private commonService: CommonService,
    private validatorService: ValidatorService,
    private router: Router,
    private activatedActivated: ActivatedRoute,
    private firebaseService: FirebaseService
  ) {

    this.commonService.enableMenu(false);
    this.resetPasswordForm = this.validatorService.resetPasswordFormValidator();
    this.mode = this.activatedActivated.snapshot.queryParams['mode'];
    this.oobCode = this.activatedActivated.snapshot.queryParams['oobCode'];
  }

  ngOnInit() {
  }

  /**
   * goBack - Function to go back to previos page
   */
  public goBack() {
    // this.commonService.goBack();
    this.router.navigate(['login'], { replaceUrl: true });
  }


  /**
   *  convenience getter for easy access to form fields
   */
  get f() {
    return this.resetPasswordForm.controls;
  }

  /**
   * resetPassword - function to be executed on press of Submit button
   */
  public resetPassword() {
    this.isSubmit = true;
    this.submitBtnDisabled = true;
    this.commonService.trimForm(this.resetPasswordForm);

    if (this.resetPasswordForm.valid) {
      this.commonService.showLoading();
      const payload = this.resetPasswordForm.value;
      this.firebaseService.confirmPassword(this.oobCode,payload.password)
      .then((result) =>{
        this.commonService.hideLoading();
        this.submitBtnDisabled = false;
        this.commonService.translateText('password_reset_success').subscribe((msg) => {
          this.commonService.showAlert('Success', msg);
        });
        this.router.navigate(['login'], { replaceUrl: true });
        // console.log('result',result);
      })
      .catch((error) =>{
        this.commonService.hideLoading();
        this.submitBtnDisabled = false;
        this.commonService.showAlert('Error', error.message);
      });


    } else {
      this.submitBtnDisabled = false;
    }
  }
}
