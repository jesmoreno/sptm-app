import { Component, OnInit, OnChanges, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder , FormGroup , Validators , AbstractControl , ValidationErrors, FormControl, FormGroupDirective, NgForm} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ErrorStateMatcher } from '@angular/material/core';

//Servicios 
import { SportService } from '../../../shared/services/sports.service';
import { LocationService } from '../../../shared/services/location.service';
import { UserInfoService } from '../../../shared/services/user.info.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';

//POPUPS INFORMACION
import { MatDialog } from '@angular/material';
import { PopupGenericComponent } from '../../components/popUp/popup-generic.component';

//SPINNER
import { SpinnerComponent } from '../../components/spinner/spinner.component';

//Interfaz entrada servicios
import { GameInfo } from '../../models/game-info';
import { Coords } from '../../models/coords';
import { AddressGoogle } from '../../models/address-google';


//Comprobar fecha partido
const DateValidator = function(ac : AbstractControl): ValidationErrors | null {



  if(ac.value['datePick']){
    let choosenDate = ac.value['datePick'];
    let currentDate = new Date();
    choosenDate.setHours(currentDate.getHours());
    choosenDate.setMinutes(currentDate.getMinutes());
    choosenDate.setSeconds(currentDate.getSeconds());
    choosenDate.setMilliseconds(currentDate.getMilliseconds());

    

    if(choosenDate.getTime() >= currentDate.getTime()){
        return null;
    }else{
      //Para lanzar el error necesita setear el error en el FormControl del confirmpasswd.
      ac.get('datePick').setErrors({'invalidDate' : {value : ac.value}});
      return { 'invalidDate' : {value : ac.value} };
    }

  }else{
    return null;
  }
  
};

//Comprobar codigo postal
const PostCodeValidator = function(ac : AbstractControl): ValidationErrors | null {



  if(ac.value['postCode']){

    if(ac.get('postCode').value.toString().length < 5 || ac.get('postCode').value.toString().length > 5){

      ac.get('postCode').setErrors({'cpRequiredLength' : {value : ac.value}});
      return { 'cpRequiredLength' : {value : ac.value} };

    }else{
      return null;
    }
    

  }else{
    return null;
  }
  
};

//Comprobar número de calle
const StreetNumberValidator = function(ac : AbstractControl): ValidationErrors | null {


  if(ac.value['streetNumber']){

    if(ac.get('streetNumber').value.toString().length < 1 || ac.get('streetNumber').value.toString().length > 3){

      ac.get('streetNumber').setErrors({'streetNumberRequiredLength' : {value : ac.value}});
      return { 'streetNumberRequiredLength' : {value : ac.value} };

    }else{
      return null;
    }
    

  }else{
    return null;
  }
  
};

//Cambio el statematcher por defecto para eliminar la comprobación al hacer submit en el form
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    //const isSubmitted = form && form.submitted;
    //return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}




@Component({
  selector: 'create-game',
  templateUrl: './create-game.component.html',
  styleUrls: ['./create-game.component.css']
})


export class CreateGameComponent implements OnInit, OnChanges{

  //Formulario y array de deportes posibles
	gameForm : FormGroup;
  sports : string[];
  
  //Salida del componente, cuando crea la partida.
  @Output() emitEvent:EventEmitter<GameInfo> = new EventEmitter<GameInfo>();

  //Entrada del componente, objeto con la direccion donde crear la partida
  @Input('address') locationAddress : AddressGoogle;

  //Variables para el slider
  value = Number;
  disabled = false;
  max = 30;
  min = 2;
  step = 1;
  
  //Mensajes de error del formulario para la creacion de partido
  requiredField : string = "campo requerido";
  dateError : string = 'Fecha inválida, anterior a la actual';
  lengthPostCode : string = 'Debe tener 5 dígitos';
  lengthStreetNumber : string = 'Entre 1 y 999';
  lengthGameName : string = 'El nombre debe tener entre 1 y 35 caracteres';

  //Variable para saber si tiene geolocalizacion el navegador
  geoLocation: boolean = false;

  //Variable donde guardar los datos de la posicion buscada
  addressSelected: AddressGoogle;

  //MENSAJES RESPUESTA SERVICIOS 
  urlToNavigate:string = '/home'; 
  serviceResponse:string;

  //Implementacion personalizada cuando muestra errores de validacion del formulario
  matcher = new MyErrorStateMatcher();

