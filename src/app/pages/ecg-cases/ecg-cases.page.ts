import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { IonReorderGroup, ModalController } from '@ionic/angular';
import { CommonService, FirebaseService, ValidatorService } from 'src/app/providers/providers';
import { SwitchCasePage } from '../switch-case/switch-case.page';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer';

@Component({
  selector: 'app-ecg-cases',
  templateUrl: './ecg-cases.page.html',
  styleUrls: ['./ecg-cases.page.scss'],
})
export class EcgCasesPage implements OnInit, OnDestroy {
  @ViewChild('selectFile') selectFile: any;
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;

  private SideMenuVisibleSubsription;
  public isSideMenuVisible
  // to switch between view and edit/create
  public isDetails = true;
  public isEdit = false;
  // to store the header checkbox value
  public selectAll = false
  public activeCount = 0;
  public loading = true;

  // to store the search text
  public searchText = "";
  public isSubmit = false;
  public submitBtnDisabled = false;
  public creatCaseForm: FormGroup;
  public selectedCase: any = undefined;
  public showDelete = false;
  private changedFromCode = false;
  public maxValue;


  public cases: any = [];
  private extraCases: any = [];
  public attachment: any = {};
  private pageLimit = 100;
  public itemsPerPage = 10;
  public currentPage = 1;
  public totalPage = 0;
  private sequence = [];
  private isaddedbyme = false;
  private isEditOrNew = false;


  constructor(
    private commonService: CommonService,
    private validatorService: ValidatorService,
    private firebaseService: FirebaseService,
    private modalController: ModalController


  ) {
    this.creatCaseForm = this.validatorService.createCaseFormValidator();
    this.SideMenuVisibleSubsription = this.commonService.checkSideMenuVisible().subscribe((value) => {
      this.isSideMenuVisible = value;
    });
    this.getCases();
    this.setSnapshot();
    // console.log('ssdsd');


  }
  ionViewWillEnter() {
    this.commonService.enableMenu(true);
  }




  ngOnInit() {
  }

  ngOnDestroy() {
    this.SideMenuVisibleSubsription.unsubscribe();
  }

  public setSelectedCase(item, i) {
    item['index'] = i + 1;
    this.selectedCase = item;
    this.setIsDetails(true);
  }

  public refreshSelectedCase() {
    // console.log("here");

    const selectedPosition = this.selectedCase ? this.selectedCase.index - 1 : 0;
    const casesLength = this.cases ? this.cases.length : 0
    if (selectedPosition == 0 && casesLength > 0) {
      let index = this.itemsPerPage * (this.currentPage - 1);
      this.setSelectedCase(this.cases[index], index);
    } else if (casesLength > 0 && selectedPosition < casesLength) {
      this.setSelectedCase(this.cases[selectedPosition], selectedPosition);
    } else if (casesLength > 0 && selectedPosition == casesLength) {
      this.setSelectedCase(this.cases[selectedPosition - 1], selectedPosition - 1);
    } else {
      this.selectedCase = undefined;
    }
  }

  /**
   * setSnapshot
   */
  public setSnapshot() {
    this.firebaseService.setTotalSnapshot((doc) => {
      this.sequence = doc.sequence;
      this.activeCount = this.sequence.length;
      const total = this.activeCount / this.itemsPerPage;
      const remainder = this.activeCount % this.itemsPerPage;

      this.totalPage = remainder ? parseInt(total.toString()) + 1 : total;

      if ((this.currentPage > this.totalPage) && this.totalPage > 0) {
        this.currentPage = this.totalPage;
      }
      this.refreshCases('existing');

    })

  }

