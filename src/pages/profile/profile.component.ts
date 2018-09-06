import { Component, OnInit } from '@angular/core';

import { FormBuilder , FormGroup , Validators} from '@angular/forms';


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
	//Objeto para controlar los inputs modificados
	modifiedsFieldsForm : FormGroup;

	//Arrays para el estado de los botones, edición o guardar
	arrayShowConfirmButton : boolean[] = [false,false,false,false,false];
	arrayBlockEditButton : boolean[] = [false,false,false,false,false];
	
	//Atributos para modificar el input
	onlyRead : boolean[] = [true,true,true,true,true];


	constructor(private fb: FormBuilder, private autheticationService: AuthenticationService, private userInfoService: UserInfoService) { }

	ngOnInit() { 
		this.getUserInfo();
	}


	//Servicio para recuperar la info del usuario nada más cargar la pagina
	getUserInfo(){
		this.userInfoService.getUserInfo(this.autheticationService.userName).subscribe(info => {

			this.fields[0] = {name:'Nombre de usuario',value:info.name, formControlName:'name'};
			this.fields[1] = {name:'Correo',value:info.email, formControlName:'email'};
			this.fields[2] = {name:'Contraseña',value:'*****',formControlName:'passwd'};
			this.fields[3] = {name:'Deporte favorito',value:info.favSport, formControlName:'favSport'};
			this.fields[4] = {name:'Ciudad',value:info.city, formControlName:'city'};

			this.createUserInfoInputs();

		}, err =>{
			console.log(err);
		})
	}

	createUserInfoInputs() {
    	this.modifiedsFieldsForm = this.fb.group({
      		name: [this.fields[0].value],
      		email: [this.fields[1].value],
      		passwd: [this.fields[2].value],
      		favSport: [this.fields[3].value],
      		city: [this.fields[4].value]
    	});
  	}

	modify(data,index){

		this.arrayShowConfirmButton[index] = true;
		this.onlyRead[index] = false;
		this.blockEditButtons(this.arrayBlockEditButton,index);
	}

	confirmChange(data,index){

		//Vuelve el icono editar
		this.arrayShowConfirmButton[index] = false;
		//Activo readonly en el elemento que se ha editado
		this.onlyRead[index] = true;
		//Desbloqueo resto de botones al terminar de ser editado el seleccionado
		this.resetEditButtonsState(this.arrayBlockEditButton);

		let dataToSave = this.modifiedsFieldsForm.controls[this.fields[index].formControlName].value;



		console.log(dataToSave);
	}

	//Función para desbloquear todos los botones cuando se guarda el cambio
	private resetEditButtonsState(array: boolean[]) : boolean[]{
		
		for(var i=0 ; i<array.length ; i++){
			array[i] = false;
		}

		return array;
	}

	//Función para bloquear el resto de botones editar cuando se va a modificar 1
	private blockEditButtons(array: boolean[],index: number): boolean[]{
		
		for(var i=0 ; i<array.length ; i++){
			if(i != index){
				array[i] = true;
			}
		}

		return array;
	}

}
