import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoginService } from 'src/app/servicios/login.service';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { LoadingController } from '@ionic/angular';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';


declare const navigator: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule],
})
export class LoginComponent  implements OnInit {
  

  constructor(private router: Router,private loginService: LoginService,
              public formBuilder: FormBuilder, private loadingCtrl: LoadingController, private nativeAudio:NativeAudio
              ){ 
                const recMail = localStorage.getItem("email");
                if(recMail&&recMail!=""){
                  this.router.navigate([''])
                }
                
              }
  ionicForm!: FormGroup;
  email!:string;
  pass!:string;
  isSubmitted = false;
  loadingSpinner:any;
  accel:any;
  selectedUser!:string;

  ngOnInit() {
    this.nativeAudio.preloadSimple('logsuc', 'assets/sonidos/login.wav');
    this.ionicForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      password: ['', [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')]]
    })
    
    
  }

  get errorControl() {
    return this.ionicForm.controls;
  }

  usuarios = [{"email":"mail", "pass":"pass"}];
  result = "";
  log = false;
  validation=false;

 /* validate(){
    return true;
  }*/

  async login(){
    
    this.isSubmitted = true;
    //this.validate();
    if (!this.ionicForm.valid) {
      console.log('Please provide all the required values!')
      //return false;
    } else {
      this.showLoading();
      console.log(this.ionicForm.value);
      const logedUser = await this.loginService.loginService(this.email, this.pass)!;
      //console.log(logedUser);


      if(logedUser != null){
        console.log("Login!");
        this.loadingSpinner.dismiss(); 
        localStorage.setItem('email', this.email);
        this.email = "";
        this.pass = "";
        this.isSubmitted = false;
        this.nativeAudio.play('logsuc');
        this.router.navigate([''])
      }else{
        console.log("No login");
        this.loadingSpinner.dismiss();
        Swal.fire({
          title: 'Error',
          text: 'El correo o contraseña son incorrectos',
          icon: 'error',
          confirmButtonText: 'Intentar nuevamente',
          heightAuto: false
        })
      }  
    }
  }

  loadUser(){
    switch(this.selectedUser){
      case '1':
        this.email="owain.ozana@gmail.com";
        this.pass="748159263aaAA";
        break;
      case '2':
        this.email="nikandros@yahoo.com";
        this.pass="12546789AbcD";
        break;
      case '3':
        this.email="leonidasduri@outlook.com";
        this.pass="aswerwwetrBHGT1254";
        break;
    }
  }

  //á é í ó ú

  async showLoading() {
    this.loadingSpinner = await this.loadingCtrl.create({
      message: 'Iniciado sesión . . .',
      duration: 2000,
    });
    this.loadingSpinner.present();
  }
}