  /**
   * getCases - function to get the cases from firebase
   */
  public getCases() {
    // this.loading = true;
    this.commonService.showLoading();
    this.selectedCase = undefined;
    this.attachment = undefined;
    this.firebaseService.getCases(false, this.pageLimit, false).then((res: any) => {
      res.forEach(tempDoc => {
        tempDoc.attachments.forEach(element => {
          this.firebaseService.getMediaUrl(element).then((url) => {
            tempDoc.imageUrl = url;
          })
            .catch((err) => {
              console.error(err);
            });
        });
      });
      this.cases = res;
      if (this.cases.length > 0) {
        this.refreshSelectedCase();
      }
      this.commonService.hideLoading();
      this.setNewSnapshot();
      this.loading = false;
    })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   * setNewSnapshot
   */
  public setNewSnapshot() {

    this.firebaseService.setNewSnapshot((doc) => {
      this.isEditOrNew = true;
      // console.log(2);
      let found = false;
      let existingIndex = 0;
      this.cases.every((element, index) => {
        if (doc.firebaseId == element.firebaseId) {
          found = true;
          existingIndex = index;
          this.cases.splice(index, 1);
          return false;
        }
        return true;
      });

      // get the media ur of new doc
      // console.log('doc b4', JSON.stringify(doc));
      this.firebaseService.getMediaUrl(doc.attachments[0]).then((url) => {
        doc.imageUrl = url;
        if (!found) {
          // console.log('doc', doc);

          this.cases.push(doc);
          // show msg if added by this user
          if (this.isaddedbyme) {
            this.isaddedbyme = false;
            this.commonService.translateText('caseAdded').subscribe((msg) => {
              this.commonService.showAlert('Success', msg);
            });
          }

        } else {
          this.cases.push(doc);
          // this.cases[existingIndex] = { ...this.cases[existingIndex], ...doc };
          // show msg  this.cases.push(doc);if added by this user
          if (this.isaddedbyme) {
            this.isaddedbyme = false;
            this.commonService.translateText('caseEdited').subscribe((msg) => {
              this.commonService.showAlert('Success', msg);
            });
          }
        }
        this.setIsDetails(true);
        // this.refreshSelectedCase();
        // console.log(3);
        this.refreshCases('new');
        this.commonService.hideLoading();
        // this.getCases();
      })




      // this.refreshCases();

    })

  }

  public loadData = (event) => {

    this.firebaseService.getCases(false, this.pageLimit, true).then((res: any) => {
      if (res.length > 0) {
        res.forEach(tempDoc => {
          tempDoc.attachments.forEach(element => {
            this.firebaseService.getMediaUrl(element).then((url) => {
              tempDoc.imageUrl = url;
            })
              .catch((err) => {
                console.error(err);
              });
          });
        });
        this.cases = [...this.cases, ...res]
        event.target.complete();
      } else {
        event.target.complete();
        // event.target.disabled = true;
      }
    })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   *  convenience getter for easy access to form fields
   */
  get f() {
    return this.creatCaseForm.controls;
  }


  /**
   * setIsDetails - function to set the is details value
   */
  public setIsDetails(value) {
    this.isDetails = value;
    this.creatCaseForm.reset();
    this.submitBtnDisabled = false;
    this.isSubmit = false;
    this.isEdit = false;
    this.attachment = undefined;
    this.setMaxValue(this.activeCount + 1, true);
  }

  private setMaxValue(max, setValue) {
    let caseNumber = this.creatCaseForm.get('caseNumber');
    caseNumber.setValidators(Validators.compose([
      Validators.required,
      Validators.max(max),
      Validators.min(1),
      Validators.pattern(/^[0-9]*$/),
    ]));
    caseNumber.updateValueAndValidity();
    if (setValue) {
      caseNumber.setValue(max);
    }
    this.maxValue = max;

  }

  /**
    * Function to check the value of main checkbox in header bar
    */
  public checkBox = () => {
    if (this.changedFromCode) {
      return;
    }
    this.cases.forEach(element => {
      // if (element.show) {
      element.isChecked = this.selectAll;
      // }
    });
    this.checkifChecked();
  }
  /**
    * Function to to be executed on click of item
    */
  public itemCheckBox = (event) => {
    if (this.selectAll) {
      this.selectAll = false
      this.changedFromCode = true;
      setTimeout(() => {
        this.changedFromCode = false;
      }, 1000);
    }
    event.stopPropagation();
  }



  /**
   * checkifChecked
   */
  public checkifChecked() {
    this.showDelete = false;
    for (let i = 0; i < this.cases.length; i++) {
      if (this.cases[i].isChecked) {
        this.showDelete = true;
        break;
      }

    }

  }

  public refreshCases(from) {
    // console.log(1);
    const existingCases = [...this.cases, ...this.extraCases];
    const newCases = [];
    const casesNotFetched = [];
    this.sequence.forEach(element => {
      existingCases.every((v, index) => {
        if (v.firebaseId == element) {
          newCases.push(v);
          existingCases.splice(index, 1);
          return false;
        }
        // Make sure you return true. If you don't return a value, `every()` will stop.
        return true;
      });

    });

    this.extraCases = existingCases;
    this.cases = newCases;
    this.refreshSelectedCase();
    // console.log('Cases length', this.cases.length);
    // console.log('ExtraCases length', existingCases.length);


  }

  public absoluteIndex(indexOnPage: number): number {
    return this.itemsPerPage * (this.currentPage - 1) + indexOnPage;
  }

  /**
   *
   * @param ev Function executed after an item has been reordered
   */
  public reorderItems(ev) {
    const from = this.absoluteIndex(ev.detail.from);
    const to = this.absoluteIndex(ev.detail.to);
    this.commonService.showLoading();
    const newCases = [...this.cases];
    const itemMove = newCases.splice(from, 1)[0];
    newCases.splice(to, 0, itemMove);
    ev.detail.complete();
    this.cases = newCases;
    // this.refreshSelectedCase();
    // this.refreshCases();
    this.firebaseService.reorderCase(to, from).then(() => {
      this.commonService.hideLoading();
    })
      .catch((err) => {
        console.error(err);
      });
  }

  public reOrderLocally(to, from) {
    const itemMove = this.cases.splice(from, 1)[0];
    this.cases.splice(to, 0, itemMove);
  }

  trackFn(index) {
    return index;
  }

  /**
   * setNewOrder - function to set the new order value on which sorting is performed
   */
  public setNewOrder(index, ev) {
    ev.detail.complete();
  }




  /**
   * editCaseSubmit
   */
  public editCaseSubmit(uploadUrl, dimensions) {
    const payload = this.creatCaseForm.value;
    payload['uploadUrl'] = uploadUrl;
    payload['dimensions'] = dimensions;
    payload['firebaseId'] = this.selectedCase.firebaseId;
    payload['oldCaseNumber'] = this.selectedCase.index;
    this.isaddedbyme = true;
    this.firebaseService.editCase(payload).then((response) => {
      // this.firebaseService.getMediaUrl(payload.uploadUrl).then((url) => {
      //   payload.imageUrl = url;
      //   this.commonService.hideLoading();
      // this.commonService.translateText('caseEdited').subscribe((msg) => {
      //   this.commonService.showAlert('Success', msg);
      // });
      // this.setIsDetails(true);
      //   let Case = {
      //     details: payload.details,
      //     result: payload.result,
      //     // nextStep: payload.nextStep,
      //     attachments: [payload.uploadUrl],
      //     imageUrl: payload.imageUrl
      //   };
      //   this.selectedCase = { ...this.selectedCase, ...Case };
      //   this.cases[this.selectedCase.index - 1] = this.selectedCase;
      //   if (response) {
      //     this.reOrderLocally(payload.caseNumber - 1, payload.oldCaseNumber - 1);
      //   }
      // this.refreshSelectedCase();
      //   this.refreshCases();
      //   // this.getCases();
      // })
      //   .catch((err) => {
      //     console.error(err);
      //   });




    })
      .catch((err) => {
        console.error(err);
      })
  }
  /**
   * submit - function to be executed on press of submit button
   */
  public submit() {
    if (this.isEdit) {
      // edit Related code
      this.isSubmit = true;
      this.submitBtnDisabled = true;

      this.commonService.trimForm(this.creatCaseForm);
      if (this.creatCaseForm.valid && this.attachment) {
        this.commonService.showLoading();
        if (this.attachment.fromFirebase) {
          this.editCaseSubmit(this.attachment['file'], this.attachment.dimensions);
        } else {
          this.firebaseService.uploadImage(this.attachment['file'], this.selectedCase.attachments[0]).then((uploadUrl) => {
            this.editCaseSubmit(uploadUrl, this.attachment.dimensions);
          })
            .catch((err) => {
              console.error(err);
            })
        }
      } else {
        this.submitBtnDisabled = false;
      }


    } else {
      this.isSubmit = true;
      this.submitBtnDisabled = true;

      this.commonService.trimForm(this.creatCaseForm);
      if (this.creatCaseForm.valid && this.attachment) {
        this.commonService.showLoading();
        this.firebaseService.uploadImage(this.attachment['file'], false).then((uploadUrl) => {
          const payload = this.creatCaseForm.value;
          payload['uploadUrl'] = uploadUrl;
          payload['dimensions'] = this.attachment.dimensions;
          this.isaddedbyme = true;
          this.firebaseService.createCase(payload).then((response) => {
            // this.firebaseService.getMediaUrl(payload.uploadUrl).then((url) => {
            //   payload.imageUrl = url;
            //   this.commonService.hideLoading();
            //   this.commonService.translateText('caseAdded').subscribe((msg) => {
            //     this.commonService.showAlert('Success', msg);
            //   });
            //   this.setIsDetails(true);
            //   let Case = {
            //     details: payload.details,
            //     result: payload.result,
            //     // nextStep: payload.nextStep,
            //     attachments: [payload.uploadUrl],
            //     imageUrl: payload.imageUrl,
            //     firebaseId: response
            //   };
            //   this.cases.splice(payload.caseNumber - 1, 0, Case);
            //   this.refreshSelectedCase();
            //   // this.refreshCases();
            //   // this.getCases();
            // })
            //   .catch((err) => {
            //     console.error(err);
            //   });
            // this.getCases();
          })
            .catch((err) => {
              console.error(err);
            })
        })
          .catch((err) => {
            console.error(err);
          })
      } else {
        this.submitBtnDisabled = false;
      }
    }
  }

  /**
   * attachImage
   */
  public attachImage() {
    if (this.isEdit || this.attachment) {
      this.commonService.showConfirmation(
        "Confirm",
        "ECG report is already attached, do you want to replace it?",
        () => {
          this.selectFile.nativeElement.click();

        }, () => {

        }, "Yes");
    } else {
      this.selectFile.nativeElement.click();
    }

  }


  private isFileImage(file) {
    return file && file['type'].split('/')[0] === 'image';
  }

  /**
   * name
   */
  public handleSelectFile = (e) => {
    e.preventDefault();
    var file = e.target.files[0];
    // handleFireBaseUpload(file);
    var tempMediaType = "image";
    tempMediaType = file != null ? file.type.split("/")[0] : tempMediaType;
    var tempSize = 0;
    tempSize = file.size / 1024 / 1024;
    const isImage = this.isFileImage(file);

    if (!isImage) {
      this.commonService.showAlert('Error', "Invalid file type, Please select image file.");
      this.selectFile.nativeElement.value = "";

      return;
    } else if (tempSize > 5) {
      this.commonService.showAlert('Error', "Please select file below 5 Mb.");
      this.selectFile.nativeElement.value = "";

      return;
    }

    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = (e) => {

      // Calculating image size - height and width for use in mobile app
      //Initiate the JavaScript Image object.
      var image = new Image();
      //Set the Base64 string return from FileReader as source.
      image.src = e.target.result as string;
      image.onload = () => {
        this.attachment = {
          file: file,
          imagePreviewUrl: reader.result,
          mediaType: tempMediaType,
          imgSize: tempSize,
          dimensions: {
            height: image.height,
            width: image.width,
          }
        };
        // console.log('Attachment', this.attachment);
      };
    };
    this.selectFile.nativeElement.value = "";


  };

  /**
   * deleteCase - function to delete the selected case from Firebase
   */
  public deleteCase() {
    this.commonService.showConfirmation(
      "Confirm",
      "Are you sure you want to delete this case(s)",
      () => {
        this.commonService.showLoading();
        this.firebaseService.deletCase(this.selectedCase).then(() => {
          this.commonService.hideLoading();
          this.commonService.translateText('caseDeleted').subscribe((msg) => {
            this.commonService.showAlert('Success', msg);
          });
          // this.cases.splice(this.selectedCase.index - 1, 1);
          this.selectedCase = undefined;
          // this.refreshSelectedCase();
          // this.refreshCases();
          // this.getCases();
        })

      }, () => {
      });
  }

  /**
   * deleteAllchecked- function to delete all the selected cases
   */
  public deleteAllchecked() {
    this.commonService.showConfirmation(
      "Confirm",
      "Are you sure you want to delete this case(s)",
      () => {
        this.commonService.showLoading();
        let promises = this.cases.map((element) => {
          if (element.isChecked) {
            return this.firebaseService.deletCase(element);
          }
        });
        Promise.all(promises).then(() => {
          // this.getCases();

          // for (let i = 0; i < this.cases.length;) {
          //   if (this.cases[i].isChecked) {
          //     this.cases.splice(i, 1);
          //   } else {
          //     i++;
          //   }
          // }
          this.commonService.hideLoading();
          this.commonService.translateText('casesDeleted').subscribe((msg) => {
            this.commonService.showAlert('Success', msg);
          });
          this.showDelete = false;
          this.selectAll = false;
          // this.refreshSelectedCase();
          // this.refreshCases();
        })
          .catch((err) => {
            console.error(err);

          })
      }, () => {
        // pressed cancel Do nothing
      });

  }

  /**
   * Function to edit the selected case
   */
  public editCase() {
    this.setIsDetails(false);
    this.isEdit = true;
    this.creatCaseForm.setValue({
      details: this.selectedCase.details,
      result: this.selectedCase.result,
      caseNumber: this.selectedCase.index,
      nextStep: this.selectedCase.nextStep ? this.selectedCase.nextStep :'',
      references: this.selectedCase.references ? this.selectedCase.references :'',
    });
    this.attachment = {
      fromFirebase: true,
      file: this.selectedCase.attachments[0],
      imagePreviewUrl: this.selectedCase.imageUrl,
      mediaType: '',
      imgSize: '',
      dimensions: this.selectedCase.dimensions
    };
    this.setMaxValue(this.activeCount, false);
  }

  public checkReorder() {
    if (this.searchText && this.searchText.length) {
      this.reorderGroup.disabled = true;
    } else {
      this.reorderGroup.disabled = false;
    }
  }

  /**
   * pageChanged
   */
  public pageChanged(e) {
    // console.log(e);
    this.currentPage = e;
  }

  /**
   * next
   */
  public next() {
    if (this.currentPage < this.totalPage) {
      this.currentPage = this.currentPage + 1;
    }
  }

  /**
   * prev
   */
  public prev() {
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
    }

  }

  public openModal = async () => {

    const optionModal = await this.modalController.create({
      component: SwitchCasePage,
      componentProps: {
        maxValue: this.activeCount

      },
      cssClass: 'switch-case',
      backdropDismiss: false
    });

    optionModal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data !== null) {
        // console.log('dataReturned', dataReturned);


      }
    });
    return await optionModal.present();

  }

  async openViewer(selectedCase) {
    const modal = await this.modalController.create({
      component: ViewerModalComponent,
      componentProps: {
        src: selectedCase.imageUrl ? selectedCase.imageUrl : selectedCase.imagePreviewUrl,
        slideOptions:{
          centeredSlides: true,
          passiveListeners: false,
          zoom: { enabled: false },
          allowSlideNext:false,
          allowSlidePrev:false,
          autoHeight:true,
          setWrapperSize:true,
          height:selectedCase.dimensions ? selectedCase.dimensions.height : null,
          width:selectedCase.dimensions ? selectedCase.dimensions.width: null,
          // touchEventsTarget:"wrapper"
        }
      },
      cssClass: ['ion-img-viewer', 'custom-modal-image-viewer'] ,
      keyboardClose: true,
      showBackdrop: true,
    });
    // modal.style.setProperty('--height', selectedCase.dimensions.height);
    // modal.style.setProperty('--width', selectedCase.dimensions.width);
    // modal.style.height =selectedCase.dimensions ? selectedCase.dimensions.height : null;
    // modal.style.width =selectedCase.dimensions ? selectedCase.dimensions.width : null;
    await modal.present();
    // console.log('return');

    var x = document.getElementsByClassName("custom-modal-image-viewer") ;
    let mod = x[0] as HTMLBaseElement;
    mod.style.setProperty('--height', selectedCase.dimensions.height+'px');
    mod.style.setProperty('--width', selectedCase.dimensions.width+'px');
    mod.style.setProperty('display', 'flex');

    return ;
  }


}