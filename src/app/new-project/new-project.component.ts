import { environment } from './../../environments/environment';

import { SessionService } from '../services/session.service';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss']
})
export class NewProjectComponent implements OnInit {
  loggedIn: boolean
  private id:string
  @ViewChild("name")
  private name:ElementRef
  @ViewChild("desc")
  private description:ElementRef
  @ViewChild("connection")
  private connection:ElementRef
  private baseUrl = environment.apiBaseUrl
  private subscription : Subscription;
  constructor(private router:Router, private session:SessionService) {
    this.loggedIn = false;
    this.id = "";
  }

  ngOnInit(): void {
    
    this.session.checkSession();
    this.subscription = this.session.myStatus$.subscribe(sessionStat=>{
      if(sessionStat!=null){
        this.loggedIn = true;
        this.id = sessionStat;
      }else this.loggedIn=false;

      if (this.loggedIn==false) this.router.navigate(["/"])
    })

    
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  create(){
    if(this.loggedIn && this.validateInput()){
        let requestBody:string =`{"name":"`+ this.name.nativeElement.value +`",
        "status":"Waiting for Acceptance",
        "description":"`+ this.reformDesc(this.description.nativeElement.value) +`"
        }` 

        this.createProject(requestBody).then((resp)=>{
          if(resp=="CREATED"){
            console.log(resp);
            console.log("redirect");
            this.router.navigate(['/show-projects']);
          }else if(resp=="USED"){
            this.name.nativeElement.setAttribute("class", "form-control is-invalid")
          }else{
            this.connection.nativeElement.setAttribute("class", "form-control is-invalid")
          }
        });
    }
  }

  validateInput(){
    let pass = true;
    if(this.name.nativeElement.value == ""){console.log("name empty!!"); pass = false;}
    if(this.description.nativeElement.value == ""){console.log("description empty!!"); pass = false;}
    if(pass)  return true;
    return false;
  }

  reformDesc(description:string){
    let desc:string[] = [];
    for (let i=0;i<description.length;i++){
      if (description[i] == '\n') desc.push('\\n');
      else desc.push(this.description.nativeElement.value[i]);
    }
    return desc.join("");
  }

  createProject(requestBody){
    let url:string = this.baseUrl+"/projects"
    return fetch(url,{
      method:'post',
      credentials:'include',
      headers:{'Content-Type': 'application/json'},
      body:requestBody
    })
    .then((feedback)=>feedback).then(data=>{
      if(data.status==201) return "CREATED";
      if(data.status==226) return "USED";
      return "CONNECTION";
    })
    .catch(()=>"CONNECTION")
  }
}