  //Variable mostrar spinner
  showSpinner: boolean;


  constructor(private fb: FormBuilder, private sportService: SportService, private locationService: LocationService, public dialog: MatDialog,
                  private userInfoService : UserInfoService, private authenticationService: AuthenticationService) {}


  ngOnInit(){
    this.hasGeoLocation();
  	this.createForm();
  }

  ngOnChanges(){

    //Han pinchado dobre el mapa la dirección y obtengo todos los datos  de la dirección para la posterior llamada a guardar partida
    this.addressSelected = this.locationAddress;

    let getStreetField = function (field: string, address: any[]): any{
      let fieldReturned = address.find(function(element){
        return element.types.find(fieldName => fieldName === field);
      })
      return fieldReturned.long_name;
    }

    //Seteo los input con la info recibida del mapa
    if(this.locationAddress){
      this.gameForm.controls['street'].setValue(getStreetField('route',this.locationAddress.address_components));
      this.gameForm.controls['streetNumber'].setValue(getStreetField('street_number',this.locationAddress.address_components));
      this.gameForm.controls['city'].setValue(getStreetField('locality',this.locationAddress.address_components));
      this.gameForm.controls['postCode'].setValue(getStreetField('postal_code',this.locationAddress.address_components));
    }
    
  }


  ///////////////////////////// METODOS PARA ABRIR EL  POPUP //////////////////////////////////////////
  openDialog(): void {
    let dialogRef = this.dialog.open(PopupGenericComponent, {
      width: '250px',
      data: { text: this.serviceResponse, url: this.urlToNavigate }
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed in create new game');
    });
  }



  hasGeoLocation = function(){
    if (navigator.geolocation){
      this.geoLocation = true;
    }
  }

  createForm() {
    this.sports = this.sportService.getSports();
	  this.gameForm = this.fb.group({
	    gameName: [null,  Validators.compose([Validators.required, Validators.maxLength(35),Validators.minLength(1)])],
	    sport: [null,  Validators.required],
	    maxPlayers: [this.value, Validators.required],
      datePick: [null,  Validators.required],
      hour: [null,  Validators.required],
      street: [null,  Validators.required],
      streetNumber: [null,  Validators.compose([Validators.required, Validators.minLength(1)])],
      postCode: [null,  Validators.required],
      city: [null,  Validators.required],
	  },{
      validator: Validators.compose([DateValidator, PostCodeValidator, StreetNumberValidator])
    });
  }


  getLocation(): Observable<any> {

    return new Observable(obs => {
      navigator.geolocation.getCurrentPosition(
        success => {
          obs.next(success);
          obs.complete();
        },
        error => {
          obs.error(error);
        }, 
        {enableHighAccuracy:true}
      );
    });
  }


