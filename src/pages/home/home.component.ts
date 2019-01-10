import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

    searchGamesForm: FormGroup;

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
    //Array para filtrar por partidas propias o del resto
    gamesFilter: string[] = ['Mis partidas','Resto'];
    gameSelected: string = this.gamesFilter[0];

    //dirección de búsqueda para el mapa
    direction : string;

    //Mensaje error input
    requiredField = 'Campo requerido';
    postCodeError = 'El CP debe tener 5 dígitos';
    noLengthCity = 'Introducir ciudad separada por coma del CP';
    formatError = 'Error en el formato, separar CP y ciudad con una coma';
    errorMessage: string = this.requiredField;

    constructor(private fb: FormBuilder, public dialog: MatDialog, private userInfoService: UserInfoService, private authenticationService: AuthenticationService ) {}
    
    ngOnInit(){

      this.createForm();
      //this.formControlError();

      this.userInfoService.getUserInfo(this.authenticationService.userName).subscribe(res => {
        
        this.city = res.city;
        this.postCode = res.postCode;
        this.sport = res.favSport;
        //this.sport = 'Baloncesto';
        this.sportSelected = this.sport;

        //Direccion inicial del usuario
        this.direction = this.postCode+', '+this.city;
        //seteo el valor de la direccion en el input
        this.searchGamesForm.controls['direction'].setValue(this.direction);

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

      //Me subscribo al evento que emite la tabla de creación de partida para añadirla al mapa
      this.createdGameEvent.emitEvent
      .subscribe(res => {
        
        console.log(res);

      });

    }


    createForm() {
      this.searchGamesForm = this.fb.group({
        direction: ['',Validators.required],
      });
    }

    //subscribes para errores
    /*formControlError() {
      this.searchGamesForm.controls['direction'].valueChanges.subscribe(text => {
        const control = this.searchGamesForm;
        console.log(control);
      });
    }*/


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
          //console.log('Formato válido');



        }else{
          if(CP.length != 5){
            this.errorMessage = this.postCodeError;
            this.searchGamesForm.controls['direction'].setErrors({'postCodeError':true});
            //console.log('CP de 5 dígitos');
          }
          if(cityName.length===0){
            this.errorMessage = this.noLengthCity;
            this.searchGamesForm.controls['direction'].setErrors({'noLengthCity':true});
            //console.log('No ha introducido ciudad');
          }          
        }

      }else{
        this.errorMessage = this.formatError;
        this.searchGamesForm.controls['direction'].setErrors({'formatError':true});
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