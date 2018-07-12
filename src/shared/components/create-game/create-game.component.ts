import { Component, OnInit } from '@angular/core';
import { FormBuilder , FormGroup , Validators , AbstractControl , ValidationErrors } from '@angular/forms';

//Servicios 
import { SportService } from '../../../shared/services/sports.service';
import { LocationService } from '../../../shared/services/location.service';


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
  min = 0;
  step = 1;

  //Cojo la fecha para comprobar al enviar el form de creacion partida
  currentDate = new Date();
  
  //mensajes de error del formulario para la creacion de partido
  requiredField : String = "campo requerido";
  limitExceeded : String;
  dateError : String = this.requiredField;


  //variable para saber si tiene geolocalizacion el navegador
  //Si tiene geoLoc que aparezca botón para coger GeoLoc actual
  geoLocation = false;
  lat : Number;
  long : Number;
  position = [];


  constructor(private fb: FormBuilder, private sportService: SportService, private locationService: LocationService) {}


  ngOnInit(){
    this.hasGeoLocation();
  	this.createForm();
    this.gameFormErrorControl();
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
	    maxPlayers: [this.value,  Validators.required],
      datePick: [null,  Validators.required],
      hour: [null,  Validators.required],
      address: [null,  Validators.required],
	  });
  }

  gameFormErrorControl() {

    this.gameForm.controls['maxPlayers'].statusChanges.subscribe(num => {
      //console.log(num);
      const control = this.gameForm.controls['maxPlayers'];
      if (control.errors){
        if (control.errors.required) {
          this.limitExceeded = this.requiredField;
        }else if(control.errors.exceeded){
          this.limitExceeded = 'Número entre 0 y 30';
        }
      }
    });
  }



  currentPosition = function(){

    //Servicio que pide informacion d ela localizacion mediante API google
    this.locationService.getCurrentPosition().subscribe(res=>{
      console.log("Latitud: "+res.location.lat+", longitud: "+res.location.lng+", radio precision: "+res.accuracy);
    },err => {
      console.log("Code error: "+err.json().error.code+"==> "+err.json().error.message);
    })

  }


  createGame = function(){
    //Compruebo que la fecha elegida no sea menor que la del dia de la creacion de la partida
    let choosenDate = this.gameForm.controls['datePick'].value;
    //seteo campos de hora igual que los de currentDate para evitar fallos comprobando la fecha mayor o igual
    choosenDate.setHours(this.currentDate.getHours());
    choosenDate.setMinutes(this.currentDate.getMinutes());
    choosenDate.setSeconds(this.currentDate.getSeconds());
    choosenDate.setMilliseconds(this.currentDate.getMilliseconds());


    if(choosenDate >= this.currentDate){
      //Si es valido compruebo validez del resto de campos
      //Validez nombre partida (que no exista ya), llamr servicio que consulte en base de datos  



    }else{
      //POP Up de fecha invalida
      alert('La fecha introducida es menor que la actual');
    }

  }

}