import { Component, OnInit } from '@angular/core';
import { PopupGenericComponent } from '../../shared/components/popUp/popup-generic.component';

//Necesario para el popUp
import { MatDialog } from '@angular/material';
//Servicios
import { WeatherService } from '../../shared/services/weather.service';


@Component({
  selector: 'weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})

export class WeatherComponent implements OnInit {

	//Array días de la semana utilizado para saber los días de la información recogida por el servicio
	weekDays = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
	//Array de información del tiempo
	weatherInfo = [];
	//Nombre de la ciudad buscada
	city : String = "";
	//Texto si no encuentro la ciudad falla el servicio
	cityWeatherInfo : String;


	//URL google geocoding
	urlGoogle = 'https://maps.googleapis.com/maps/api/geocode/json?address=Madrid';

	constructor(public dialog: MatDialog, private weatherService: WeatherService) {}

	ngOnInit() {
		//Llamada inicial consultando id ciudad usuario metida en el registro
		this.getWeekWeather('3129356');
  	}


  	///////////////////////////// METODOS PARA ABRIR EL  POPUP //////////////////////////////////////////
    openDialog(): void {
      let dialogRef = this.dialog.open(PopupGenericComponent, {
        width: '250px',
        data: { text: this.cityWeatherInfo}
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        //this.text = result;
      });
    }
	///////////////////////////////////////////////////////////////////////////////////



  	getWeekWeather(id:String){



  		this.weatherService.getWeather(id).subscribe(val => {

  			//Vacío el array de datos si se ha rellenado con busqueda anterior
  			if(this.weatherInfo.length){
  				this.weatherInfo = [];
  			}

  			this.city = val.city.name.toString();
  			//Bucle para coger el tiempo de 5 días de la semana
  			for(var i=0;i<=4;i++){
  				let date = new Date(val.list[i].dt*1000);
  				let weekDay = this.weekDays[date.getDay()];
  				let maxTemp = val.list[i].temp.max.toString().split('.')[0];
  				let minTemp = val.list[i].temp.min.toString().split('.')[0];
  				let averageTemp =  val.list[i].temp.day.toString().split('.')[0];
  				let imgURL = "http://openweathermap.org/img/w/"+val.list[i].weather[0].icon+".png";
  				
  				let objDay = {
  					'weekDay': weekDay,
  					'maxTemp': maxTemp,
  					'minTemp': minTemp,
  					'averageTemp': averageTemp,
  					'imgURL': imgURL
  				};

  				this.weatherInfo.push(objDay);
  			}

  		},err => {
        	console.log(err);
        	this.cityWeatherInfo = "Error cargando los datos, intentar más tarde";
        	this.openDialog();
  		});

  	}

  	//Acción del botón
  	search(){

  		this.weatherService.getJSON().subscribe(val=>{
			//console.log(val);
			function getCityData(cityName) {
    			return cityName.country == 'ES'  &&  cityName.name == this;
			}

			let cityNameToCompare = this.city;
			let foundCity = val.find(getCityData,cityNameToCompare);

			//SI NO ENCUENTRO LA CIUDAD MOSTRAR POPUP INFORMANDOLO
			if(!foundCity){
				console.log("Ciudad no encontrada");
				this.cityWeatherInfo = "Ciudad no encontrada";
				this.openDialog();
			}else{
				this.getWeekWeather(foundCity.id);
			}

			
		});
  	}
}