  getCurrentCoords() {

    this.showSpinner = true;

    this.getLocation().subscribe(coords => {
      
      //ELIMINAR
      this.showSpinner = false;

      let posCoords : Coords = {
        longitude: coords.coords.longitude,
        latitude: coords.coords.latitude
      }



      let getStreetField = function (field: string, address: any[]): any{
        let fieldReturned = address.find(function(element){
          return element.types.find(fieldName => fieldName === field);
        })

        return fieldReturned.long_name;
      }
            

      let mock = {
        "address_components": [
          {
            "long_name": "46",
            "short_name": "46",
            "types": [
              "street_number"
            ]
          },
          {
            "long_name": "Calle Madrid",
            "short_name": "Calle Madrid",
            "types": [
              "route"
            ]
          },
          {
            "long_name": "Arroyomolinos",
            "short_name": "Arroyomolinos",
            "types": [
              "locality",
              "political"
            ]
          },
          {
            "long_name": "Madrid",
            "short_name": "M",
            "types": [
              "administrative_area_level_2",
              "political"
            ]
          },
          {
            "long_name": "Comunidad de Madrid",
            "short_name": "Comunidad de Madrid",
            "types": [
              "administrative_area_level_1",
              "political"
            ]
          },
          {
            "long_name": "España",
            "short_name": "ES",
            "types": [
              "country",
              "political"
            ]
          },
          {
            "long_name": "28939",
            "short_name": "28939",
            "types": [
              "postal_code"
            ]
          }
        ],
        "formatted_address": "Calle Madrid, 46, 28939 Arroyomolinos, Madrid, España",
        "geometry": {
          "location": {
            "lat": 40.2731814,
            "lng": -3.9132798
          },
          "location_type": "ROOFTOP",
          "viewport": {
            "northeast": {
              "lat": 40.2745303802915,
              "lng": -3.911930819708498
            },
            "southwest": {
              "lat": 40.2718324197085,
              "lng": -3.914628780291502
            }
          }
        },
        "place_id": "ChIJDfX_zISSQQ0RQ_w8J49Q8To",
        "plus_code": {
          "compound_code": "73FP+7M Arroyomolinos, España",
          "global_code": "8CGR73FP+7M"
        },
        "types": [
          "establishment",
          "gym",
          "health",
          "point_of_interest"
        ]
      }

      this.gameForm.controls['street'].setValue(getStreetField('route',mock.address_components));
      this.gameForm.controls['streetNumber'].setValue(getStreetField('street_number',mock.address_components));
      this.gameForm.controls['postCode'].setValue(getStreetField('postal_code',mock.address_components));
      this.gameForm.controls['city'].setValue(getStreetField('locality',mock.address_components));


      //Me guardo el objeto para no tener que hacer busqueda al darle a crear
      this.addressSelected = {

        address_components: mock.address_components,
        formatted_address: mock.formatted_address,
        location: {
          lat: mock.geometry.location.lat,
          lng: mock.geometry.location.lng
        },
        place_id: mock.place_id
      }

      //Llamo a la API de google para obtener la calle etc;
      /*this.locationService.getCurrentPositionAddress(posCoords).subscribe(res =>{
        
        this.showSpinner = false;

        switch (res.status) {
          case "OK":

            let getStreetField = function (field: string, address: any[]): any{
              let fieldReturned = address.find(function(element){
                return element.types.find(fieldName => fieldName === field);
              })

              return fieldReturned.long_name;
            }
            

            //Seteo los input de la dirección
            this.gameForm.controls['street'].setValue(getStreetField('route',res.results[0].address_components));
            this.gameForm.controls['streetNumber'].setValue(getStreetField('street_number',res.results[0].address_components));
            this.gameForm.controls['postCode'].setValue(getStreetField('postal_code',res.results[0].address_components));
            this.gameForm.controls['city'].setValue(getStreetField('locality',res.results[0].address_components));

            
            //Me guardo el objeto para no tener que hacer busqueda al darle a crear
            this.addressSelected = {
              address_components: res.results[0].address_components,
              formatted_address: res.results[0].formatted_address,
              location: [res.results[0].geometry.location.lat, res.results[0].geometry.location.lng]
              place_id: res.results[0].place_id
            };

            break;

          case "ZERO_RESULTS":
            this.serviceResponse = 'No se encuentran resultados con la posición actual';
            this.openDialog();
            break;

          case "OVER_DAILY_LIMIT":
            this.serviceResponse = 'Imposible recuperar la información, revisar condiciones API google';
            this.openDialog();
            break;

          case "OVER_QUERY_LIMIT":
            this.serviceResponse = 'Imposible recuperar la información, límite de peticiones excedido';
            this.openDialog();
            break;

          case "REQUEST_DENIED":
            this.serviceResponse = 'Petición rechazada';
            this.openDialog();
            break;

          case "INVALID_REQUEST":
            this.serviceResponse = 'Petición rechazada';
            this.openDialog();
            break;

          default:
            this.serviceResponse = 'Error en el servidor de Google, intentar más tarde';
            this.openDialog();
            break;
        }
      }, err => {
        //console.log(err);
        this.serviceResponse = 'Fallo recuperando la información, intentar mas tarde.';
        this.openDialog();
      })*/


    },err =>{

      this.showSpinner = false;

      this.serviceResponse = 'Permitir geolocalización en el navegador.';
      this.openDialog();
    })

  }


