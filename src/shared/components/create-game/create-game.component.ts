import { Component, OnInit } from '@angular/core';
import { FormBuilder , FormGroup , Validators , AbstractControl , ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

//Servicios 
import { SportService } from '../../../shared/services/sports.service';
import { LocationService } from '../../../shared/services/location.service';

//POPUPS INFORMACION
import { MatDialog } from '@angular/material';
import { PopupGenericComponent } from '../../components/popUp/popup-generic.component';


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



@Component({
  selector: 'create-game',
  templateUrl: './create-game.component.html',
  styleUrls: ['./create-game.component.css']
})


export class CreateGameComponent implements OnInit{

  //Formulario y array de deportes posibles
	gameForm : FormGroup;
  sports : string[];
  
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

  constructor(private fb: FormBuilder, private sportService: SportService, private locationService: LocationService, public dialog: MatDialog,) {}


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

    let gameName = this.gameForm.controls['gameName'].value;
    let sportSelected = this.gameForm.controls['sport'].value;
    let playersLimit = this.gameForm.controls['maxPlayers'].value;
    let date = this.gameForm.controls['datePick'].value;
    //let hour = this.gameForm.controls['hour'].value;
    let address = this.gameForm.controls['address'].value;     

    //Separo la direccion para adaptarlo al formato de la API, elimino espacios antes y despues de cada string
    let string = address.split(',');
    let street = string[0].trim();
    let number = string[1].trim();
    let CPandCity = string[2].trim();

    //let completeDate = new Date(date.getFullYear(), date.getMonth()+1, date.getDate(), hour.split(':')[0], hour.split(':')[1]);
    //console.log(completeDate);

    //let completeDate = date.getFullYear()+', '+(date.getMonth()+1)+','+ date.getDate(), hour.split(':')[0], hour.split(':')[1]
    //console.log(gameName+' '+sportSelected+' '+playersLimit+' '+date+' '+hour+' '+address);

    /*this.locationService.getCurrentPositionLatAndLog(street+','+number+','+CPandCity).subscribe(res =>{
      switch (res.status) {
          case "OK":

            let addressToSave = {

              formatted_address: res.results[0].formatted_address,
              geometry: res.results[0].geometry,
              place_id: res.results[0].place_id

            };

            console.log(res.results);

            //Servicio para almacenar los datos en BBDD

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