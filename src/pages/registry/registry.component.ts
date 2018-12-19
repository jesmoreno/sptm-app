import { Component, OnInit } from '@angular/core';
import { FormBuilder , FormGroup , Validators , AbstractControl , ValidationErrors } from '@angular/forms';

//Componentes
import { PopupGenericComponent } from '../../shared/components/popUp/popup-generic.component';

//Servicios
import { SportService } from '../../shared/services/sports.service';
import { ResgistryService } from '../../shared/services/registry.service';

//Modelo de datos
import { User } from '../../shared/models/user';
import { ResponseMessage } from '../../shared/models/response-message';

//Necesario para el popUp
import { MatDialog } from '@angular/material';

//Necesario para redirigir a pagina de LOGIN
import { Router } from "@angular/router";


//Comprobar contraseña
const PasswordValidator = function(ac : AbstractControl): ValidationErrors | null {


  if(Object.is(ac.value['passwd'],ac.value['confirmpasswd'])){

      return null;
  }else{
    //Para lanzar el error necesita setear el error en el FormControl del confirmpasswd.
    ac.get('confirmpasswd').setErrors({ 'noMatch' : {value : ac.value} });
    return { 'noMatch' : {value : ac.value} };
  }
};


@Component({
  selector: 'registry',
  templateUrl: './registry.component.html',
  styleUrls: ['./registry.component.css']
})

export class RegistryComponent implements OnInit {

  registryForm : FormGroup;
  //Variable para guardar el nombre de usuario e imprimirlo en el popUp tras el registro
  userName: string;
  sports : string[];

  //texto de respuesta del servidor
  responseText : string;

  //URL a la que dirigir al registrarse con exito
  urlToNavigate = "/login";

  //Array respuestas servidor
  messages : string[] = ['Email ya resgistrado','Nombre de usuario ya existente'];

  //MENSAJES ERROR FORMULARIO
  requiredField =  'Campo requerido';
  errorUserName : string = this.requiredField;
  errorEmail : string = this.requiredField;
  errorPassword : string = this.requiredField;
  errorConfirmPassword : string = this.requiredField; 
  errorPostCode: string = this.requiredField;

  constructor(private fb: FormBuilder, private sportService: SportService, 
    private resgistryService : ResgistryService, public dialog: MatDialog, private router: Router) {}

///////////////////////////// METODOS PARA ABRIR EL  POPUP //////////////////////////////////////////
  openDialog(): void {
    let dialogRef = this.dialog.open(PopupGenericComponent, {
      width: '250px',
      data: { text: this.responseText, userName: this.userName, url: this.urlToNavigate }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      //this.text = result;
    });
  }
////////////////////////////////////////////////////////////////////////////////////////////////////

  ngOnInit() {
    this.sports = this.sportService.getSports();
    this.createRegistryForm();
    this.userNameControlError();
    this.emailControlError();
    this.passwordControlError();
    this.postCodeControlError();
  }

  createRegistryForm() {
    this.registryForm = this.fb.group({
      name: [null,  Validators.compose([Validators.required, Validators.minLength(4)]) ],
      email: [null,  Validators.compose([Validators.required, Validators.email])],
      passwd: [null,  Validators.required],
      confirmpasswd: [null, Validators.required], 
      favSport: [null, Validators.required],
      city: [null, Validators.required],
      postCode : [null, Validators.compose([Validators.required, Validators.maxLength(5), Validators.minLength(5)])]
    },{
      validator: PasswordValidator
    });
  }

  //subscribes para errores
  userNameControlError() {
    this.registryForm.controls['name'].valueChanges.subscribe(text => {
      const control = this.registryForm.controls['name'];
      if (control.errors){
        if (control.errors.minlength) {
          this.errorUserName = 'Nombre demasiado corto';
        } else if (control.errors.required) {
          this.errorUserName = this.requiredField;
        }
      }
    });
  }

  emailControlError() {
    this.registryForm.controls['email'].valueChanges.subscribe(text => {
      const control = this.registryForm.controls['email'];
      
      if (control.errors){
        if (control.errors.email) {
          this.errorEmail = '´Formato email inválido';
        } else if (control.errors.required) {
          this.errorEmail = this.requiredField;
        }
      }
    });
  }


  passwordControlError (){
    this.registryForm.controls['confirmpasswd'].valueChanges.subscribe(text => {
      let control = this.registryForm;

      if (control.errors){
        //(control.errors)
        if (control.errors.noMatch) {
          this.errorConfirmPassword = 'No coincide la contraseña';
        } else if (control.errors.required) {
          this.errorConfirmPassword = this.requiredField;
        }
      }
    });
  }

  postCodeControlError (){
    this.registryForm.controls['confirmpasswd'].valueChanges.subscribe(text => {
      let control = this.registryForm;
      if (control.errors){
        //(control.errors)
        if (control.errors.maxlength || control.errors.minlength) {
          this.errorPostCode = 'Deber se de 5 dígitos';
        } else if (control.errors.required) {
          this.errorPostCode = this.requiredField;
        }
      }
    });
  }

  //Acciones al clickear sobre el boton
  send () {
    
    let user = {
      name : this.registryForm.value['name'],
      email : this.registryForm.value['email'],
      password : this.registryForm.value['passwd'],
      favSport : this.registryForm.value['favSport'],
      city: this.registryForm.value['city'],
      pc: this.registryForm.value['postCode']
    };


    this.resgistryService.registerUser(user).subscribe(res => 
      {
        //Cojo el nombre del usuario para imprimirlo al registrarse
        this.userName = this.registryForm.value['name'];
        //texto mensaje respuesta del servidor
        this.responseText = res.text;
        this.openDialog();
    },
    err => {
      this.urlToNavigate = undefined;
      this.responseText = err.error.text;
      this.openDialog();
    });
  }
}