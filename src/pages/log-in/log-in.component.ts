import { Component, OnInit } from '@angular/core';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';


//Necesario para redirigir
import { Router } from "@angular/router";
//Para identificar los campos de la respuesta
import { ResponseMessage } from '../../shared/models/response-message';
import { PopupGenericComponent } from '../../shared/components/popUp/popup-generic.component';
//Servicios
import { AuthenticationService } from '../../shared/services/authentication.service';

//Necesario para el popUp
import { MatDialog } from '@angular/material';



@Component({
  selector: 'login',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {


    loginForm : FormGroup;
	  submitted: Boolean = false;
  	required = 'Campo requerido';
    logInfo : String;
    userName : String;

    //Valor inicial de la URL donde redirigir si se logea con exito
    urlToNavigate = "/home";

  	constructor(private fb: FormBuilder, private router: Router,
      private authenticationService: AuthenticationService, public dialog: MatDialog) { }


///////////////////////////// METODOS PARA ABRIR EL  POPUP //////////////////////////////////////////
    openDialog(): void {
      let dialogRef = this.dialog.open(PopupGenericComponent, {
        width: '250px',
        data: { text: this.logInfo, userName: this.userName, url: this.urlToNavigate }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        //this.text = result;
      });
    }
///////////////////////////////////////////////////////////////////////////////////



  	ngOnInit() {
      //cierro mi sesion si estaba abierta y creo el formulario
      this.authenticationService.logout();
  		this.createLoginForm();
  	}

  	createLoginForm() {
    	this.loginForm = this.fb.group({
      		name: [null, Validators.required],
      		passwd: [null, Validators.required],
    	});
    }


    //Acciones al clickear sobre el boton
    login () {
    
      this.authenticationService.login(this.loginForm.value['name'],this.loginForm.value['passwd']).subscribe(res => 
        {
          // login successfull, there's a jwt token in the response
          let token = res.token;
          let codeStatus = res.status;
          let text = res.text;

          // set token property and userName in authentication service
          this.authenticationService.token = token;
          this.authenticationService.userName = this.loginForm.value['name'];
          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify({ username: this.loginForm.value['name'], token: token }));

          //texto mensaje respuesta del servidor
          this.userName = this.loginForm.value['name'];
          this.logInfo = res.text;
          //Si previamente ha fallado el login habra dejado urlToNavigate a undefined, la cambio a su valor original
          this.urlToNavigate = "/home";
          this.openDialog();

      },
      err => {

        //console.log(err);
        //texto mensaje respuesta del servidor
        this.logInfo = err.json().text;
        //Al estar mal la info de login me quedo en la pagina login
        this.urlToNavigate = undefined;
        this.openDialog();
      });
    }
  	
}
