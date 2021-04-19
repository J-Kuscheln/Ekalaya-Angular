import { Task } from './../task/Task';
import { Member } from './../member/Member';
import { Project } from './../project/Project';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionService } from './../services/session.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent implements OnInit {

  public memberId:string;
  public project: Project;
  public isLoggedIn = false;
  public membersOfProject: Member[] = [];
  public LeaderOfProject: Member[] = [];

  public tasksContainer: Array<Task[]> = [];
  public myPartners: Array<Member[]> = [];
  private myTasks: Task[] = [];
  private otherTasks: Task[] = [];
  
  private projectId:string;
  private sessionSubscription : Subscription;
  private baseApiUrl = environment.apiBaseUrl;
  constructor(private sessionService:SessionService, private router:Router) { }

  async ngOnInit(): Promise<void> {
    this.sessionService.checkSession();
    this.sessionSubscription = this.sessionService.myStatus$.subscribe(stat=>{
      let currentUrl = this.router.url.split("/");
      
      if(currentUrl.length!=3){
        return this.goHome();
      }
      
      this.loginStatusUpdate(stat);
      this.projectId = currentUrl[2];
      return this.main();
    })
  }

  ngOnDestroy(){
    this.sessionSubscription.unsubscribe();
  }

  async main(){
    await this.getProjectDetails().then(project=>{
      
      if(project.name==null && project.id==0){
        return this.goHome();
      }
      project.description = this.formatProjectDescription(project.description);
      this.project=project;
    });

    await this.getMemberData(this.project.projectLeaders, this.LeaderOfProject);
    await this.getMemberData(this.project.projectMembers, this.membersOfProject)
    
    if(this.isLoggedIn) await this.getTaskData(this.project.tasks)
    this.tasksContainer.push(this.myTasks);
    this.tasksContainer.push(this.otherTasks);

    for(let i in this.myPartners){
      console.log(this.myPartners[i]);
    }

  }

  goHome(){
    this.router.navigate(["/"]);
    return;
  }

  loginStatusUpdate(stat){
    this.memberId = stat;
    this.isLoggedIn = false;
    if(stat!=null){
      this.isLoggedIn = true;
    }
  }

  getProjectDetails(){
    let url = this.baseApiUrl + "/projects/" + this.projectId;

    return fetch(url,{method:'GET', credentials:'include'})
    .then(resp=>resp.json()).then(data=>data);
  }

  async getMemberData(memberIds:String[], pushToThisArray:Member[]){
    for(let index in memberIds){
      let id = memberIds[index];
      let url = this.baseApiUrl + "/members/" + id;



      await fetch(url,{method:'GET', credentials:'include'}).then(resp=>resp.json())
      .then(data=>pushToThisArray.push(data));
    }
  }

  async getTaskData(tasks:number[]){
    for(let index in tasks){
      let id = tasks[index];
      let url = this.baseApiUrl + "/tasks/" + id;

      await fetch(url,{method:'GET', credentials:'include'}).then(resp=>resp.json())
      .then(data=>{
        data.description = this.formatTaskDescription(data.description);
        data.dueDate = this.formatDate(data.dueDate);
        this.pushTaskToArray(data)}
      );
    }
  }

  pushTaskToArray(task:Task){
    let mine = false;
    let possiblePartnerId:String[] = [];
    for(let index in task.members){
      if(task.members[index]==this.memberId){
        this.myTasks.push(task);
        mine = true;
      }else{
        possiblePartnerId.push(task.members[index])
      }
    }
    
    if(mine){
      let partner:Member[] = [];
      for(let memberId of task.members){
        let data = this.getMemberDataOffline(memberId);
        if(data!=null) partner.push(data);
      }
      this.myPartners.push(partner);
      return;
    }
    
    this.otherTasks.push(task);
  }

  getMemberDataOffline(id:String){
    console.log("looking for: ", id);
    for(let member of this.membersOfProject){
      console.log("match with: ", member.id);
      if(member.id == id) {
        
        return member;
      }
    }
    return null;
  }
  formatTaskDescription(desc){
    return desc.replaceAll("\\n", "<br>");
  }
  formatProjectDescription(desc){
    return desc.replaceAll("\n", "<br>");
  }
  formatDate(date){
    return date!=null? new Date(date).toDateString() : "-";
  }
}
