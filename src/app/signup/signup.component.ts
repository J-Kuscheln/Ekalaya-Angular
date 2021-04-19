import { Subscription } from 'rxjs';
import { HashService } from '../services/hash.service';
import { environment } from './../../environments/environment';
import { SessionService } from '../services/session.service';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  filled:boolean;
  match:boolean;
  /*
    All Necessary elements
    #firstNameSignUp
    #lastNameSignUp
    #birthdaySignUp
    #emailSignUp
    #phoneSignUp
    #passwordSignUp
    #passwordValidator
  */
  @ViewChild("firstNameSignUp")
  firstName:ElementRef
  @ViewChild("lastNameSignUp")
  lastName:ElementRef
  @ViewChild("birthdaySignUp")
  birthday:ElementRef
  @ViewChild("emailSignUp")
  email:ElementRef
  @ViewChild("phoneSignUp")
  phone:ElementRef
  @ViewChild("passwordSignUp")
  pass:ElementRef
  @ViewChild("passwordValidator")
  passValidator:ElementRef
  
  private baseUrl = environment.apiBaseUrl
  private subs:Subscription;

  constructor(private router: Router, private session:SessionService, private hashService:HashService) {
    
   }

  ngOnInit(): void {
    this.subs = this.session.myStatus$
    .subscribe(sessionStat=>{
      if(sessionStat!=null){
        this.router.navigate(["/"]);
      }
    })
    this.session.checkSession();
  }
  ngOnDestroy(){
    this.subs.unsubscribe();
  }

  submitForm(){
    if(this.validate()){
      let requestBody:string = `{"firstName":"`+this.firstName.nativeElement.value+`",
      "lastName":"`+this.lastName.nativeElement.value+`",
      "position":"Member",
      "email":"`+this.email.nativeElement.value+`",
      "phone":"`+this.phone.nativeElement.value+`",
      "birthday":"`+this.birthday.nativeElement.value+`"
      }`
      console.log(requestBody)
      fetch(this.baseUrl+"/members",{
        method:'post',
        headers:{'Content-Type': 'application/json','pass':this.hash()},
        credentials:'include',
        body:requestBody
      }).then(()=>this.router.navigate(["/login"]));
    }

  }

  hash():string{
    let email:string = this.email.nativeElement.value;
    let password:string = this.pass.nativeElement.value;
    let str =  email + password;
    var hash = this.hashService.hash(email,password);
    return hash.toString();
  }

  validate(){
    let filledIndicator = true;
    let matchIndicator = false;
    let phoneNumber = false;
    var elements:ElementRef[] = [
      this.firstName,
      this.lastName,
      this.birthday,
      this.email,
      this.phone,
      this.pass,
      this.passValidator,
    ];
    for (let e in elements){
      if(e!='4' && e!='6' && e!='2'){
        let temp = this.filledField(elements[e]);
        filledIndicator = filledIndicator? temp : false;
      }
    }


    if(this.filledField(elements[6])){
      matchIndicator=this.passwordMatch(elements[5], elements[6]);
    }

    phoneNumber = this.phoneValid(elements[4]);

    return (filledIndicator && matchIndicator && phoneNumber);
    
  }

  filledField(element:ElementRef) : boolean{
    element.nativeElement.className = "form-control is-valid";
    if(element.nativeElement.value==""){
      element.nativeElement.className = "form-control is-invalid"; 
      return false;
    }
    return true;
  }

  passwordMatch(pass:ElementRef, validator:ElementRef):boolean{
    if(pass.nativeElement.value != validator.nativeElement.value){
      validator.nativeElement.className="form-control is-invalid";
      return false;
    }
    return true;
  }

  phoneValid(element:ElementRef) : boolean{
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
      
      if ((i!=0 && !isNumeric) || (i==0 && !isPlusOrZero))
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
    return true
  }
}
