import { Component, OnInit } from '@angular/core';
import { PopupGenericComponent } from '../../shared/components/popUp/popup-generic.component';

//Necesario para el popUp
import { MatDialog } from '@angular/material';
//Servicios
import { WeatherService } from '../../shared/services/weather.service';
import { UserInfoService } from '../../shared/services/user.info.service';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { Observable } from 'rxjs/Observable';
//Componente propio
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})

export class WeatherComponent implements OnInit {

	//Array días de la semana utilizado para saber los días de la información recogida por el servicio
	weekDays = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
	//Array de información del tiempo para la ciudad buscada
	weatherInfo = [];
	//Nombre de la ciudad inicial del usuario y posteriormente buscada
  cityToSearch : string = null;
	//Texto si no encuentro la ciudad falla el servicio
	cityWeatherInfo : String;
  //JSON con las ciudades para buscar el tiempo
  citiesJSON: any;
  //booleano para saber si la ciudad existe
  exist : boolean = true;
  //URL a la que va cuando falla la llamada del servicio
  urlToNavigate : string = "/weather"
	


  //URL google geocoding
	//urlGoogle = 'https://maps.googleapis.com/maps/api/geocode/json?address=Madrid';

	constructor(public dialog: MatDialog, private weatherService: WeatherService, private userService: UserInfoService,
    private authenticationService: AuthenticationService) {}

	ngOnInit() {
    //Recupero los datos de la ciudad con la que se registro el usuario (cityToSearch)
    this.getUserCity();
    //Busco en el JSON el tiempo de la ciudad origen(con el nombre), si existe me devuelve su id y hago la llamada a 
    //la API con ese id para obtener el tiempo
    this.search(this.cityToSearch);
  }


  	///////////////////////////// METODOS PARA ABRIR EL  POPUP SI FALA EL SERVCIO//////////////////////////////////////////
    openDialog(): void {
      let dialogRef = this.dialog.open(PopupGenericComponent, {
        width: '250px',
        data: { text: this.cityWeatherInfo, userName: this.authenticationService.userName, url: this.urlToNavigate}
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        //this.text = result;
      });
    }
	///////////////////////////////////////////////////////////////////////////////////

  getUserCity() {

    this.userService.getUserInfo(this.authenticationService.userName).subscribe(res=>{
      this.cityToSearch = res.city;
    });

  }

  	getWeekWeather(id:String){

  		this.weatherService.getWeather(id).subscribe(val => {

  			//Vacío el array de datos si se ha rellenado con busqueda anterior
  			if(this.weatherInfo.length){
  				this.weatherInfo = [];
  			}

  			this.cityToSearch = val.city.name.toString();
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

    //Consigue el id de la ciudad a partir del JSON con todas
    private getCityId = function(citiesJSON){

      function getCityData(cityName) {
            return cityName.country == 'ES'  &&  cityName.name == this;
      }

      let cityNameToCompare = this.cityToSearch;
      let foundCity = citiesJSON.find(getCityData,cityNameToCompare);

      return foundCity;
    }


  //Acción del botón y busqueda inicial
  search(city){

    this.cityToSearch = city;

    if(!this.citiesJSON){
      
      this.weatherService.getJSON().subscribe(citiesJSON =>{

        this.citiesJSON = citiesJSON;
        let foundCity = this.getCityId(this.citiesJSON);
        this.exist = foundCity;

        if(foundCity){
          this.getWeekWeather(foundCity.id);
        }
      
      });

    }else{

      let foundCity = this.getCityId(this.citiesJSON);
      this.exist = foundCity;
      //SI NO ENCUENTRO LA CIUDAD MOSTRAR POPUP INFORMANDOLO
      if(foundCity){
        this.getWeekWeather(foundCity.id);
      }
    }
  }



}