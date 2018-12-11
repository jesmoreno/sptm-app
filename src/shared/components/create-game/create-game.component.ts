import { Component, OnInit } from '@angular/core';
import { FormBuilder , FormGroup , Validators , AbstractControl , ValidationErrors } from '@angular/forms';

//Servicios 
import { SportService } from '../../../shared/services/sports.service';
import { LocationService } from '../../../shared/services/location.service';


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


//Comprobar fecha partido
const AddressValidator = function(ac : AbstractControl): ValidationErrors | null {

  if(ac.value['address']){
    
    let addressArray = ac.value['address'].split(',');
    if(addressArray.length === 4 && addressArray[3]!=''){
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

 
	gameForm : FormGroup;
  sports : String[];
  
  //variables para el slider
  value = Number;
  disabled = false;
  max = 30;
  min = 2;
  step = 1;

  //Cojo la fecha para comprobar al enviar el form de creacion partida
  currentDate = new Date();
  
  //mensajes de error del formulario para la creacion de partido
  requiredField : string = "campo requerido";
  dateError : string = 'Fecha inválida, anterior a la actual';
  addressError : string = 'Formato de dirección inválido'

  //variable para saber si tiene geolocalizacion el navegador
  //Si tiene geoLoc que aparezca botón para coger GeoLoc actual
  geoLocation: boolean = false;
  lat : number;
  long : number;
  position = [];


  constructor(private fb: FormBuilder, private sportService: SportService, private locationService: LocationService) {}


  ngOnInit(){
    this.hasGeoLocation();
  	this.createForm();
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

  currentPosition = function(){



  }


  createGame = function(){

    let gameName = this.gameForm.controls['gameName'].value;
    let sportSelected = this.gameForm.controls['sport'].value;
    let playersLimit = this.gameForm.controls['maxPlayers'].value;
    let date = this.gameForm.controls['datePick'].value;
    let hour = this.gameForm.controls['hour'].value;
    let address = this.gameForm.controls['address'].value;     

    console.log(gameName+' '+sportSelected+' '+playersLimit+' '+date+' '+hour+' '+address);

  }

}