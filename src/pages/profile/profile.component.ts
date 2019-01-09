import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';

//Necesario para redirigir cuando cambia el nombre
import { Router } from "@angular/router";

//Servicios 
import { AuthenticationService } from '../../shared/services/authentication.service';
import { UserInfoService } from '../../shared/services/user.info.service';
import { SportService } from '../../shared/services/sports.service';

//Interfaz para datos de la tabla
import { UserDataTable } from '../../shared/models/user-data-table';
//Interfaz objetos
import { UpdatedUser } from '../../shared/models/updated-user';

//Componentes
import { NewPassworComponent } from '../../shared/components/new-password/new-password.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	//escucha el evento de cancelar o aceptar popUp cambiar contraseña
	@ViewChild('newPassword') passwordEvent: NewPassworComponent;

	fields: UserDataTable[] = new Array(5);
	//Objeto para controlar los inputs modificados
	modifiedsFieldsForm : FormGroup;

	//Array para indicar campos editables
	arrayEditableFields = [true,false,true,true,true,true];
	//Arrays para el estado de los botones, edición o guardar
	arrayShowConfirmButton : boolean[] = [false,false,false,false,false,false];
	arrayBlockEditButton : boolean[] = [false,false,false,false,false,false];
	
	//Atributos para modificar el input
	onlyRead : boolean[] = [true,true,true,true,true,true];

	//Indice activo cuando lo pulsas
	indexActive: number;

	//Array de deportes para mostrar en la tabla cuando se quiera editar
	sports : string[];

	//Boolean para mostrar el popUp cambio de contraseña y esconderlo
	showPasswordPopUp: boolean = false;

	//Numero para indicar al hijo el fallo (POPUP), inicialmente el 0
	errorCode: number = 0;

	//Booleano guardado correctamente (todo)
	savedOK: boolean = false;
	//Booleano falla el guardado (todo menos contraseña)
	savedKO: boolean = false;

	//Boleano para mostrar el spinner
	showSpinner : boolean = false;

	//Mensajes de fallo guardando
	errorMessages :string[] = ['Usuario ya existente.','El código postal debe ser de 5 dígitos.','Error desconocido, intentar más tarde.'];
	errorToShow: string;

	//Valor inicial del codigo postal
	oldPostCode: string;

	constructor(private fb: FormBuilder, private authenticationService: AuthenticationService, private userInfoService: UserInfoService, 
		private sportService: SportService, private router: Router) { }

	ngOnInit() { 

		this.showSpinner = true;
		this.getUserInfo();

    	this.passwordEvent.emitEvent
    	.subscribe(res => {
    		
    		//Cuando el POPUP de cambio de contraseña es cancelado o aceptado
    		if(!res.confirmed){//ha sido cancelada
    			this.showPasswordPopUp = false;
    		}else{//Pulsado confirmar, compruebo si la vieja es válida
    			this.updatePassword({userName: this.authenticationService.userName,oldPassword: res.oldPassword, newPassword: res.newPassword});
    		}

    	});


	}


	//Servicio para recuperar la info del usuario nada más cargar la pagina
	getUserInfo(){
		this.userInfoService.getUserInfo(this.authenticationService.userName).subscribe(info => {

			//Guardo el valor inicial del codigo postal
			this.oldPostCode = info.postCode;

			this.fields[0] = {name:'Nombre de usuario',value:info.name, formControlName:'name'};
			this.fields[1] = {name:'Correo',value:info.email, formControlName:'email'};
			this.fields[2] = {name:'Contraseña',value:'*****',formControlName:'passwd'};
			this.fields[3] = {name:'Deporte favorito',value:info.favSport, formControlName:'favSport'};
			this.fields[4] = {name:'Ciudad',value:info.city, formControlName:'city'};
			this.fields[5] = {name:'Código postal',value:info.postCode, formControlName:'postCode'};

			//Una vez tengo los datos genero el formulario y consigo la lista de deportes por si hay que editarla
			this.createUserInfoInputs();
			this.sports = this.sportService.getSports();

			this.showSpinner = false;		

		}, err =>{
			console.log(err);
			this.showSpinner = false;		
		})
	}

	createUserInfoInputs() {
    	this.modifiedsFieldsForm = this.fb.group({
      		name: [this.fields[0].value],
      		email: [this.fields[1].value],
      		passwd: [this.fields[2].value],
      		favSport: [this.fields[3].value],
      		city: [this.fields[4].value],
      		postCode: [this.fields[5].value]
    	});
  	}

	modify(data,index){

		//Para el campo contraseña muestro popUp y no sera campo editable en la tabla ni cambiará el icono de editar a guardar
		if(index != 2){
			this.arrayShowConfirmButton[index] = true;
			this.onlyRead[index] = false;
			this.blockEditButtons(this.arrayBlockEditButton,index);
			this.indexActive = index;
		}else{//muestro el popUp
			this.showPasswordPopUp = true;
		}
		
	}

	confirmChange(data,index){

		//Vuelve el icono editar
		this.arrayShowConfirmButton[index] = false;
		//Activo readonly en el elemento que se ha editado
		this.onlyRead[index] = true;
		//Desbloqueo resto de botones al terminar de ser editado el seleccionado
		this.resetEditButtonsState(this.arrayBlockEditButton);
		//Variable para cambiar fondo
		this.indexActive = null

		//Datos del objeto para enviar en el servicio
		let dataToSave = this.modifiedsFieldsForm.controls[this.fields[index].formControlName].value;
		let fieldToSave =  this.fields[index].formControlName;
		
		if(fieldToSave === "name"){ //Para enviar el nuevo nombre cumpliendo el formato de la interfaz
			fieldToSave = 'newName'
		}


		//Genero el objeto a enviar en el servicio
		let updateProfile_IN = {
			name: this.authenticationService.userName,
			field: fieldToSave
		};
		let key = fieldToSave;
		updateProfile_IN[key] = dataToSave;

		//console.log(updateProfile_IN);

		//La contraseña se guarda a traves de un popUP
		if(fieldToSave!="passwd"){
			this.updateProfile(updateProfile_IN);
		}
		
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

	updatePassword (data) {

		this.showSpinner = true;

		this.userInfoService.updatePassword(data).subscribe(res => {
				//Ha actualizado password correctamente
        		this.errorCode = null;
        		this.savedOK = true;
        		this.showPasswordPopUp = false;

        		this.showSpinner = false;
      		}, err => {
      			//console.log('Mensaje error codigo 1 en el padre');
      			this.errorCode = 1;
      			this.showSpinner = false;
      	});
	}

	updateProfile (data: UpdatedUser){
		
		let savedOK : boolean = false;

		this.showSpinner = true;

		this.userInfoService.updateProfile(data).subscribe(res => {
			
			if(this.savedKO){ // por si ha intentado guardar previamente y ha fallado, quito el mensaje
				this.savedKO = false;
			}
			this.savedOK = true;

			//Actualizo el valor del codigo postal viejo por si lo quiere modificar otra vez
			this.oldPostCode = this.modifiedsFieldsForm.controls['postCode'].value;

			if(data.newName){//Si ha camiado bien el nombre, redirijo al login para iniciar sesion con el nombre nuevo y elimino el token de sesion
				this.router.navigate(['/login']);
				this.authenticationService.logout();
			}

			this.showSpinner = false;

		}, err =>{
			//console.log(err);
			if(this.savedOK){ // por si ha intentado guardar previamente correctamente, quito el mensaje
				this.savedOK = false;
			}
			this.savedKO = true;

			if(err.status === 403){//Error en los datos
				if(err.error.errorCodeToShow === 0){
					this.errorToShow = this.errorMessages[0];
				}else{//err.errorCodeToShow === 1
					this.errorToShow = this.errorMessages[1];
				}
			}else{//Error del servidor (500)
				this.errorToShow = this.errorMessages[2];
			}

			
			//Si fallo al guardar reseteo los valores de los campos a sus valores originales
			if(data.newName){
				this.modifiedsFieldsForm.controls['name'].setValue(this.authenticationService.userName);
			}else if(data.postCode){
				this.modifiedsFieldsForm.controls['postCode'].setValue(this.oldPostCode);
			}
			
			this.showSpinner = false;
		});

	}
    
    onCloseClick() { //Cierra el div informando de si ha guardado correctamente
    	this.savedKO = false;
    	this.savedOK = false;
    }

}
