import { HashService } from '../services/hash.service';
import { environment } from './../../environments/environment';
import { Router, RouterModule } from '@angular/router';
import { SessionService } from '../services/session.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  loggedIn = false;
  failedAttempt = false;
  @ViewChild("email") 
  email?:ElementRef
  @ViewChild("password")
  password?: ElementRef
  subsrcip:Subscription
  constructor(private session: SessionService, 
    private router:Router,
    private hashService:HashService
    ) {
  }

  ngOnInit(): void {
    this.subsrcip = this.session.myStatus$
    .subscribe(sessionStat=>{
      if(sessionStat!=null && this.router.url == "/login"){
        this.router.navigate(["/"]);
      }
    });
    if(this.router.url=="/login") {
      document.getElementById('main-container').setAttribute("style", "margin-top:10%");
      this.session.checkSession();
    }
  }

  ngOnDestroy(){
    this.subsrcip.unsubscribe();
  }

  hashCode() {
    console.log("hashing!")
    let email:string = this.email?.nativeElement.value;
    let password:string = this.password?.nativeElement.value;

    let hash = this.hashService.hash(email,password);

    let jsonBody:string = `{"email":"` + email + `", "password":"` + hash + `"}`
    
    this.login(jsonBody).then(response=>{
      if(response){
        window.location.reload()
        this.failedAttempt=false;
      }
      else this.failedAttempt=true;

      console.log("failed attempt: ", this.failedAttempt);
    });
  }

  login(body:string){
    let baseUrl = environment.apiBaseUrl
    return fetch(baseUrl+"/auth/login",{
      method:'POST',
      headers:{'Content-Type': 'application/json'},
      credentials:'include',
      body: body
    })
    .then(response=>response.json())
  }
}
