import { Component, OnInit } from '@angular/core';

//Servicios 
import { AuthenticationService } from '../../shared/services/authentication.service';
import { UserInfoService } from '../../shared/services/user.info.service';

//Interfaz para datos de la tabla
import { UserDataTable } from '../../shared/models/user-data-table';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	fields: UserDataTable[] = new Array(5);
	arrayConfirms : boolean[] = [false,false,false,false,false];

	constructor(private autheticationService: AuthenticationService, private userInfoService: UserInfoService) { }

	ngOnInit() { 
		this.getUserInfo();
	}


	getUserInfo(){
		this.userInfoService.getUserInfo(this.autheticationService.userName).subscribe(info => {

			this.fields[0] = {name:'Nombre de usuario',value:info.name};
			this.fields[1] = {name:'Correo',value:info.email};
			this.fields[2] = {name:'Contraseña',value:'*****'};
			this.fields[3] = {name:'Deporte favorito',value:info.favSport};
			this.fields[4] = {name:'Ciudad',value:info.city};
			/*this.userName = info.name;
			this.userEmail = info.email;
			this.favSport = c;
			this.city = info.city;*/

		}, err =>{
			console.log(err);
		})
	}

	modify(event,data,index){
	
		this.arrayConfirms[index] = true;
	}

	confirmChange(event,data,index){

		this.arrayConfirms[index] = false;
		
	}

}
