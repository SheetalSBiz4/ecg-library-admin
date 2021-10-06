import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { IonReorderGroup, ModalController } from '@ionic/angular';
import { CommonService, FirebaseService, ValidatorService } from 'src/app/providers/providers';
import { SwitchCasePage } from '../switch-case/switch-case.page';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ecg-cases',
  templateUrl: './ecg-cases.page.html',
  styleUrls: ['./ecg-cases.page.scss'],
})
export class EcgCasesPage implements OnInit, OnDestroy {
  @ViewChild('selectFile') selectFile: any;
  @ViewChild('selectRefrenceFile') selectRefrenceFile: any;
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
  public filterCases: any = [];
  public filterActiveCases: any ;
  private extraCases: any = [];
  public attachment: any = {};
  public rationaleAttachment: any = {};
  public skillLevel: any;
  private pageLimit = 100;
  public itemsPerPage = 10;
  public currentPage = 1;
  public totalPage = 0;
  private sequence = [];
  private isaddedbyme = false;
  private isEditOrNew = false;
  public isPublish: boolean = false;
  public attachmentName: any;
  public rationaleAttachmentName: "Attach Rationale Report"
  public ext = "" ;
  public filename = "";
  public rationaleFileName = "";
  public rationaleExt = "";
  public skillLevelOption = [
    {name: 'Beginner', value:'Beginner'},
    {name: 'Intermediate', value:'Intermediate'},
    {name: 'Advanced', value:'Advanced'},
    {name: 'Expert', value:'Expert'}
  ];
  public isFilterOpen: boolean = false;
  public isBeginner: boolean = true;
  public skillLevelValue = 'Beginner';
  public attachmentImageUrl: "";
  public rationaleAttachmentImageUrl = "";
  public isReferenceAttachSelected: boolean = false;
  public isAnswerImage = false;
  public supplimentLinkUrl = [];
  public referencesLinkUrl = []

  constructor(
    private router: Router,
    private commonService: CommonService,
    private validatorService: ValidatorService,
    private firebaseService: FirebaseService,
    private modalController: ModalController
  ) {
    this.creatCaseForm = this.validatorService.createCaseFormValidator();
    this.SideMenuVisibleSubsription = this.commonService.checkSideMenuVisible().subscribe((value) => {
      this.isSideMenuVisible = value;
    });   

    this.getCases('Beginner');
    this.setSnapshot('Beginner');
    // console.log('ssdsd');
  }
  ionViewWillEnter() {
    this.skillLevel = 'Beginner';
    var d = document.getElementById('Beginner');
    d.className = "filter-label-cls-active";
  }

  openForm(isFilterOpen) {
    console.log("openForm....");
    if(!this.isFilterOpen) {    
      document.getElementById("myForm").style.display = "block";
      this.isFilterOpen = true;
    } else {
      document.getElementById("myForm").style.display = "none";
      this.isFilterOpen = false;
    }
  }

  // change skill level restriction
  changeSkill (event) {
    var skillLevelSelected = event.target.value;
    console.log("skillLevelValue...", this.skillLevelValue);
    console.log("skillLevelSelected...", skillLevelSelected);
    if(this.skillLevelValue != skillLevelSelected){
      event.target.value = this.skillLevelValue;
      this.commonService.translateText('selectCurrentSkillLevl').subscribe((msg) => {
        this.commonService.showAlert('Success', msg);
      });
    }
  }

  applyFilter(value) {
    this.searchText = "";
    this.filterActiveCases = false;
    var filterArray = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    if(value) {
      this.skillLevelValue = value;
      var d = document.getElementById(value);
      d.className = "filter-label-cls-active";
    }
    for(let i=0; i<4; i++){
      if(filterArray[i] != value) {
        var d = document.getElementById(filterArray[i]);
        d.className = "filter-label-cls";
      }
    }
    document.getElementById("myForm").style.display = "none";
    this.isFilterOpen = false;
    this.getCases(value);
    this.setSnapshot(value);
  }

