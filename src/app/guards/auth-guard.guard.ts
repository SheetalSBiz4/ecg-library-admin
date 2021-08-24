import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseService, LocalStorageService } from '../providers/providers';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardGuard implements CanActivate, CanDeactivate<unknown> {
  constructor(
    private router: Router,
    private localStorageService: LocalStorageService
  ) {

  }
  canActivate(
    route: ActivatedRouteSnapshot,

    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // console.log('guard');
    const loggedIn = this.localStorageService.getItem('loggedIn', false);
    if (loggedIn && loggedIn == 'true') {
      return true;
    } else {
      return this.router.parseUrl('login');
    }
  }
  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }

}
