import { environment } from './../../environments/environment';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { Project } from './../project/Project';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-show-projects',
  templateUrl: './show-projects.component.html',
  styleUrls: ['./show-projects.component.scss']
})
export class ShowProjectsComponent implements OnInit {
  projects: Project[]
  myProjects: Project[]
  projectsContainer: Array<Project[]>
  loggedIn:boolean = false;
  private userFirstName: string
  private userLastName: string
  public id: string
  private baseUrl = environment.apiBaseUrl
  private subsciptionFirstName : Subscription;
  private subcriptionLastName : Subscription;
  private subscriptionStatus : Subscription;
  constructor(private session:SessionService, private router:Router) { 
    this.projects = [];
    this.myProjects = [];
    this.projectsContainer = [];
    this.id = null;
    this.userFirstName = null;
  }

  async ngOnInit(){
    this.subsciptionFirstName = this.session.myUserFirstName$.subscribe((sessionName)=>this.userFirstName = sessionName)
    this.subcriptionLastName = this.session.myUserLastName$.subscribe((sessionName)=>this.userLastName = sessionName)

    this.subscriptionStatus = this.session.myStatus$.subscribe(sessionStat=>{
      if(sessionStat!=null){
        //console.log("logged in");
        this.loggedIn = true;
        this.id = sessionStat;
      }else {
        //console.log("logged out");
        this.loggedIn=false;
      }
    });
    
    await this.session.checkSession();
    
    this.getProjects()
    .then(data=>{
      data.forEach(project => {
        project.description = project.description.replaceAll('\n', "<br>");

        console.log("project name: ", project.name);

        console.log("Leaders: ", project.projectLeaders.length)

        let decided = false
        for(let index in project.projectLeaders){
          console.log(project.projectLeaders[index])
          if(<string>project.projectLeaders[index] == this.id){
            this.myProjects.push(project);
            decided = true
            break;
          }
        }

        if(!decided){
          console.log("member: ")
          for(let index in project.projectMembers){
            console.log(project.projectMembers[index]);
            if(<string>project.projectMembers[index] == this.id){
              this.myProjects.push(project);
              decided = true;
              break;
            }
          }
          
        }
        
        if(!decided)this.projects.push(project);
        
      });
      
      this.projects.forEach(project => {
        for(let index in project.projectLeaders){
          this.getMemberName(project.projectLeaders[index]).then(str=>this.updateMemberDOM(<number> project.id, <string>project.projectLeaders[index], str))
        }
        for(let member in project.projectMembers){
          this.getMemberName(project.projectMembers[member]).then(t=>this.updateMemberDOM(<number> project.id, <string>project.projectMembers[member], t))
        }
      })

      this.myProjects.forEach(project => {
        for(let index in project.projectLeaders){
          this.getMemberName(project.projectLeaders[index]).then(str=>this.updateMemberDOM(<number> project.id, <string>project.projectLeaders[index], str))
        }
        for(let member in project.projectMembers){
          this.getMemberName(project.projectMembers[member]).then(t=>this.updateMemberDOM(<number> project.id, <string>project.projectMembers[member], t))
        }
      })
      
      this.projectsContainer.push(this.myProjects)
      this.projectsContainer.push(this.projects)
    });
    
    
  }
  ngOnDestroy(){
    this.subsciptionFirstName.unsubscribe();
    this.subcriptionLastName.unsubscribe();
    this.subscriptionStatus.unsubscribe();
  }
  updateMemberDOM(projectId:number, memberId:string, response:string){
    //console.log(projectId + memberId);
    let component = document.getElementById(projectId + memberId);
    component.textContent = response;
    component.setAttribute("id", response);
  }

  getProjects(){
    return fetch(this.baseUrl+"/projects",{credentials:'include'}).then(Response=>Response.json())
    .then(data=>data)
  }

  getMemberName(id:String){
    let url = this.baseUrl+"/members/" + id;
    return fetch(url,{credentials:'include'})
    .then(response=>response.json())
    .then(member=>{
      let fullName: string = <string>member.firstName + " " + <string>member.lastName
      return fullName;
    })
  }

  edit(id:number){
    document.getElementById("edit_"+id).setAttribute("style", "display:none");
    document.getElementById("remove_"+id).setAttribute("style", "display:inline");
    document.getElementById("done_"+id).setAttribute("style", "display:inline");
    try{
      document.getElementById("editDetails_"+id).setAttribute("style", "display:inline");
    }catch(e){
      //means our member is not the leader, and editDetails doesn't exist.. do nothing!
    }
  }

  removeProject(id:number){
    let url:string = this.baseUrl+"/projects/" + id
    return fetch(url,{method:'DELETE', credentials:'include'})
    .then(()=>{location.reload();})
    .catch(()=>console.log("fail to delete"))
  }

  removeAsMember(id:number){
    console.log("debug remove as member")

    let requestBody = `{"memberId":"`+ this.id +`",
    "projectId":`+ id +`,
    "toDo":"removeAsMember"
    }`

    let url:string = this.baseUrl+"/relate";

    fetch(url,
      { method:'POST',
        credentials:'include',
        headers:{'Content-Type': 'application/json'},
        body:requestBody
      })
    .then(()=>location.reload())
    .catch(()=>console.log("failed to remove as member"))

  }

  removeAsLeader(id:number, project:Project){
    let requestBody = `{"memberId":"`+ this.id +`",
    "projectId":`+ id +`,
    "toDo":"removeAsLeader"
    }`

    let url:string = this.baseUrl+"/relate";

    fetch(url,
      { method:'POST',
        credentials:'include',
        headers:{'Content-Type': 'application/json'},
        body:requestBody
      })
    .then(()=>{
      //console.log("Number of Project leaders: ", project.projectLeaders.length);
      //if the number of leader before the leader removed is 1 (so the after the removal = 0)
      if(project.projectLeaders.length==1){
        this.removeProject(id).then(()=>location.reload());
      }
    })
    .catch(()=>console.log("failed to remove as leader"))

  }

  cancel(id:number){
    document.getElementById("edit_"+id).setAttribute("style", "display:inline")
    document.getElementById("remove_"+id).setAttribute("style", "display:none")
    document.getElementById("done_"+id).setAttribute("style", "display:none")
    try{
      document.getElementById("editDetails_"+id).setAttribute("style", "display:none")
    }catch(e){
      //means our member is not the leader, and editDetails doesn't exist.. do nothing!
    }
  }

  details(id:number){
    //console.log("details id: ",id)
    this.router.navigate(['/edit-project/'+id]);
  }

  modifyModal(id:number, name:String){
    let modal = document.getElementById("removeModal");
    let body = modal.querySelector(".modal-body");
    let removeBtn = modal.querySelector("#removeBtn");
    let project:Project = null;

    body.textContent = "Are you sure want to remove the project \"" + name +  "\"?";
    removeBtn.addEventListener('click',()=>{
      
      this.myProjects.forEach((myProject)=>{
        if (myProject.name == name) project = myProject;
      })

      if(project.projectLeaders.length < 1) this.removeAsMember(id)

      project.projectLeaders.forEach((leader)=>leader== this.id ? this.removeProject(id) : this.removeAsMember(id))
    })
  }

  join(id:number){
    let requestBody = `{"memberId":"`+ this.id +`",
    "projectId":`+ id +`,
    "toDo":"asMember"
    }`

    let url:string = this.baseUrl+"/relate";

    fetch(url,
      { method:'POST', 
        credentials:'include',
        headers:{'Content-Type': 'application/json'},
        body:requestBody
      })
    .then(()=>location.reload())
    .catch(()=>console.log("failed to relate as member"))
  }
}
