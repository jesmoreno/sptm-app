import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';


import { key } from '../config/config';

@Injectable()
export class WeatherService {
  

	weatherAPIUrl = 'http://api.openweathermap.org/data/2.5/forecast?lang=es';
	daysNumber = '5';
	units = 'metric';

	constructor(private http: HttpClient) {}


	/**GET: pido informacion de la geolocalizacion*/
	getWeather(id:String){
  		return this.http.get<any>(this.weatherAPIUrl+'&id='+id+'&APPID='+key.weatherAPIkey+'&units='+this.units);
  	};

  	getJSON(): Observable<any> {
    	return this.http.get<any>("../assets/city.list.json");
  	}

}
