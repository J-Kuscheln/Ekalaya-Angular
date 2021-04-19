import { Subscription } from 'rxjs';
import { Project } from './../project/Project';
import { HashService } from '../services/hash.service';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { Member } from './../member/Member';
import { environment } from './../../environments/environment';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
/*
    {   "id":"13401548-df30-4a4c-8ee0-ad59f81b14ab",
        "firstName":"Rozaan Wiryanto",
        "lastName":"asfd",
        "photoUrl":null,
        "position":"asfasfd",
        "email":"asdfasdf",
        "phone":"asdfas",
        "birthday":"4567-03-12",
        "joinDate":"2021-02-22T23:46:36.000+00:00",
        "modifiedDate":"2021-02-22T23:46:36.000+00:00",
        "leadedProjects":[],
        "memberProjects":[],
        "finishedProjects":[]}
*/
export class EditProfileComponent implements OnInit {
  member:Member;

  @ViewChild("firstName")
  firstName:ElementRef
  @ViewChild("lastName")
  lastName:ElementRef
  @ViewChild("email")
  email:ElementRef
  @ViewChild("phone")
  phone:ElementRef
  @ViewChild("birthday")
  birthday:ElementRef
  @ViewChild("oldPassword")
  oldPassword:ElementRef
  @ViewChild("newPassword")
  newPassword:ElementRef

  private subscrip:Subscription;
  private baseUrl = environment.apiBaseUrl;
  constructor(private session:SessionService, private router:Router, private hashService:HashService ) { }

  ngOnInit(): void {
    this.subscrip = this.session.myStatus$
    .subscribe(resp=>{
      if(resp==null) {
        this.router.navigate(["/"]);
        return;
      }
      this.getMember(resp).then(respData=>this.member=respData);
    })

    this.session.checkSession();
  }

  ngOnDestroy(){
    this.subscrip.unsubscribe();
  }

  getMember(id:String){
    return fetch(this.baseUrl+"/members/"+id, {credentials:'include'})
    .then(resp=>resp.json())
  }

  updateMember(){
    let status = document.querySelector("div #status");
    if(this.isValidInput(this.phone)){
      this.isAuthorized()
      .then(data=>{
        if(data){
          //update new email and new password
          this.oldPassword.nativeElement.className="form-control is-valid";
          let url = this.baseUrl + "/members/" + this.member.id;
          let newPass:string = this.newPassword.nativeElement.value=="" ? 
            this.hashService.hash(this.email.nativeElement.value, this.oldPassword.nativeElement.value) : this.hashService.hash(this.email.nativeElement.value, this.newPassword.nativeElement.value);
          
          let headerContent:any = {'Content-Type': 'application/json', 'newP': + newPass};
          let body:any = {
            "firstName":this.firstName.nativeElement.value,
            "lastName":this.lastName.nativeElement.value,
            "email":this.email.nativeElement.value,
            "phone":this.phone.nativeElement.value,
            "birthday":this.birthday.nativeElement.value,
          }

          fetch(url,{method:'put', credentials:'include', headers:headerContent, body:JSON.stringify(body)})
          .then(resp2=>resp2)
          .then(data2=>{
            //status 400: Bad_Request --> format failure
            if(data2.status==200) {
              this.session.myUserName(this.firstName.nativeElement.value,this.lastName.nativeElement.value);
              status.textContent = "Changes saved!";
              status.setAttribute("style", "color:green");
            }else if(data2.status==404){
              status.textContent = "Member not found!";
              status.setAttribute("style", "color:red");
            }else if(data2.status==226){
              this.email.nativeElement.className="form-control is-invalid"
              document.querySelector("#email-invalid-feedback").textContent = "Email already used!"
            }
            else{
              status.textContent = "Network/Server failure!";
              status.setAttribute("style", "color:red");
            }
          });
        }

        else{
          this.oldPassword.nativeElement.className="form-control is-invalid";
          document.querySelector("#oldPassword-invalid-feedback").textContent = "Wrong password!"
        }
      });
    }
  }

  deleteMember(){
    if(this.isValidInput(this.phone)){
      this.isAuthorized()
      .then(resp=>{
        if(resp){
          this.oldPassword.nativeElement.className="form-control is-valid";
          console.log("delete Member...");
          //remove Account
          let url = this.baseUrl + "/members/" + this.member.id;
          fetch(url,{method:'delete',credentials:'include'})
          .then(()=>{
            //logout (close session)
            let url = this.baseUrl + "/auth/logout";
            fetch(url,{credentials:'include'})
            .then(()=>{
              this.router.navigate(["/"]);
            });
          });
        }else{
          document.getElementsByName("cancelBtn")[0].click();
          this.oldPassword.nativeElement.className="form-control is-invalid";
          document.querySelector("#oldPassword-invalid-feedback").textContent = "Wrong password!"
        }
      });
    }
  }

  getProject(id:String){
    let url = this.baseUrl + "/projects/" + id;
    return fetch(url,{method:'get', credentials:'include'}).then(resp=>resp.json());
  }

  isAuthorized(){
    //fetch to checkAuth
    let url = environment.apiBaseUrl + "/auth/checkAuth"
    let oldEmail = this.member.email;
    let oldPassword = this.oldPassword.nativeElement.value;
    let hashValue = this.hashService.hash(<string> oldEmail,oldPassword);

    let body = `{"email":"` + oldEmail + `", "password":"` + hashValue + `"}`

    return fetch(url,{method:'post', credentials:'include', headers:{'Content-Type': 'application/json'}, body:body})
    .then(resp=>resp.json());
  }

  isValidInput(element:ElementRef):boolean{
    let number:string = element.nativeElement.value
    var code, i, len;

    //phone number should be between 10-15 or completely blank
    if(number.length==0){element.nativeElement.className="form-control"; return true;}
    if((number.length<10 || (number.length>15))) {
      element.nativeElement.className="form-control is-invalid";
      return false;
    }

    for (i = 0, len = number.length; i < len; i++) {
      code = number.charCodeAt(i);

      let isNumeric = (code>=48 && code<=57);
      let isPlusOrZero = ((code==43 || code==48));
      
      if ((i!=0 && !isNumeric) || (i==0 && !isPlusOrZero)) // numeric (0-9
      { // lower alpha (a-z)
        element.nativeElement.className="form-control is-invalid";
        return false;
      }
    }
    //if(number.charAt(0) == '+')number = number.slice(3);
    //if(number.charAt(0) == "0")number = number.substr(1);

    //numverify.com
    /*
    let API_KEY = "9f6b2b04423b31a975056d6e084a4e22";
    let url = "http://apilayer.net/api/validate?access_key="+API_KEY+"&number="+number+"&country_code=&format=1";
    fetch(url)
    .then(response=>response.json())
    .then(data=>console.log("number validation: ", data['valid']));
    */
    
    element.nativeElement.className="form-control is-valid";
    return true;
  }

  formUpdateMember(){
    document.querySelector(".edit-profile").setAttribute("onsubmit", "document.querySelector('button#submitClick').click(); return false;")
  }
  formDeleteMember(){
    document.querySelector(".edit-profile").setAttribute("onsubmit", "document.querySelector('button#deleteClick').click(); return false;")
  }
}
