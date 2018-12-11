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
      console.log('Fallo de fecha');
      ac.get('datePick').setErrors({'invalidDate' : {value : ac.value}});
      return { 'invalidDate' : {value : ac.value} };
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
      validator: DateValidator
    });
  }

  currentPosition = function(){



  }


  createGame = function(){
    //Compruebo que la fecha elegida no sea menor que la del dia de la creacion de la partida
    let choosenDate = this.gameForm.controls['datePick'].value;
    //seteo campos de hora igual que los de currentDate para evitar fallos comprobando la fecha mayor o igual
    choosenDate.setHours(this.currentDate.getHours());
    choosenDate.setMinutes(this.currentDate.getMinutes());
    choosenDate.setSeconds(this.currentDate.getSeconds());
    choosenDate.setMilliseconds(this.currentDate.getMilliseconds());


    if(choosenDate.getTime() >= this.currentDate.getTime()){
      //Si es valido compruebo validez del resto de campos
      //Validez nombre partida (que no exista ya), llamr servicio que consulte en base de datos  



    }else{
      //POP Up de fecha invalida
      alert('La fecha introducida es menor que la actual');
    }

  }

}