import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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

//Interfaz entrada servicios
import { GameInfo } from '../../models/game-info';


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


//Comprobar formato direccion del partido
const AddressValidator = function(ac : AbstractControl): ValidationErrors | null {

  if(ac.value['address']){
    
    let addressArray = ac.value['address'].split(',');
    if(addressArray.length === 3 && addressArray[2]!=''){
      return null;
    }else{
      //console.log(addressArray);
      ac.get('address').setErrors({'invalidFormat' : {value : ac.value}});
      return { 'invalidFormat' : {value : ac.value} };
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


export class CreateGameComponent implements OnInit{

  //Formulario y array de deportes posibles
	gameForm : FormGroup;
  sports : string[];
  
  //Salida del componente, cuando crea la partida.
  @Output() emitEvent:EventEmitter<any> = new EventEmitter<any>();

  //Variables para el slider
  value = Number;
  disabled = false;
  max = 30;
  min = 2;
  step = 1;
  
  //Mensajes de error del formulario para la creacion de partido
  requiredField : string = "campo requerido";
  dateError : string = 'Fecha inválida, anterior a la actual';
  addressError : string = 'Formato de dirección inválido'

  //Variable para saber si tiene geolocalizacion el navegador
  geoLocation: boolean = false;
  lat : number;
  long : number;

  //MENSAJES RESPUESTA SERVICIOS 
  urlToNavigate:string = '/home'; 
  serviceResponse:string;

  //Array con direcciones posibles al coger posicion
  addresses :string[] = [];

  //Implementacion personalizada cuando muestra errores de validacion del formulario
  matcher = new MyErrorStateMatcher();

  constructor(private fb: FormBuilder, private sportService: SportService, private locationService: LocationService, public dialog: MatDialog,
                  private userInfoService : UserInfoService, private authenticationService: AuthenticationService) {}


  ngOnInit(){
    this.hasGeoLocation();
  	this.createForm();
  }


  ///////////////////////////// METODOS PARA ABRIR EL  POPUP //////////////////////////////////////////
  openDialog(): void {
    let dialogRef = this.dialog.open(PopupGenericComponent, {
      width: '250px',
      data: { text: this.serviceResponse, url: this.urlToNavigate }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed in create new game');
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
	    gameName: [null,  Validators.required],
	    sport: [null,  Validators.required],
	    maxPlayers: [this.value, Validators.required],
      datePick: [null,  Validators.required],
      hour: [null,  Validators.required],
      address: [null,  Validators.required],
	  },{
      validator: Validators.compose([DateValidator,AddressValidator])
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

    this.getLocation().subscribe(coords => {
      
      this.lat = coords.coords.latitude;
      this.long = coords.coords.longitude;

      //Llamo a la API de google para obtener la calle etc;
      this.locationService.getCurrentPositionAddress(this.lat+','+this.long).subscribe(res =>{
        
        switch (res.status) {
          case "OK":
            for (var i = 0; i < res.results.length; i++) {
              this.addresses[i] = res.results[i].formatted_address;
            }
            //Modifico la respuesta para adaptarlo al formato del input de dirección
            //elimino la parte que indica el pais
            var addressSplited = this.addresses[0].split(',',3);
            this.addresses[0] = addressSplited.toString();
            //Seteo el input address
            this.gameForm.controls['address'].setValue(this.addresses[0]);

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
      })


    },err =>{
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
    let address = this.gameForm.controls['address'].value;     

    //Separo la direccion para adaptarlo al formato de la API, elimino espacios antes y despues de cada string
    let string = address.split(',');
    let street = string[0].trim();
    let number = string[1].trim();
    let CPandCity = string[2].trim();


    let userInfoService_IN : GameInfo = {
      host : 'Jesús',
      name : 'Partida 4',
      sport : 'Tenis',
      maxPlayers : 2,
      date : '2019-01-28T16:45:00',
      address : {
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
          coordinates: [40.266871,-3.920791]
        },
        place_id: "ChIJzRMql5aSQQ0RAW_h1DC6ixc"
      }
    };


    this.userInfoService.saveCreatedGame(userInfoService_IN).subscribe(res =>{

              //Le envio al componente padre la dirección para que la reciba el mapa y haga zoom sobre ella y la situe
              this.emitEvent.emit({title: gameName,address:
                  {
                    formatted_address: "Calle de Ávila, 14, 28939 Arroyomolinos",
                    location: {
                      coordinates: [40.26660750000001,-3.9207574]
                    },
                    place_id: "ChIJzRMql5aSQQ0RAW_h1DC6ixc"
                  }
              });
              //Se ha añadido la partida correctamente a la BBDD
              this.gameForm.reset();
              this.serviceResponse = res.text;
              this.openDialog();

            },err => {

              if(err.status === 403){
                this.gameForm.controls['gameName'].setValue(null);
                this.serviceResponse = err.error.text;
              }else{
                this.serviceResponse = 'Fallo en la BBDD, intentar más tarde';
              }
              
              this.openDialog();
    });



    /*this.locationService.getCurrentPositionLatAndLog(street+','+number+','+CPandCity).subscribe(res =>{
      switch (res.status) {
          case "OK":

            console.log(res);
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
            //Formatio de la direccion devuelto por la API que guardo en BBDD
            let addressToSave = {

              formatted_address: res.results[0].formatted_address,
              geometry: {
                location: res.results[0].geometry.location,
              }
              place_id: res.results[0].place_id

            };


            let userInfoService_IN : GameInfo = {
              host : this.authenticationService.userName,
              name : gameName,
              sport : sportSelected,
              maxPlayers : playersLimit,
              date : completeDate,
              address : address
            };

            this.userInfoService.saveCreatedGame(userInfoService_IN).subscribe(res =>{

              //Le envio al componente padre la dirección para que la reciba el mapa y haga zoom sobre ella y la situe
              this.emitEvent.emit({title: gameName,address:address});
              //Se ha añadido la partida correctamente a la BBDD
              this.gameForm.reset();
              this.serviceResponse = res.text;
              this.openDialog();

            },err => {
              //console.log(err);
              if(err.status === 403){
                this.gameForm.controls['gameName'].setValue(null);
                this.serviceResponse = err.error.text;
              }else{
                this.serviceResponse = 'Fallo en la BBDD, intentar más tarde';
              }
              
              this.openDialog();
            });

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
      this.serviceResponse = 'Fallo recuperando la información, intentar mas tarde.';
      this.openDialog();
    })*/  

  }

}