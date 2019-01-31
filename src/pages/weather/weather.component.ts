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
	weatherInfo : any[];
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
	
  //Booleano mostrar espinner durante carga 
  showSpinner: boolean;

	constructor(public dialog: MatDialog, private weatherService: WeatherService, private userService: UserInfoService,
    private authenticationService: AuthenticationService) {
    this.weatherInfo = [];
  }

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

  			//this.cityToSearch = val.city.name;
        //console.log(new Date(val.list[0].dt*1000));

        let lastDateToCompare = new Date();
        //Posicion en el array principal donde insertar toda la info del dia
        let dayPos = 0;

        for(var i=0;i<val.list.length;i++){

          if(i===0){
            this.weatherInfo[0] = new Array();
            this.weatherInfo[0].push(val.list[0]);
          }else{

            let listDate = new Date(val.list[i].dt*1000);

            if(listDate.getDate() === lastDateToCompare.getDate() && listDate.getMonth() === lastDateToCompare.getMonth()){
              console.log('Posicion array 1: '+dayPos);
              this.weatherInfo[dayPos].push(val.list[i]);
            }else{//Al no coincidir, avanzo la fecha a comparar y el indice para guardar
              lastDateToCompare.setDate(lastDateToCompare.getDate()+1);
              dayPos++;
              this.weatherInfo[dayPos] = new Array();
            }
          }
          
        }

        //Me quedo solo con 5 dias, el servicio devuelve 40 siempre que pueden llegar a incluir 6 dias
        this.weatherInfo = this.weatherInfo.slice(0,5);
        
        //Seteo propiedad dia en el primer elemento de cada array con el dia (lunes,martes....)
        this.weatherInfo.forEach(function(element){
          let date = new Date(element[0].dt*1000);
          element[0].weekDay = this.weekDays[date.getDay()];
        });

        console.log(this.weatherInfo);

  			//Bucle para coger el tiempo de 5 días de la semana
  			/*for(var i=0;i<val.list.length;i++){
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

        this.showSpinner = false;*/

  		},err => {
        	//console.log(err);

          this.showSpinner = false;   
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
    //Spinner previo a la busqueda
    //this.showSpinner = true;

    if(!this.citiesJSON){
       
      this.weatherService.getJSON().subscribe(citiesJSON =>{

        this.citiesJSON = citiesJSON;
        let foundCity = this.getCityId(this.citiesJSON);
        this.exist = foundCity;

        if(foundCity){
          this.getWeekWeather(foundCity.id);
        }else{// no hay ciudad con ese nombre y cierro el spinner
          //this.showSpinner = false;
        }
      
      }, err => {
        //this.showSpinner = false;
      });

    }else{

      let foundCity = this.getCityId(this.citiesJSON);
      this.exist = foundCity;
      //SI NO ENCUENTRO LA CIUDAD MOSTRAR POPUP INFORMANDOLO
      if(foundCity){
        this.getWeekWeather(foundCity.id);
      }else{// no hay ciudad con ese nombre y cierro el spinner
          //this.showSpinner = false;
      }
    }
  }



}