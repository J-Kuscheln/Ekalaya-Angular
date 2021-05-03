import { environment } from './../../environments/environment';
import { SessionService } from '../services/session.service';
import { Member } from './../member/Member';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-show-members',
  templateUrl: './show-members.component.html',
  styleUrls: ['./show-members.component.scss']
})
export class ShowMembersComponent implements OnInit {
  members: Member[]
  private baseUrl = environment.apiBaseUrl
  private subscrip:Subscription
  constructor(private session:SessionService) {
    this.members = [];
  }
  
  async ngOnInit(): Promise<void> {
    await this.getDataMember();
    this.subscrip = this.session.myStatus$.subscribe();
    this.session.checkSession();
    this.displayAnimation();
  }
  ngOnDestroy(){
    if(this.subscrip!=null) this.subscrip.unsubscribe();
  }

  async getDataMember(){
    await fetch(this.baseUrl+"/members",{credentials:'include'}).then(Response=>Response.json()
    .then(dataArray=>{
      this.members = dataArray;
      this.members.forEach(member=>{
        for(let proj in member.leadedProjects){
          this.updateProjectName(<string>member.leadedProjects[proj]).then(t=>member.leadedProjects[proj]=t);
        }
        for(let proj in member.memberProjects){
          this.updateProjectName(<string>member.memberProjects[proj]).then(t=>member.memberProjects[proj]=t);
        }
      })
    }));
  }

  updateProjectName(id:string){
    let url = this.baseUrl+"/projects/" + id;
    
    return fetch(url,{credentials:'include'}).then(project=>project.json())
    .then(data=>{
        return <string>data.name;
      })
    .catch(() => { console.log("fail to fetch"); return "error";});
    }

  displayAnimation(){
    let counter = 0;
    let checkExist = setInterval(()=>{
      if(document.getElementsByClassName("card animated").length){
        let i = 0;
        let animate = setInterval(()=>{
          if(!document.getElementsByClassName("card animated").item(i)) clearInterval(animate);
          else{
            document.getElementsByClassName("card animated").item(i).setAttribute("style", "transform:translateY(0%); opacity:100");
            i++;
          }
        },100)
          
        clearInterval(checkExist);
      }
      if(counter==10){
        clearInterval(checkExist);
      }
      counter += 1;
    },100)
  }
}
