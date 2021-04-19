import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  myStatus$: Observable<string>;
  myUserFirstName$: Observable<string>;
  myUserLastName$: Observable<string>;

  private sessionStat = new Subject<string>();
  private sessionUserFirstName = new Subject<string>();
  private sessionUserLastName = new Subject<string>();
  private baseUrl = environment.apiBaseUrl;
  constructor() {
      this.myStatus$ = this.sessionStat.asObservable();
      this.myUserFirstName$ = this.sessionUserFirstName.asObservable();
      this.myUserLastName$ = this.sessionUserLastName.asObservable();
  }

  myStatus(data:string) {
    this.sessionStat.next(data);
  }
  
  myUserName(firstName:string, lastName:string){
    this.sessionUserFirstName.next(firstName);
    this.sessionUserLastName.next(lastName);
  }

  async checkSession(){
    //console.log("checking session....")
    return fetch(this.baseUrl+"/auth/session",{credentials:'include'}).then(response=>response.json())
    .then(async data=>{
      if(data["USER_ID"]!=null){
        //console.log(data["USER_ID"]);
        let data2 = await this.getUserInfo(data["USER_ID"])
        this.myUserName(data2.firstName, data2.lastName);
        return this.myStatus(data["USER_ID"]);
      }
      
      this.myUserName(null,null);
      return this.myStatus(data["USER_ID"]);
    });
  }

  async getUserInfo(id:string){
    //console.log("get User Info...")
    return fetch(this.baseUrl+"/members/"+id,{credentials:'include'}).then(response=>response.json())
    .then(data=>data);
  }
}
