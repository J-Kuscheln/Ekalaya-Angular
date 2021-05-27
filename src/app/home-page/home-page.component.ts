import { interval, Subscription } from 'rxjs';
import { SessionService } from './../services/session.service';
import { Component, OnInit, Output, SystemJsNgModuleLoader } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  private userFirstName:string;
  private userLastName:string;
  private subscription:Subscription[] = new Array<Subscription>();
  constructor(private session:SessionService) { }

  public counter:number;
  intervalID: number;

  ngOnInit(): void {
    this.subscription[0] = this.session.myUserFirstName$.subscribe(resp => this.userFirstName=resp);
    this.subscription[1] = this.session.myUserLastName$.subscribe(resp=>this.userLastName=resp);
    this.subscription[2] = this.session.myStatus$.subscribe(/*do something*/);
    this.session.checkSession();

    this.counter = 1;
    
    const intervals$ = interval(10000);
    this.subscription[3] = intervals$.subscribe(val => this.next())
  }

  currentSlide(i: number){
    this.counter = i;
  }

  next(){
    if (this.counter == 3){
      this.counter = 1;
    } else {
      this.counter ++;
    }
  }

  prev(){
    if(this.counter == 1){
      this.counter = 3;
    } else {
      this.counter --;
    }
  }

}