  createGame() {

    let gameName = this.gameForm.controls['gameName'].value.trim();
    let sportSelected = this.gameForm.controls['sport'].value;
    let playersLimit = this.gameForm.controls['maxPlayers'].value;
    let date = this.gameForm.controls['datePick'].value;
    let hour = this.gameForm.controls['hour'].value;
    let streetName = this.gameForm.controls['street'].value; 
    let streetNumber = this.gameForm.controls['streetNumber'].value;
    let cityName = this.gameForm.controls['city'].value; 
    let postalCode = this.gameForm.controls['postCode'].value; 

    //Separo cada elemento de la fecha para formatearlo en string ISO Date
    let year = date.getFullYear();
    let month = (date.getMonth()+1);
    month<10 ? month= '0'+month : null;
    let day = date.getDate();
    day<10 ? day= '0'+day : null;
    let hours = hour.split(':')[0];
    let minutes = hour.split(':')[1];
    let seconds = '00';
    //Fecha con formato para almacenar en BBDD
    let completeDate = year+'-'+month+'-'+day+'T'+hours+':'+minutes+':'+seconds;


    this.showSpinner = true;

    if(!this.addressSelected){ //Si no existe la dirección busco los datos


      let address_mock = {
        address_components: [
          {
            "long_name":"10",
            "short_name":"10",
            "types":["street_number"]
          },
          {
            "long_name":"Calle de Ávila",
            "short_name":"Calle de Ávila",
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
        formatted_address: "Calle de Ávila, 10, 28939 Arroyomolinos",
        location: {
          lat: 40.266871,
          lng: -3.920791
        },
        place_id: "ChIJzRMql5aSQQ0RAW_h1DC6ixc"
      };


      let userInfoService_IN : GameInfo = {
        host : 'Sara',
        name : 'Partida 2',
        sport : 'Baloncesto',
        maxPlayers : 2,
        date : '2019-01-28T16:45:00',
        address : address_mock, 
        userId: this.authenticationService.userId
      };

      this.saveGame(userInfoService_IN);

      /*this.locationService.getCurrentPositionLatAndLog(streetName+','+streetNumber+','+postalCode+' '+cityName).subscribe(res =>{
      switch (res.status) {
          case "OK":

            //Formateo de la direccion devuelto por la API que guardo en BBDD
            this.addressSelected = {
              address_components: res.results[0].address_components,
              formatted_address: res.results[0].formatted_address,
              location: {
                lat: res.results[0].geometry.location.lat,
                lng: res.results[0].geometry.location.lng
              },
              place_id: res.results[0].place_id

            };


            let userInfoService_IN : GameInfo = {
              host : this.authenticationService.userName,
              name : gameName,
              sport : sportSelected,
              maxPlayers : playersLimit,
              date : completeDate,
              address : this.addressSelected,
              userId: this.authenticationService.userId
            };

            this.saveGame(userInfoService_IN); 

            break;

          case "ZERO_RESULTS":
            this.serviceResponse = 'No se encuentran resultados con la posición actual';
            this.openDialog();
            break;

          case "OVER_DAILY_LIMIT":
            this.serviceResponse = 'Imposible recuperar la información, revisar las condiciones de la API de google';
            this.openDialog();
            break;

          case "OVER_QUERY_LIMIT":
            this.serviceResponse = 'Imposible recuperar la información, límite de peticiones excedido';
            this.openDialog();
            break;

          case "REQUEST_DENIED":
            this.serviceResponse = 'Petición rechazada';
            this.openDialog();
            break;

          case "INVALID_REQUEST":
            this.serviceResponse = 'Petición rechazada';
            this.openDialog();
            break;

          default:
            this.serviceResponse = 'Error en el servidor de Google, intentar más tarde';
            this.openDialog();
            break;
        }
      },err => {

        this.showSpinner = false;
        this.serviceResponse = 'Fallo recuperando la información, intentar mas tarde.';
        this.openDialog();
      })*/

    }else{

      let userInfoService_IN : GameInfo = {
        host : this.authenticationService.userName,
        name : gameName,
        sport : sportSelected,
        maxPlayers : playersLimit,
        date : completeDate,
        address : this.addressSelected,
        userId: this.authenticationService.userId
      };

      this.saveGame(userInfoService_IN);

    }
      

  }

  saveGame(info: GameInfo){

    this.userInfoService.saveCreatedGame(info).subscribe(res =>{

      this.showSpinner = false;
      //Le envio al componente padre la dirección para que la reciba el mapa y haga zoom sobre ella y la situe
      this.emitEvent.emit(info);

      //Se ha añadido la partida correctamente a la BBDD
      this.addressSelected = null;
      this.gameForm.reset();
      this.serviceResponse = res.text;
      this.openDialog();

    },err => {
      //console.log(err);
      this.showSpinner = false;
      if(err.status === 403){
        this.gameForm.controls['gameName'].setValue(null);
        this.serviceResponse = err.error.text;
      }else{
        this.serviceResponse = 'Fallo en la BBDD, intentar más tarde';
      }
              
      this.openDialog();
    });
  }

}