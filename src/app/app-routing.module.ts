import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistryComponent } from '../pages/registry/registry.component';
import { LogInComponent } from '../pages/log-in/log-in.component';
import { HomeComponent } from '../pages/home/home.component';
import { WeatherComponent } from '../pages/weather/weather.component';
import { FriendListComponent } from '../pages/friends-list/friends-list.component';
import { ProfileComponent } from '../pages/profile/profile.component';

import { AuthGuard } from '../guards/auth.guard';

import { PageNotFoundComponent } from '../shared/components/not-found.component';


const routes: Routes = [
  	{ path: '', redirectTo: '/login', pathMatch: 'full'},
  	{ path: 'registry', component: RegistryComponent},
  	{ path: 'login', component: LogInComponent},
  	{ path: 'home', component: HomeComponent , canActivate: [AuthGuard]},
  	{ path: 'weather', component: WeatherComponent , canActivate: [AuthGuard]},
  	{ path: 'friends', component: FriendListComponent , canActivate: [AuthGuard]},
    { path: 'profile', component: ProfileComponent , canActivate: [AuthGuard]},
  	{ path: '**', component: PageNotFoundComponent }
  ];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}