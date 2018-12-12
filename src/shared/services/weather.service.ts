import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';

@Injectable()
export class WeatherService {
  

	weatherAPIUrl = 'https://openweathermap.org/data/2.5/forecast/daily?lang=es&appid=b6907d289e10d714a6e88b30761fae22';

	constructor(private http: HttpClient) {}


	/**GET: pido informacion de la geolocalizacion*/
	getWeather(id:String){
  		return this.http.get<any>(this.weatherAPIUrl+'&id='+id);
  	};

  	getJSON(): Observable<any> {
    	return this.http.get<any>("../assets/city.list.json");
  	}

}