  /**
   * logout- function to be executed on press of signout button
   */
 public logout() {
  this.commonService.showConfirmationWithButton(
    "Logout",
    "Are you sure you want to logout?",
    () => {
      console.log("enter 1");      
      this.firebaseService.signOut();
      this.router.navigate(['login'], { replaceUrl: true });
    }, () => {
      console.log("enter 2");
    }, () => {
      console.log("enter 3");
    });
}


  ngOnInit() {
  }

  ngOnDestroy() {
  }

  public setSelectedCase(item, i) {
    item['index'] = i + 1;
    this.selectedCase = item;
    this.setIsDetails(true);
    console.log("this.selectedCase...choose", this.selectedCase);

    // seperate references the multiple link in array
  if(this.selectedCase.references != null) {
    var referencesUrl = this.selectedCase.references;
    console.log('referencesUrl...', referencesUrl);
    
    var referencesLink = referencesUrl.replace(/<[^>]+>/g, '');
    console.log("referencesLink", referencesLink);
    this.referencesLinkUrl = referencesLink.match(/[^\r\n]+/g);

    this.referencesLinkUrl.forEach( (item, index) => {
      if(item == "&nbsp;") {
        this.referencesLinkUrl.splice(index,1);
      } 
      if(item == item.startsWith("https://")){
        this.referencesLinkUrl = referencesUrl.replace(/^https?:\/\//, '');
      }
    });
    console.log("this.referencesLinkUrl..", this.referencesLinkUrl); 
  } else {
    this.selectedCase.references = null;
    this.referencesLinkUrl = this.selectedCase.references;
    console.log("this.referencesLinkUrl..else", this.referencesLinkUrl); 
  }

  // seperate supplement the multiple link in array
  if(this.selectedCase.supplement != null){
    var supplementUrl = this.selectedCase.supplement
    var linkUrl = supplementUrl.replace(/<[^>]+>/g, '');
    console.log("linkUrl", linkUrl);
    this.supplimentLinkUrl = linkUrl.match(/[^\r\n]+/g);
    this.supplimentLinkUrl.forEach( (item, index) => {
      if(item == "&nbsp;"){
        this.supplimentLinkUrl.splice(index,1);
      } 
      if(item == item.startsWith("https://")){
        this.supplimentLinkUrl = linkUrl.replace(/^https?:\/\//, '');
      }
    });
    console.log("this.supplimentLinkUrl..", this.supplimentLinkUrl);
  } else {
    this.selectedCase.supplement = null;
    this.supplimentLinkUrl = this.selectedCase.supplement;
    console.log("this.supplimentLinkUrl..else", this.supplimentLinkUrl);
  }

    if(this.selectedCase.rationaleAttachments[0] != "") {
      this.isAnswerImage = true;
      this.firebaseService.getRationaleMediaUrl(this.selectedCase.rationaleAttachments[0]).then((imageRationaleUrl: any) => {
        this.rationaleAttachmentImageUrl = imageRationaleUrl;
        console.log("rationaleAttachmentImageUrl....111", this.rationaleAttachmentImageUrl);
      })
        .catch((err) => {
          console.error(err);
        }); 
    } else {
      this.isAnswerImage = false;
    }
    
  }

  public refreshSelectedCase() {

    const selectedPosition = this.selectedCase ? this.selectedCase.index - 1 : 0;
    const casesLength = this.cases ? this.cases.length : 0
    console.log("refreshSelectedCase....this.selectedCase...", this.selectedCase);
    
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
  public setSnapshot(filterValue) {
    this.firebaseService.setTotalSnapshot(filterValue, (doc) => {
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
  public getCases(filterValue) {
    // this.loading = true;
    this.commonService.showLoading();
    this.selectedCase = undefined;
    this.attachment = undefined;
    this.rationaleAttachment = undefined;
    this.firebaseService.getCases(filterValue, false, this.pageLimit, false).then((res: any) => {
      // console.log("res...", res);
      this.activeCount = res.length;

      res.forEach(tempDoc => {
        // console.log("tempDoc..", tempDoc);
        this.attachmentName = tempDoc.attachments[0];
        if(this.attachmentName.filename){
          this.attachmentName = this.attachmentName.filename;
        }
        this.ext = this.attachmentName.split('.').pop();
        this.filename =  `${this.attachmentName.split('.')[0]}`;
        // console.log('filename...', this.filename);
        // console.log('ext...', this.ext);

        this.rationaleAttachmentName = tempDoc.rationaleAttachments[0];
        this.rationaleExt = this.rationaleAttachmentName.split('.').pop();
        this.rationaleFileName =  `${this.rationaleAttachmentName.split('.')[0]}`;
        // console.log('filename...', this.rationaleFileName);
        // console.log('ext...', this.rationaleExt);

          if(tempDoc.rationaleAttachments){
            tempDoc.rationaleAttachments.forEach(RationaleElement => {
            this.firebaseService.getRationaleMediaUrl(RationaleElement).then((rationaleUrl: any) => {
              tempDoc.imageRationaleUrl = rationaleUrl;
            })
              .catch((err) => {
                this.commonService.hideLoading();
                this.loading = false;
                // console.error(err);
              });
          });          
          // console.log("tempDoc....111", tempDoc);
        }

        if(tempDoc.attachments) {
          tempDoc.attachments.forEach(element => {
          this.firebaseService.getMediaUrl(element).then((url: any) => {
            tempDoc.imageUrl = url;
          })
            .catch((err) => {
              console.error(err);
            });
          });
        }    
        this.selectedCase = tempDoc; 
        // console.log("tempDoc....222", tempDoc);        
     });        
      this.cases = res;
      if (this.cases.length > 0) {
        // console.log("this.selectedCase************888888", this.selectedCase);        
        this.refreshSelectedCase();
      }
      this.commonService.hideLoading();
      this.setNewSnapshot(filterValue);
      this.loading = false;
    })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   * setNewSnapshot
   */
  public setNewSnapshot(filterValue) {
    this.firebaseService.setNewSnapshot(filterValue, (doc) => {
      this.isEditOrNew = true;
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
      console.log("doc...", doc);      
      // get the media ur of new doc
      // console.log('doc b4', JSON.stringify(doc));
      this.firebaseService.getMediaUrl( doc.attachments[0]).then((url: any) => {
        doc.imageUrl = url;
        console.log('doc*****************>', doc);
        if (!found) {
          this.cases.push(doc);
          console.log("Doc..------>111", doc);          
          // show msg if added by this user
          if (this.isaddedbyme) {
            this.isaddedbyme = false;
            this.commonService.hideLoading();
            this.commonService.translateText('caseAdded').subscribe((msg) => {
              this.commonService.showAlert('Success', msg);
            });
          }
        } else {
          this.cases.push(doc);
          if (this.isaddedbyme) {
            this.isaddedbyme = false;
            this.commonService.hideLoading();
            this.loading = false;
            console.log("this is 1st call...");
            this.commonService.translateText('caseEdited').subscribe((msg) => {
              this.commonService.showAlert('Success', msg, () => {
                this.refreshCases('new');
                this.commonService.hideLoading();
              });
            });
          }
        }
        this.setIsDetails(true);
        this.refreshCases('new');
        this.commonService.hideLoading();
      })

      this.firebaseService.getRationaleMediaUrl( doc.rationaleAttachments[0]).then((rationaleUrl: any) => {
        doc.rationaleImageUrl = rationaleUrl;
        console.log('doc******rationale***********>', doc);
        if (!found) {
          this.cases.push(doc);
          console.log("Doc..rationale------>111", doc);
          // show msg if added by this user
          if (this.isaddedbyme) {
            this.isaddedbyme = false;
            this.commonService.hideLoading();
            this.commonService.translateText('caseAdded').subscribe((msg) => {
              this.commonService.showAlert('Success', msg);
            });
          }
        } else {
          this.cases.push(doc);
          if (this.isaddedbyme) {
            this.isaddedbyme = false;
            this.commonService.hideLoading();
            console.log("this is 2nd call...");
            
            this.commonService.translateText('caseEdited').subscribe((msg) => {
              this.commonService.showAlert('Success', msg, () => {
                this.refreshCases('new');
              });
            });
          }
        }
        this.setIsDetails(true);
        this.commonService.hideLoading();
      })
      // this.refreshCases(filterValue);
    })

  }

  public loadData = (event) => {

    this.firebaseService.getCases("Beginner", false, this.pageLimit, true).then((res: any) => {
      if (res.length > 0) {
        res.forEach(tempDoc => {
          tempDoc.attachments.forEach(element => {
            tempDoc.rationaleAttachments.forEach(RationaleElement => {
              this.firebaseService.getMediaUrl( element).then((url: any) => {                
                tempDoc.imageUrl = url;
                // tempDoc.imageUrl = url;
            })
              .catch((err) => {
                console.error(err);
              });
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
    this.rationaleAttachment = undefined;
    this.skillLevel = "";
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
    
    //Show isPublish=false at the last
    var newCasesArray = this.cases;
      var caseArray = [];
      this.cases = [];

      newCasesArray.map((newCasesArray, index) => {
        const indexNumber = index + 1;
        const indexname = "case " + indexNumber;
        if (newCasesArray.isPublish) {
            caseArray.push(newCasesArray);
        }
        console.log("caseArray...", caseArray);        
      })
      newCasesArray.map((newCasesArray, index) => {
        const indexNumber = index + 1;
        const indexname = "case " + indexNumber;
        if (newCasesArray.isPublish != true) {
          newCasesArray.isPublish = false;
            caseArray.push(newCasesArray);
        }
        console.log("caseArray...", caseArray);        
      })
      this.cases = caseArray;
      console.log("res...after change...", this.cases);

    console.log("this.cases..refreshCases", this.cases);
    /////////////////////////////////////////////
    this.refreshSelectedCase();
  }

  public absoluteIndex(indexOnPage: number): number {
    return this.itemsPerPage * (this.currentPage - 1) + indexOnPage;
  }

  /**
   *
   * @param ev Function executed after an item has been reordered
   */
  public reorderItems(skillLevelValue, ev) {
    const from = this.absoluteIndex(ev.detail.from);
    const to = this.absoluteIndex(ev.detail.to);
    this.commonService.showLoading();
    const newCases = [...this.cases];
    const itemMove = newCases.splice(from, 1)[0];
    newCases.splice(to, 0, itemMove);
    ev.detail.complete();
    this.cases = newCases;   
    this.firebaseService.reorderCase(skillLevelValue, to, from).then(() => {
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
  public editCaseSubmit(isUploadUrl, uploadUrl, dimensions) {
    const payload = this.creatCaseForm.value;
    console.log("payload...", payload);    
    
    if(isUploadUrl) {
      if(uploadUrl.filename) {
        payload['uploadUrl'] = uploadUrl.filename;      
      } else {
        payload['uploadUrl'] = uploadUrl;
      }
      payload['dimensions'] = dimensions;
    } else {
      payload['rationaleUploadUrl'] = uploadUrl;
      payload['dimensionsRationale'] = dimensions;
    }
    payload['firebaseId'] = this.selectedCase.firebaseId;
    payload['oldCaseNumber'] = this.selectedCase.index;
    this.isaddedbyme = true;
    this.firebaseService.editCase(payload).then((response) => {
      this.getCases(payload.skillLevel);
      this.setSnapshot(payload.skillLevel);
      this.applyFilter(payload.skillLevel);
    })
      .catch((err) => {
        console.error(err);
      })
  }
  /**
   * submit - function to be executed on press of submit button
   */
  public submit() {
    if(this.f.isPublish.value) {
      this.creatCaseForm.value.isPublish = true;
    } else {
      this.creatCaseForm.value.isPublish = false;
    }
    console.log("this.creatCaseForm.value..", this.creatCaseForm.value.isPublish);
    if (this.isEdit) {
      // edit Related code
      this.isSubmit = true;
      this.submitBtnDisabled = true;

      this.commonService.trimForm(this.creatCaseForm);
      if(this.f.isPublish.value) {
        this.creatCaseForm.value.isPublish = true;
      } else {
        this.creatCaseForm.value.isPublish = false;
      }

      console.log("this.selectedCase...", this.selectedCase);
      
      console.log("this.creatCaseForm.value....", this.creatCaseForm.value);
      
      if (this.creatCaseForm.valid && this.attachment) {
        this.commonService.showLoading();
        if (this.attachment.fromFirebase) {
          this.editCaseSubmit( true, this.attachment['file'], this.attachment.dimensions);
        } else {
          this.firebaseService.uploadImage(this.attachment['file'], "", this.selectedCase.attachments[0]).then((uploadUrl) => {
            this.editCaseSubmit(true, uploadUrl, this.attachment.dimensions);
          })
            .catch((err) => {
              console.error(err);
            })
        }
      } else {
        this.submitBtnDisabled = false;
      }

      if (this.creatCaseForm.valid && this.rationaleAttachment) {
        this.commonService.showLoading();
        if (this.rationaleAttachment.fromFirebase) {
          this.editCaseSubmit(false, this.rationaleAttachment['file'], this.rationaleAttachment.dimensions);
        } else {
          this.firebaseService.uploadRationaleImage( this.rationaleAttachment['file'], this.selectedCase.rationaleAttachments[0]).then((uploadUrl) => {
            this.editCaseSubmit(false, uploadUrl, this.rationaleAttachment.dimensions);
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
      // this.submitBtnDisabled = true;
      if(this.f.isPublish.value) {
        this.creatCaseForm.value.isPublish = true;
      } else {
        this.creatCaseForm.value.isPublish = false;
      }
      this.commonService.trimForm(this.creatCaseForm);
      var payload = this.creatCaseForm.value; 
      if(this.creatCaseForm.valid && this.attachment){
        this.commonService.showLoading();
        
        if(this.rationaleAttachment == null || this.rationaleAttachment == "" || this.rationaleAttachment == undefined) {
          
        this.commonService.showLoading();
            this.firebaseService.uploadImage(this.attachment['file'], "", false).then((uploadUrl:any) => {
              console.log("uploadUrl...", uploadUrl);
              var data = uploadUrl;
                        
              payload['uploadUrl'] = uploadUrl.filename;
              payload['dimensions'] = this.attachment.dimensions;
              payload['uploadRationaleUrl'] = uploadUrl.rationaleFileName;
              if(uploadUrl.rationaleFileName) {
                payload['dimensionsRationale'] = this.rationaleAttachment.dimensions;
              } else {
                // this.rationaleAttachment.dimensions = {height: 0, width: 0};
                payload['dimensionsRationale'] = "";
              }
              console.log("attachment ... payload..", payload);
              console.log("payload...", payload);
              this.firebaseService.createCase(payload).then((response) => {            
                this.getCases(payload.skillLevel);
                this.setSnapshot(payload.skillLevel);
                this.applyFilter(payload.skillLevel);
                this.setIsDetails(true);
              })
                .catch((err) => {
                  console.error("rationaleAttachment...err..",err);
                })
                .catch((err) => {
                  console.error(err);
                })              
              this.isaddedbyme = true;
            })
        } else {
          this.firebaseService.uploadImage(this.attachment['file'], this.rationaleAttachment['file'], false).then((uploadUrl:any) => {
            console.log("uploadUrl...", uploadUrl);
            var data = uploadUrl;
                      
            payload['uploadUrl'] = uploadUrl.filename;
            payload['uploadRationaleUrl'] = uploadUrl.rationaleFileName;
            payload['dimensions'] = this.attachment.dimensions;
            payload['dimensionsRationale'] = this.rationaleAttachment.dimensions;
            console.log("attachment ... payload..", payload);
            console.log("payload...", payload);
            this.firebaseService.createCase(payload).then((response) => {
              this.getCases(payload.skillLevel);
              this.setSnapshot(payload.skillLevel);
              this.applyFilter(payload.skillLevel);
              this.setIsDetails(true);
            })
              .catch((err) => {
                console.error("rationaleAttachment...err..",err);
              })
              .catch((err) => {
                console.error(err);
              })              
            this.isaddedbyme = true;
          })
        }
          // if (this.rationaleAttachment) {
          //   this.commonService.showLoading();
          //   this.firebaseService.uploadRationaleImage(this.rationaleAttachment['file'], false).then((uploadUrl) => {
              
          //     console.log("rationaleAttachment ... payload..", payload);
          //     console.log("payload...", payload);
          //     this.firebaseService.createCase(payload).then((response) => {       
                           
          //       this.getCases(payload.skillLevel);
          //       this.setSnapshot(payload.skillLevel);
          //       this.applyFilter(payload.skillLevel);
          //       this.setIsDetails(true);
          //     })
          //       .catch((err) => {
          //         console.error("rationaleAttachment...err..",err);
          //       })
          //     this.isaddedbyme = true;
          //   })
          //     .catch((err) => {
          //       console.error("rationaleAttachment...err", err);
          //     })
          // }
          
      
    } else {
        this.submitBtnDisabled = false;
      }
      
    }
  }

  /**
   * attachImage
   */
  public attachImage() {
    if (this.isEdit || this.attachment ) {      
        // this.commonService.showAlert("ECG Library", "Coming Soon!");
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

  /**
   * attach References Image
   */
   public attachReferencesImage() {
    if (this.isEdit && this.isAnswerImage == true) {      
      // this.commonService.showAlert("ECG Library", "Coming Soon!");
      this.commonService.showConfirmation(
        "Confirm",
        "ECG report is already attached, do you want to replace it?",
        () => {
          this.selectRefrenceFile.nativeElement.click();
          this.isReferenceAttachSelected = true;
        }, () => {

        }, "Yes");
    } else {
      this.isReferenceAttachSelected = true;
      this.selectRefrenceFile.nativeElement.click();
    }

  }

  // link redirection
  redirectToWeb (link) {
    var linkUrl = link.replace(/<[^>]+>/g, '');
    if(linkUrl.startsWith("http://") || linkUrl.startsWith("https://")) {
      window.open(linkUrl, "_blank");
    } else {
      window.open("http://" + linkUrl, "_blank");
    }
  }

  private isFileImage(file) {
    return file && file['type'].split('/')[0] === 'image';
  }

  public handleSelectRefrenceFile = (e) => {
    if(this.isReferenceAttachSelected) {
      this.isAnswerImage = true;
    }
    e.preventDefault();
    var file = e.target.files[0];
    var tempMediaType = "image";
    tempMediaType = file != null ? file.type.split("/")[0] : tempMediaType;
    var tempSize = 0;
    tempSize = file.size / 1024 / 1024;
    const isImage = this.isFileImage(file);

    if (!isImage) {
      this.commonService.showAlert('Error', "Invalid file type, Please select image file.");
      this.selectRefrenceFile.nativeElement.value = "";
      return;
    } else if (tempSize > 5) {
      this.commonService.showAlert('Error', "Please select file below 5 Mb.");
      this.selectRefrenceFile.nativeElement.value = "";
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
        this.rationaleAttachment = {
          file: file,
          imagePreviewUrl: reader.result,
          mediaType: tempMediaType,
          imgSize: tempSize,
          dimensions: {
            height: image.height,
            width: image.width,
          }
        };
      };
    };
    this.selectRefrenceFile.nativeElement.value = "";
  };

  /**
   * name
   */
  public handleSelectFile = (e) => {
    e.preventDefault();
    var file = e.target.files[0];
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
          this.selectedCase = undefined;
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
          this.commonService.hideLoading();
          this.commonService.translateText('casesDeleted').subscribe((msg) => {
            this.commonService.showAlert('Success', msg);
          });
          this.showDelete = false;
          this.selectAll = false;
        })
          .catch((err) => {
            console.error(err);

          })
      }, () => {
        // pressed cancel Do nothing
      });

  }


  public publishClick () {
    console.log("this.f.isPublish.value..", this.f.isPublish.value);
    this.f.isPublish.setValue(!this.f.isPublish.value);
    // this.isPublish = !this.isPublish;
  }

  /**
   * Function to edit the selected case
   */
  public editCase() {
    this.setIsDetails(false);
    this.isEdit = true;

    console.log("this.selectedCase.rationaleAttachments[0]...", this.selectedCase.rationaleAttachments[0]);
    
    this.firebaseService.getRationaleMediaUrl(this.selectedCase.rationaleAttachments[0]).then((imageRationaleUrl) => {      
      this.selectedCase.rationaleImageUrl = imageRationaleUrl;
      console.log("imageRationaleUrl....", this.selectedCase.rationaleImageUrl);
    })
      .catch((err) => {
        console.error(err);
      });

    console.log("this.selectedCase...editcase...", this.selectedCase);

    this.creatCaseForm.setValue({
      caseCode: this.selectedCase.caseCode,
      skillLevel: this.selectedCase.skillLevel,
      supplement: this.selectedCase.supplement,
      isPublish: this.selectedCase.isPublish,

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
    this.rationaleAttachment = {
      fromFirebase: true,
      file: this.selectedCase.rationaleAttachments[0],
      imagePreviewUrl: this.selectedCase.rationaleImageUrl,
      mediaType: '',
      imgSize: '',
      dimensions: this.selectedCase.dimensions
    };

    this.rationaleAttachment.imagePreviewUrl = this.selectedCase.rationaleImageUrl;

    console.log("this.rationaleAttachment.imagePreviewUrl...", this.rationaleAttachment.imagePreviewUrl);
    
    this.setMaxValue(this.activeCount, false);
  }

  public checkReorder() {
    if (this.searchText && this.searchText.length) {
      this.reorderGroup.disabled = true;
      this.filterActiveCases = 0;
      var items = this.cases;
      var filter = this.searchText;
      if (!items) {
        return items;
      }
      if (!filter) {
        let startIndex = (this.currentPage - 1) * 10;
        let lastIndex = ((this.currentPage -1) * 10) + 10;
  
        items.map((item, index) => {
          item.show = false;
          if(index >= startIndex && index < lastIndex ) {
            item.show = true;
            this.filterCases.push(item);
            this.filterActiveCases = this.filterCases.length;
            console.log("this.filterActiveCases...*1", this.filterActiveCases);
          }
        });
      }
      filter = filter.toLowerCase();
      items.map((item, index) => {
        item.show = false;
        const indexNumber = index + 1;
        const indexname = "case " + indexNumber;
        if ((indexname.indexOf(filter) !== -1
          || item.details.toLowerCase().indexOf(filter) !== -1
          || item.caseCode.toLowerCase().indexOf(filter) !== -1
          || item.result.toLowerCase().indexOf(filter) !== -1)) {
          item.show = true;
        }
        if(item.show){
          this.filterCases.push(item);
          this.filterActiveCases = this.filterCases.length;
          console.log("this.filterActiveCases...*", this.filterActiveCases);
        }
        
      })
      this.filterCases = [];     
      console.log("this.filterActiveCases...*", this.filterActiveCases);

    } else {
      this.reorderGroup.disabled = false;
    }
  }

  onClear (eve) {
    console.log("eve...", eve);
    this.filterCases = [];
    this.filterActiveCases = false;
  }

  /**
   * pageChanged
   */
  public pageChanged(e) {
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

  public openModal = async (skillLevelForSwitch) => {
    console.log("this.activeCount....", this.activeCount);
    
    const optionModal = await this.modalController.create({
      component: SwitchCasePage,
      componentProps: {
        maxValue: this.activeCount,
        skillLevel: skillLevelForSwitch
      },
      cssClass: 'switch-case',
      backdropDismiss: false
    });

    optionModal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data !== null) {
      }
    });
    return await optionModal.present();
  }

  async openViewer(selectedCase, isECGAttachment) {
    if(isECGAttachment == 'isAttachment'){
      if(selectedCase.imagePreviewUrl){
        this.attachmentImageUrl = selectedCase.imagePreviewUrl;
      } else {
        this.firebaseService.getMediaUrl(selectedCase.attachments[0]).then((imageUrl: any) => {
          this.attachmentImageUrl = imageUrl;
          console.log("imageUrl....111", this.attachmentImageUrl);
        })
          .catch((err) => {
            console.error(err);
          });        
      }
      console.log("select..", this.selectedCase.imageUrl);

    const modal = await this.modalController.create({
      component: ViewerModalComponent,     
      componentProps: {
        title: "You can double click to zoom in/zoom out",
        src: selectedCase.imageUrl ? selectedCase.imageUrl : selectedCase.imagePreviewUrl,
        slideOptions:{
          centeredSlides: true,
          passiveListeners: false,
          zoom: { enabled: true },
          allowSlideNext:false,
          allowSlidePrev:false,
          autoHeight:true,
          setWrapperSize:true,
          // height:selectedCase.dimensions ? selectedCase.dimensions.height : null,
          // width:selectedCase.dimensions ? selectedCase.dimensions.width: null,
          height: '100%',
          width: 'calc(100% - 18px)',
         }
      },
      cssClass: ['ion-img-viewer', 'custom-modal-image-viewer'] ,
      keyboardClose: true,
      showBackdrop: true,
    });
    await modal.present();
    var x = document.getElementsByClassName("custom-modal-image-viewer") ;
    let mod = x[0] as HTMLBaseElement;
    mod.style.setProperty('--height', '100%');
    mod.style.setProperty('--width', 'calc(100% - 18px)');
    mod.style.setProperty('display', 'flex');
    // mod.style.setProperty('--height', selectedCase.dimensions.height+'px');
    // mod.style.setProperty('--width', selectedCase.dimensions.width+'px');
    // mod.style.setProperty('display', 'flex');
    return ;
  } else if(isECGAttachment == 'isRationaleAttachment'){
    
    var selectedData :any;
    if(selectedCase.imagePreviewUrl) {
      this.rationaleAttachmentImageUrl = selectedCase.imagePreviewUrl;
    } else {
      this.commonService.showLoading();
      this.firebaseService.getRationaleMediaUrl(selectedCase.rationaleAttachments[0]).then((imageRationaleUrl: any) => {
        this.rationaleAttachmentImageUrl = imageRationaleUrl;
        console.log("rationaleAttachmentImageUrl....111", this.rationaleAttachmentImageUrl);
        this.commonService.hideLoading();
      })
        .catch((err) => {
          this.commonService.hideLoading();
          console.error(err);
        });      
    }
    console.log("select..", this.selectedCase);
    console.log("rationaleAttachmentImageUrl....111", this.rationaleAttachmentImageUrl);
      
  const modal = await this.modalController.create({
    component: ViewerModalComponent,     
    componentProps: {
      title: "You can double click to zoom in/zoom out",
      src: this.rationaleAttachmentImageUrl ? this.rationaleAttachmentImageUrl : selectedCase.imagePreviewUrl,
      slideOptions:{
        centeredSlides: true,
        passiveListeners: false,
        zoom: { enabled: true },
        allowSlideNext:false,
        allowSlidePrev:false,
        autoHeight:true,
        setWrapperSize:true,
        // height:this.selectedCase.dimensionsRationale ? this.selectedCase.dimensionsRationale.height : null,
        // width:this.selectedCase.dimensionsRationale ? this.selectedCase.dimensionsRationale.width: null,
        height: '100%',
        width: 'calc(100% - 18px)',
       }
    },
    cssClass: ['ion-img-viewer', 'custom-modal-image-viewer'] ,
    keyboardClose: true,
    showBackdrop: true,
  });
  await modal.present();
  var x = document.getElementsByClassName("custom-modal-image-viewer") ;
  let mod = x[0] as HTMLBaseElement;
  // if(this.selectedCase.dimensionsRationale) {
    mod.style.setProperty('--height', '100%');
    mod.style.setProperty('--width', 'calc(100% - 18px)');
    mod.style.setProperty('display', 'flex');
    // mod.style.setProperty('--height', this.selectedCase.dimensionsRationale.height+'px');
    // mod.style.setProperty('--width', this.selectedCase.dimensionsRationale.width+'px');
    // mod.style.setProperty('display', 'flex');
    return ;
  // } 
}
}
}
