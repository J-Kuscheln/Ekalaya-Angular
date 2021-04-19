import { Subscription } from 'rxjs';
import { SessionService } from './../services/session.service';
import { Component, OnInit } from '@angular/core';

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

  ngOnInit(): void {
    this.subscription[0] = this.session.myUserFirstName$.subscribe(resp => this.userFirstName=resp);
    this.subscription[1] = this.session.myUserLastName$.subscribe(resp=>this.userLastName=resp);
    this.subscription[2] = this.session.myStatus$.subscribe(/*do something*/);

    this.session.checkSession();
  }

}
