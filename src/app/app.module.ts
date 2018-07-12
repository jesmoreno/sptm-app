import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

//angular material
import { MatInputModule,  } from '@angular/material';
import { MatFormFieldModule } from '@angular/material';
import { MatSelectModule} from '@angular/material';
import { MatIconModule} from '@angular/material';
import { MatButtonModule } from '@angular/material';
import { MatNativeDateModule } from '@angular/material';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { CdkTableModule } from '@angular/cdk/table';
import { MatProgressSpinnerModule } from '@angular/material';
import { MatPaginatorModule } from '@angular/material';
import { MatSortModule } from '@angular/material';

//componentes
import { AppComponent } from './app.component';
import { RegistryComponent } from '../pages/registry/registry.component';
import { LogInComponent } from '../pages/log-in/log-in.component';
import { HomeComponent } from '../pages/home/home.component';
import { WeatherComponent } from '../pages/weather/weather.component';
import { PopupGenericComponent } from '../shared/components/popUp/popup-generic.component';
import { PageNotFoundComponent } from '../shared/components/not-found.component';
import { MenuComponent } from '../shared/components/menu/menu.component';
import { CreateGameComponent } from '../shared/components/create-game/create-game.component';
import { FriendListComponent } from '../pages/friends-list/friends-list.component';
import { FriendsTableComponent } from '../shared/components/friends-table/friends-table.component';
import { AllUsersTableComponent } from '../shared/components/all-users-table/all-users-table.component';

//routing module
import { AppRoutingModule } from './app-routing.module';

//servicios
import { SportService } from '../shared/services/sports.service';
import { ResgistryService } from '../shared/services/registry.service';
import { AuthenticationService } from '../shared/services/authentication.service';
import { LocationService } from '../shared/services/location.service';
import { WeatherService } from '../shared/services/weather.service';
import { FriendsService } from '../shared/services/friends.service';
//Servicios JWT
import { AuthGuard } from '../guards/auth.guard';
import { TokenInterceptor } from '../guards/token.Interceptor';
//Google maps
import { AgmCoreModule } from '@agm/core';

//HTTPClient
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    RegistryComponent,
    LogInComponent,
    HomeComponent,
    WeatherComponent,
    PopupGenericComponent,
    PageNotFoundComponent,
    MenuComponent,
    CreateGameComponent,
    FriendListComponent,
    FriendsTableComponent,
    AllUsersTableComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule, 
    MatFormFieldModule,
    MatInputModule,
    NoopAnimationsModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    HttpClientModule,
    HttpModule,
    MatMenuModule,
    MatIconModule,
    MatSliderModule,
    MatCardModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatTableModule,
    CdkTableModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule
  ],
  entryComponents: [
    PopupGenericComponent,
    
  ],
  providers: [
    SportService, 
    ResgistryService, 
    AuthenticationService,
    AuthGuard,
    LocationService,
    WeatherService,
    FriendsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
