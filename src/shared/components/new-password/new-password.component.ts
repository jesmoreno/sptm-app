import { Component, OnInit, OnChanges, SimpleChanges, SimpleChange, Output, EventEmitter, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormBuilder , FormGroup , Validators, AbstractControl , ValidationErrors } from '@angular/forms';

//Interfaz objeto contraseña
import { Password } from '../../models/password';


//Comprobar contraseña
const PasswordValidator = function(ac : AbstractControl): ValidationErrors | null {

  if(Object.is(ac.value['newpasswd'],ac.value['confirmpasswd'])){
      if(ac.get('confirmpasswd').hasError){
         ac.get('confirmpasswd').setErrors(null);
      }
      return null;
  }else{
    ac.get('confirmpasswd').setErrors({'noMatch':true});
    return { 'noMatch' : {value : ac.value} };
  }
};

@Component({
  selector: 'new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})

export class NewPassworComponent implements OnInit, OnChanges{

  @Input() showPopUp: boolean;
  @Input() errorMessage: number;
  @Output() emitEvent:EventEmitter<Password> = new EventEmitter<Password>();
  //@Output() emitEvent:EventEmitter<string> = new EventEmitter<string>();

  passwordForm : FormGroup;
  errorList : string[] = ['No coincide la contraseña','Contraseña errónea'];
  //Posicion para coger mensaje error según el tipo
  errorPosition : number = 0;
  //Booleano que indica si se ha guardado correctamente o no


  constructor(private fb: FormBuilder) {}
    

  ngOnInit(){
    this.createForm();
    this.confirmPasswordControl();
    this.newPasswordControl();
  }

  ngOnChanges(changes: SimpleChanges) {
    const errorCode: SimpleChange = changes.errorMessage ? changes.errorMessage : null;

    if(errorCode && !errorCode.firstChange){// Codigo 1 de contraseña erronea o null si guarda bien (el 0 no se detecta aqui)

      if(errorCode.currentValue != null){//FALLO POR CONTRASEÑA ERRONEA
        this.errorPosition = errorCode.currentValue;
        this.passwordForm.controls['oldpasswd'].setErrors({'wrongPasswd': true});
      }else{// GUARDADA CORRECTAMENTE LA CONTRASEÑA
        this.resetForm();
        this.showPopUp = false;
      }
    }
  }


  createForm() {

    this.passwordForm = this.fb.group({
      oldpasswd: [null,  Validators.required],
      newpasswd: [null,  Validators.required],
      confirmpasswd: [null,  Validators.required]
    },{
      validator: PasswordValidator
    });
  }

  confirm(){

    let old = this.passwordForm.controls['oldpasswd'].value;
    let newPass = this.passwordForm.controls['newpasswd'].value;
    let newConfirmed = this.passwordForm.controls['confirmpasswd'].value;
    this.emitEvent.emit({confirmed: true, oldPassword: old, newPassword: newPass, confirmedPassword: newConfirmed});
    
    
  }

  cancel() {
    this.resetForm();
    this.showPopUp = false;
    this.emitEvent.emit({confirmed: false});
  }


  resetForm() {
    this.passwordForm.reset();
  }

  newPasswordControl() {
    this.passwordForm.controls['newpasswd'].valueChanges.subscribe(passValue => {
      let confirmControl = passValue;
      let newControl = this.passwordForm.controls['confirmpasswd'].value;

      if(newControl != confirmControl){
        this.errorPosition = 0;
      }

    })
  }

  confirmPasswordControl() {
    this.passwordForm.controls['confirmpasswd'].valueChanges.subscribe(passValue => {
      let newControl = passValue;
      let confirmControl = this.passwordForm.controls['newpasswd'].value;

      if(newControl != confirmControl){
        this.errorPosition = 0;
      }

    })
  }

}