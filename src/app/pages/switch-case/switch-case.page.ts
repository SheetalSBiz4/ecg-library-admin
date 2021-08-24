import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CommonService, FirebaseService, ValidatorService } from 'src/app/providers/providers';

@Component({
  selector: 'app-switch-case',
  templateUrl: './switch-case.page.html',
  styleUrls: ['./switch-case.page.scss'],
})
export class SwitchCasePage implements OnInit {
  @Input() maxValue: number;
  public switchForm: FormGroup;
  public isSubmit = false;
  public submitBtnDisabled = false;
  constructor(
    private commonService: CommonService,
    private validatorService: ValidatorService,
    private modalController: ModalController,
    private firebaseService: FirebaseService
  ) {
    this.switchForm = this.validatorService.createSwitchCaseForm();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.setValidation('to');
    this.setValidation('from');

  }

  private setValidation(name) {
    let ctrl = this.switchForm.get(name);
    const validations= [
      Validators.required,
      Validators.max(this.maxValue),
      Validators.min(1),
      Validators.pattern(/^[0-9]*$/),
    ]
    if(name=='from'){
      validations.push(this.validatorService.notEqualTo('to'));
    }
    ctrl.setValidators(Validators.compose(validations));
    ctrl.updateValueAndValidity();

  }

  /**
   *  convenience getter for easy access to form fields
   */
  get f() {
    return this.switchForm.controls;
  }

  /**
  * Login - function to be executed on press of login button
  */
  public submit() {
    this.isSubmit = true;
    this.submitBtnDisabled = true;
    this.commonService.trimForm(this.switchForm);

    if (this.switchForm.valid) {
      this.commonService.showLoading();
      const payload = this.switchForm.value;
      this.firebaseService.switchCase(payload.to - 1, payload.from - 1)
      .then(()=>{
        this.commonService.translateText('caseSwitched').subscribe((msg) => {
          this.commonService.showAlert('Success', msg);
          this.dismiss('success');
        });
        this.commonService.hideLoading();
      }).catch((err)=>{
        console.error(err);
      })

    } else {
      this.submitBtnDisabled = false;
    }
  }

  /**
   * dismiss - function to dismiss the modal
   */
  public dismiss(result) {
    this.modalController.dismiss(result);
  }

}
