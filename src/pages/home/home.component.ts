import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MenuComponent } from '../../shared/components/menu/menu.component';
import { CreateGameComponent } from '../../shared/components/create-game/create-game.component';

import { Observable } from 'rxjs/Observable';

//Interfaces
import { GameInfo } from '../../shared/models/game-info';
import { Coords } from '../../shared/models/coords';
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
import { LocationService } from '../../shared/services/location.service';


@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {


  //Escucha el evento para saber cuando se ha creado la partida y hacer zoom sobre el mapa en esa posicion
  @ViewChild('gameForm') createdGameEvent: CreateGameComponent;

  //Variable que guarda el address recuperado del mapa cuando se hace doble click para pasarselo al formulario como input
  addressClicked: any;

  //Buscador de ciudad y CP sobre el mapa
  searchGamesForm: FormGroup;

  //Observable que contiene todas las partidas a mostrar sobre el mapa
  games : GameInfo[];

  //Variables para el marcador del mapa
  imgsRootPath: string = "../assets/images/google_markers/";
  imgsMarkerCompletePath = [
    {
      sport: 'Baloncesto',
      imgPath: this.imgsRootPath+'basket_marker.png'
    },
    {
      sport: 'Fútbol',
      imgPath: this.imgsRootPath+'football_marker.png'
    },
    {
      sport: 'Pádel',
      imgPath: this.imgsRootPath+'tennis_marker.png'
    },
    {
      sport: 'Tenis',
      imgPath: this.imgsRootPath+'tennis_marker.png'
    }
  ];
  marker: string;

  //Zoom sobre el mapa
  zoom : number = 17;

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
  //Array para filtrar por partidas propias o del resto (Inicialmente las mias serán las seleccionadas)
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

  //Mensajes error tras la búsqueda de partidas
  errorGamesMessage: string;

  //Variable con el título de la partida clickeada en el mapa
  gameClicked: GameInfo;

  //Variable indicando si ha creado la partida para poder eliminarla
  gameOwner: boolean;

  constructor(private fb: FormBuilder, public dialog: MatDialog, private userInfoService: UserInfoService, 
    private authenticationService: AuthenticationService, private locationService: LocationService) {}
    
  ngOnInit(){

    this.createForm();
    this.userInfoService.getUserInfo(this.authenticationService.userName).subscribe(res => {
        
      this.city = res.city;
      this.postCode = res.postCode;
      this.sport = res.favSport;
      this.sportSelected = this.sport;

      //Direccion inicial del usuario
      this.direction = this.postCode+', '+this.city;
      //seteo el valor de la direccion en el input
      this.searchGamesForm.controls['direction'].setValue(this.direction);

      //Llamo al servicio con el nombre de usuario para pintar sus partidas (si las tiene)
      this.getMapData('true');

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

  getMarker(sportName: string): any {

    return this.imgsMarkerCompletePath.find(function(element){
      return element.sport === sportName;
    })
  }


  getMapData (myGames: string){
    //Entrada del servicio

    let getGames_IN : SearchGames;

    if(myGames){//Si myGames esta definido lo envio para obtener solo mis partidas(es opcional)

      getGames_IN = {
        userName : this.authenticationService.userName,
        userGames : myGames,
        sport : this.sport,
        postCode : this.postCode,
        city : this.city
      }; 

    }else{//NO esta definido myGames y obtendre las partidas disponibles en las que no estoy

      getGames_IN = {
        userName : this.authenticationService.userName,
        sport : this.sport,
        postCode : this.postCode,
        city : this.city
      } 
    }
      

    //Lanza el subscribe en el html
    this.userInfoService.getGames(getGames_IN).subscribe(res=>{
      
      this.games = res;

      if(!this.games.length){
        if(myGames){
          this.errorGamesMessage = 'No estás en ninguna partida de '+this.sportSelected+' en '+this.city;
        }else{
          this.errorGamesMessage = '<p>Ninguna partida con los criterios introducidos.</p><ul><li><strong>Ciudad:</strong> '+this.city+'</li>'+'<li><strong>CP:</strong> '+this.postCode+'</li>'+'<li><strong>Deporte:</strong> '+this.sportSelected+'</li></ul>';
        }

        this.gameOwner = false;

      }else{//Muestro la información de la primera partida (si ha devuelto alguna)
        this.gameClicked = res[0];
        if(this.gameClicked.host === this.authenticationService.userName){
          this.gameOwner = true;
        }else{
          this.gameOwner = false;
        }
      }

      //Obtengo el path del marcador del deporte
      let obj = this.getMarker(this.sport);
      //se lo asigno a la variable a mostrar
      this.marker = obj.imgPath;

    },err =>{
      this.serviceResponse = 'Error recuperando la información, inténtelo más tarde.';
      this.openDialog();
      //console.log(err);
    });
  }


   //Busco con los datos introducidos en el input de la ciudad
  search(city){

    let data = city.split(',');

    if(data.length === 2){

      let CP = data[0].trim();
      let cityName = data[1].trim();

      if(CP.length === 5 && cityName.length>0){
        //console.log('Formato válido');
        this.postCode = CP;
        this.city = cityName;
        this.sport = this.sportSelected;

        if(this.gameSelected === "Mis partidas"){
          this.getMapData('true');
        }else{
          this.getMapData(null);
        }      

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

/****************************************** BOTONES INFO PARTIDA ***********************************************/

  editList(){


    let updateGames_IN : GameInfo = this.gameClicked;
    updateGames_IN.userToAdd = this.authenticationService.userName;

    //console.log(updateGames_IN);

    this.userInfoService.updateGames(updateGames_IN).subscribe(res => {

      this.serviceResponse = res.text;
      this.openDialog();

      //Tras añadirme a la partida, hago la busqueda para mostrarla
      this.gameSelected = this.gamesFilter[0];
      this.search(this.postCode+','+this.city);

      console.log(res);
    },err => {
      console.log(err);
    })
  }

  onCloseClick () {
    console.log(this.gameClicked);
    this.userInfoService.removeGame(this.gameClicked).subscribe(res =>{
      console.log(res);
      this.search(this.postCode+','+this.city);

    },err =>{
      console.log(err);
    })
  }

/****************************************** EVENTOS SOBRE EL MAPA **************************************************/

  //Evento cuando pinchan sobre una partida para mostrar la información
  showMarkerInfo(gameClicked){
    console.log(gameClicked);
    let gameClickedTitle = gameClicked.title;

    this.gameClicked = this.games.find(function(game){
      if(game.name === gameClickedTitle) return true;
    },gameClickedTitle);

    if(this.gameClicked.host === this.authenticationService.userName){
      this.gameOwner = true;
    }else{
      this.gameOwner = false;
    }
  }

  //Cuando hacen click sobre una opcion de las del mapa reseteo para no motrar la info de la partida
  resetGames() {
    this.gameClicked = null;
    
  }


  setPositionOnMap(pos) {
    //console.log(pos);
    let position : Coords = {
      longitude: pos.coords.lng,
      latitude: pos.coords.lat
    };

    //Llamo al servicio de la API de google para calcular la dirección y pasarsela al form de crear partida
    /*this.locationService.getCurrentPositionAddress(position).subscribe( res=>{
      console.log(res);
      //Creo el objeto 
      let address = {
        address_components: res.results[0].address.address_components,
        formatted_address: res.results[0].formatted_address,
        location: res.results[0].location,
        place_id: res.results[0].place_id
      };

      //Cambio la variable de entrada del componente hijo para que reciba la entrada
      this.addressClicked = address;
      
    },err => {
      this.serviceResponse = 'Fallo recuperando la información, intentar mas tarde.';
      this.openDialog();
      //console.log(err);
    })*/

    let address = {
      address_components: [
        {
          "long_name":"46",
          "short_name":"46",
          "types":["street_number"]
        },
        {
          "long_name":"Calle Madrid",
          "short_name":"Calle Madrid",
          "types":["route"]
        },
        {
          "long_name":"Arroyomolinos",
          "short_name":"Arroyomolinos",
          "types":["locality","political"]
        },
        {
          "long_name":"Madrid",
          "short_name":"M",
          "types":["administrative_area_level_2","political"]
        },
        {
          "long_name":"Comunidad de Madrid",
          "short_name":"Comunidad de Madrid",
          "types":["administrative_area_level_1","political"]},
        {
          "long_name":"España",
          "short_name":"ES",
          "types":["country","political"]
        },
        {
          "long_name":"28939",
          "short_name":"28939",
          "types":["postal_code"]
        }
      ],
      formatted_address: "Calle Madrid, 46, 28939 Arroyomolinos",
      location: {
        lat: 40.2745303802915,
        lng: -3.911930819708498
      },
      place_id: "ChIJDfX_zISSQQ0RQ_w8J49Q8To"
    };

    this.addressClicked = address;
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