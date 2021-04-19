import { SessionService } from './services/session.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ShowMembersComponent } from './show-members/show-members.component';
import { ShowProjectsComponent } from './show-projects/show-projects.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { SignupComponent } from './signup/signup.component';
import { NewProjectComponent } from './new-project/new-project.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { EditProjectComponent } from './edit-project/edit-project.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';

@NgModule({
  declarations: [
    AppComponent,
    ShowMembersComponent,
    ShowProjectsComponent,
    LoginPageComponent,
    SignupComponent,
    NewProjectComponent,
    EditProfileComponent,
    EditProjectComponent,
    HomePageComponent,
    ProjectDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [SessionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
