import { Component, OnInit, Input} from '@angular/core';

//Servicio de informacion del usuario para saber el estado del behaviorSubject
import { UserInfoService } from '../../services/user.info.service';


@Component({
  selector: 'spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {



	spinnerImages : any[] = [
		{
			sport: 'Fútbol',
			url: '../../../assets/images/ball_football_burned.png'
		},
		{
			sport: 'Baloncesto',
			url: '../../../assets/images/ball_basket_burned.png'
		},
		{
			sport: 'Tenis',
			url: '../../../assets/images/tennis_ball.png'
		},
		{
			sport: 'Pádel',
			url: '../../../assets/images/tennis_ball.png'
		}
	];


	spinnerImage = {};


	constructor(private userInfoService: UserInfoService) { }

	ngOnInit() {
		this.userInfoService.getFavSportSubject().subscribe(bh => {
			//console.log(bh);
			//Sabiendo el valor del deporte favorito, cojo su url para pintar el spinner con la imagen deseada
			this.spinnerImage = this.spinnerImages.find(obj => { 
				return obj.sport === bh;
			})
		})
	}

}
