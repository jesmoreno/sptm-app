import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { CreateGameComponent } from '../../shared/components/create-game/create-game.component';

import { Observable } from 'rxjs/Observable';

//Interfaces
import { GameInfo } from '../../shared/models/game-info';
import { SearchGames } from '../../shared/models/search-games';

//POPUPS INFORMACION
import { MatDialog } from '@angular/material';
//Clase para evento del radio
import { MatRadioChange } from '@angular/material/radio';

import { PopupGenericComponent } from '../../shared/components/popUp/popup-generic.component';
//SPINNER
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

//SERVICIOS
import { UserInfoService } from '../../shared/services/user.info.service';
import { AuthenticationService } from '../../shared/services/authentication.service';


@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit{


    //Escucha el evento para saber cuando se ha creado la partida y hacer zoom sobre el mapa en esa posicion
    @ViewChild('gameForm') createdGameEvent: CreateGameComponent;

    games$ : Observable<GameInfo[]>;
    marker : string = "../assets/images/google_markers/football_marker.png";
    zoom : number = 13;

    //MENSAJES RESPUESTA SERVICIOS 
    urlToNavigate:string = '/home'; 
    serviceResponse:string;

    //Ciudad origen del usuario
    city: string;
    postCode: string;
    //sport: string = 'Baloncesto';
    sport: string;

    //Array de opciones para el filtro
    sportsFilter: string[] = ['Fútbol','Baloncesto','Tenis','Pádel'];
    sportSelected: string;

    constructor(public dialog: MatDialog, private userInfoService: UserInfoService, private authenticationService: AuthenticationService ) {}
    
    ngOnInit(){

      this.userInfoService.getUserInfo(this.authenticationService.userName).subscribe(res => {
        
        this.city = res.city;
        this.postCode = res.postCode;
        //this.sport = res.favSport;
        this.sport = 'Baloncesto';
        this.sportSelected = this.sport;

        let getGames_IN : SearchGames = {
          userName : this.authenticationService.userName,
          elements : 0,
          sport : this.sport,
          postCode : this.postCode,
          city : this.city
        } 

        this.games$ = this.userInfoService.getGames(getGames_IN);

        /*this.userInfoService.getGames(getGames_IN).subscribe(res => {
          console.log(res);
        },err =>{
          console.log(err);
        })*/
        

      },err => {
        console.log(err);
      });


      this.createdGameEvent.emitEvent
      .subscribe(res => {
        
        console.log(res);

      });

    }

    //Para desarrollo
    radioChange(event: MatRadioChange){
      console.log(event.value);
    }

    //Busco con los datos introducidos en el input de la ciudad
    search(city){

      let data = city.split(',');

      if(data.length === 2){

        let CP = data[0].trim();
        let cityName = data[1].trim();

        if(CP.length === 5 && cityName.length>0){
          console.log('Formato válido')
        }else{
          console.log('El CP debe tener 5 digitos');
        }

        console.log('Strings: '+data.length);
        console.log('Codigo postal: '+CP+', longitud: '+CP.length);
        console.log('Ciudad: '+cityName+', longitud: '+cityName.length);
        console.log('Deporte filtro: '+this.sportSelected);


      }else{
        console.log('formato invalido');
      }

    }

    ///////////////////////////// METODOS PARA ABRIR EL  POPUP //////////////////////////////////////////
    openDialog(): void {
    let dialogRef = this.dialog.open(PopupGenericComponent, {
      width: '250px',
      data: { text: this.serviceResponse, url: this.urlToNavigate }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed in home');
    });
  }

}