import { Injectable } from '@angular/core';


@Injectable()
export class SportService {
  
	sports: string[] = ['Baloncesto', 'Fútbol', 'Tenis', 'Pádel'];

  	getSports(): string[] {
    	return this.sports;
  	}
}