import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService, ValidatorService } from 'src/app/providers/providers';

@Component({
  selector: 'app-otpverification',
  templateUrl: './otpverification.page.html',
  styleUrls: ['./otpverification.page.scss'],
})
export class OTPVerificationPage implements OnInit {

  public optVerificationForm: FormGroup;
  public isSubmit = false;
  public submitBtnDisabled = false;


  constructor(
    private commonService: CommonService,
    private validatorService: ValidatorService,
    private router: Router
  ) {
    // console.log('sds');

    this.commonService.enableMenu(false);
    this.optVerificationForm = this.validatorService.otpVerificationFormValidator();
  }

  ngOnInit() {
  }

  /**
   * Function to executed on press of resend verification code button
   */
  public resendCode = () => {

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
    return this.optVerificationForm.controls;
  }

  /**
   * verifyOtp - function to be executed on press of submit button
   */
  public verifyOtp() {
    this.isSubmit = true;
    this.submitBtnDisabled = true;
    this.commonService.trimForm(this.optVerificationForm);

    if (this.optVerificationForm.valid) {
      this.router.navigate(['reset-password'], { skipLocationChange: true });

    } else {
      this.submitBtnDisabled = false;
    }
  }


  /**
    * Function to executed on press of backspace inside input box
    */
   public otpController2 = (event, next, prev) => {

    if (event.key === 'Backspace') {
       return;
    }
    if (next && event.target.value.length > 0) {
       next.setFocus();
    } else {
       return 0;
    }
 }

 /**
  * Function to executed on press of any digit in input box
  */
 public otpController = (event, next, prev) => {
    // console.log('s')
    if (event.target.value.length < 1 && prev) {
       prev.setFocus();
    } else if (next && event.target.value.length > 0) {
       next.setFocus();
    } else {
       return 0;
    }
 }

}
