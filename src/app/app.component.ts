import { environment } from './../environments/environment';
import { Router } from '@angular/router';
import { SessionService } from './services/session.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'organisation-app';
  logInOut:string = "";
  logged:boolean = false;
  @ViewChild("email") 
  email?:ElementRef
  @ViewChild("password")
  password?: ElementRef
  userLastName:string="";
  private baseUrl = environment.apiBaseUrl
  constructor(private session:SessionService, public router: Router){}
  
  ngOnInit(){

    this.session.myUserLastName$
    .subscribe(resp=>this.userLastName=resp)
    
    this.session.myStatus$
    .subscribe(resp=>{
      if(resp==null) this.loggedIn(false);
      else this.loggedIn(true);
    })
  }

  loggedIn(status:boolean){
    if (!status){ //if not logged in
      this.logInOut="Login";
      this.logged=false;
    }
    else{
      this.logInOut="Logout";
      this.logged=true;
    }
  }

  async logout(){
    if(this.logged){
      fetch(this.baseUrl+"/auth/logout",{credentials:'include'})
        .then(response=>response).then(data=>{
          if(data) {
            this.loggedIn(false)
            location.reload();
          }
          else console.log("something is wrong");
        })
    }
  }
}
