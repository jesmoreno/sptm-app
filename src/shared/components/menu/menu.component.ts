import { Component, OnInit } from '@angular/core';
//Necesario para redirigir
import { Router } from "@angular/router";

import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

//Servicio para el logout
import { AuthenticationService } from "../../services/authentication.service";


@Component({
  selector: 'menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})

export class MenuComponent implements OnInit{

 
    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private authenticationService: AuthenticationService, private route: Router) {
        iconRegistry.addSvgIcon(
        'home',
        sanitizer.bypassSecurityTrustResourceUrl('../../assets/images/svg/home.svg'));

    	iconRegistry.addSvgIcon(
        'add-user',
        sanitizer.bypassSecurityTrustResourceUrl('../../assets/images/svg/add-user.svg'));

        iconRegistry.addSvgIcon(
        'temperature',
        sanitizer.bypassSecurityTrustResourceUrl('../../assets/images/svg/temperature.svg'));

        iconRegistry.addSvgIcon(
        'trophy',
        sanitizer.bypassSecurityTrustResourceUrl('../../assets/images/svg/trophy.svg'));

        iconRegistry.addSvgIcon(
        'avatar',
        sanitizer.bypassSecurityTrustResourceUrl('../../assets/images/svg/avatar.svg'));
    
        iconRegistry.addSvgIcon(
        'logout',
        sanitizer.bypassSecurityTrustResourceUrl('../../assets/images/svg/logout.svg'));
    }
     
    ngOnInit(){}

    logout() {
        this.authenticationService.logout();
        this.route.navigate(['/login']);
    }


}