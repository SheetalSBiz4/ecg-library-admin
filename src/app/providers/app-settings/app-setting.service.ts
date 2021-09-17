import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppSetting {

   /**
    * Method to return environment name
    */
   public static get ENVIRONMENT_NAME(): string {
      // return 'Production';
      // return 'Uat';
      return 'Dev';

   }
}
