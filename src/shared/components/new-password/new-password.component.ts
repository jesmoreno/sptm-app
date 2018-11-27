import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
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

export class NewPassworComponent implements OnInit{

  @Input() showPopUp: boolean;
  @Output() emitEvent:EventEmitter<Password> = new EventEmitter<Password>();
  //@Output() emitEvent:EventEmitter<string> = new EventEmitter<string>();

  passwordForm : FormGroup;
  errorConfirmPassword : string = 'No coincide la contraseña';

  constructor(private fb: FormBuilder) {}
    

  ngOnInit(){
    this.createForm();
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

    console.log(this.passwordForm);

    let old = this.passwordForm.controls['oldpasswd'].value;
    let newPass = this.passwordForm.controls['newpasswd'].value;
    let newConfirmed = this.passwordForm.controls['confirmpasswd'].value;
    this.emitEvent.emit({confirmed: true, oldPassword: old, newPassword: newPass, confirmedPassword: newConfirmed});
    
    
  }

  cancel() {
    this.showPopUp = false;
    this.emitEvent.emit({confirmed: false});
    this.resetForm();
  }


  resetForm() {
    this.passwordForm.controls['oldpasswd'].setValue('');
    this.passwordForm.controls['newpasswd'].setValue('');
    this.passwordForm.controls['confirmpasswd'].setValue('');
    this.passwordForm.controls['confirmpasswd'].setErrors(null);
  }

}