import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  constructor(
    private formBuilder: FormBuilder
  ) { }

  /**
    * Function for login form validator
    */
  public loginFormValidator = () => {
    return this.formBuilder.group({
      email: [
        undefined,
        Validators.compose([
          Validators.pattern(
            /^\s*(([^<>()[\]\\.,;:\s@\']+(\.[^<>()[\]\\.,;:\s@\']+)*)|(\'.+\'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*$/
          ),
          Validators.required,
        ]),
      ],
      password: [
        '',
        Validators.compose([
          Validators.required,
        ]),
      ],
      termsAndConditions: [false],
      //  Validators.requiredTrue
    });
  }

  /**
    * Function for login form validator
    */
  public forgotPasswordFormValidator = () => {
    return this.formBuilder.group({
      email: [
        undefined,
        Validators.compose([
          Validators.pattern(
            /^\s*(([^<>()[\]\\.,;:\s@\']+(\.[^<>()[\]\\.,;:\s@\']+)*)|(\'.+\'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*$/
          ),
          Validators.required,
        ]),
      ],
    });
  }

  /**
    * Function for OTP verification form validator
    */

  public otpVerificationFormValidator = () => {
    return this.formBuilder.group({
      digit1: [
        '',
        Validators.compose([
          Validators.pattern(/^[0-9]{1,1}$/),
          Validators.required,
          Validators.maxLength(1),
          Validators.minLength(1),
        ]),
      ],
      digit2: [
        '',
        Validators.compose([
          Validators.pattern(/^[0-9]{1,1}$/),
          Validators.required,
          Validators.maxLength(1),
          Validators.minLength(1),
        ]),
      ],
      digit3: [
        '',
        Validators.compose([
          Validators.pattern(/^[0-9]{1,1}$/),
          Validators.required,
          Validators.maxLength(1),
          Validators.minLength(1),
        ]),
      ],
      digit4: [
        '',
        Validators.compose([
          Validators.pattern(/^[0-9]{1,1}$/),
          Validators.required,
          Validators.maxLength(1),
          Validators.minLength(1),
        ]),
      ],
      digit5: [
        '',
        Validators.compose([
          Validators.pattern(/^[0-9]{1,1}$/),
          Validators.required,
          Validators.maxLength(1),
          Validators.minLength(1),
        ]),
      ],
      digit6: [
        '',
        Validators.compose([
          Validators.pattern(/^[0-9]{1,1}$/),
          Validators.required,
          Validators.maxLength(1),
          Validators.minLength(1),
        ]),
      ],
    });
  }


  /**
 * resetPasswordFormValidator
 */
  public resetPasswordFormValidator() {
    return this.formBuilder.group({
      password: ['', Validators.compose([
        // Validators.pattern(
        //   /^(?=.*[A-Za-z])(?=.*?[0-9]).{6,}$/
        // ),
        Validators.required,
      ])],
      confirmPassword: ['', Validators.compose([
        Validators.required,
        this.equalto('password')
      ])],
    });

  }

   /**
    * Function for case create form validator
    */
   public createCaseFormValidator = () => {
    return this.formBuilder.group({
      caseNumber: [
        '',
        Validators.compose([
          Validators.required,
          // Validators.maxLength(250)
        ]),
      ],
      details: [
        '',
        Validators.compose([
          Validators.required,
          // Validators.maxLength(250)
        ]),
      ],
      result: [
        '',
        Validators.compose([
          Validators.required,
          // Validators.maxLength(250)
        ]),
      ],
      nextStep: [
        '',
        Validators.compose([
          Validators.required,
          // Validators.maxLength(250)
        ]),
      ],
      references: [
        '',
        Validators.compose([
          // Validators.required,
          // Validators.maxLength(250)
        ]),
      ],


    });
  }

  // Custom validators
  private equalto(controlName) {
    return (control: AbstractControl): { [key: string]: any } => {

      const input = control.value;

      const isValid = control.root.value[controlName] === input;
      if (!isValid) {

        return { equalTo: true };
      }
      else {

        return null;
      }
    };
  }

  /**
   * notEqualTo
   */
  public notEqualTo(controlName) {
    return (control: AbstractControl): { [key: string]: any } => {

      const input = control.value;

      const isValid = control.root.value[controlName] !== input;
      if (!isValid) {

        return { equalTo: true };
      }
      else {

        return null;
      }
    };
  }

   /**
    * Function for case create form validator
    */
    public createSwitchCaseForm = () => {
      return this.formBuilder.group({
        to: [
          '',
          Validators.compose([
            Validators.required,
            // Validators.maxLength(250)
          ]),
        ],
        from: [
          '',
          Validators.compose([
            Validators.required,
            // Validators.maxLength(250)
          ]),
        ]
      });
    }

}
