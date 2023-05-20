import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../servicios/login.service';
import { DeviceMotion, DeviceMotionAccelerationData, DeviceMotionAccelerometerOptions } from '@awesome-cordova-plugins/device-motion/ngx';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import { delay } from 'rxjs';
import Swal from 'sweetalert2';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  alarmOn=false;
  lockimg = "assets/openlock.png";
  buttonColor="rgba(0, 133, 255, 0.4)";
  email="";

  dm:any
  x!:string;
  y!:string;
  z!:string;
  timestamp!:string;
  onTime!:number;

  playSound=false;
  soundSatate="";
  flashon=false;
  popInput:any;
  loadingSpinner:any;

  constructor(private router:Router, private loginService:LoginService,
              private deviceMotion:DeviceMotion, private nativeAudio: NativeAudio,
              private flash:Flashlight, private vib:Vibration, private loadingCtrl: LoadingController) {
                this.x="-";
                this.y="-";
                this.z="-";
                this.timestamp="-";

                const recLocked = localStorage.getItem("locked");
                this.email = localStorage.getItem("email") as string;
                if(recLocked=="locked"){
                  this.alarma();
                }
              }

  ngOnInit(){
    try {
      this.nativeAudio.preloadSimple('right', 'assets/sonidos/derecha.wav'); 
      this.nativeAudio.preloadSimple('left', 'assets/sonidos/izquierda.wav'); 
      this.nativeAudio.preloadSimple('standing', 'assets/sonidos/vertical.wav'); 
      this.nativeAudio.preloadSimple('laying', 'assets/sonidos/acostado.wav');
      this.nativeAudio.preloadSimple('click', 'assets/sonidos/click.wav');  
      this.nativeAudio.preloadSimple('clack', 'assets/sonidos/clack.wav');  
      this.nativeAudio.preloadSimple('wrongpass', 'assets/sonidos/alarma.wav');  
    } catch (error) {
      alert(error);
    }
  }

  startAccel(){
    try {
      var option:DeviceMotionAccelerometerOptions = {
        frequency:200
      }
      this.dm = this.deviceMotion.watchAcceleration(option).subscribe((acc:DeviceMotionAccelerationData)=>{
        this.x = ""+acc.x;
        this.y = ""+acc.y;
        this.z = ""+acc.z;
        this.timestamp = ""+acc.timestamp;
        this.checkAngle()
      })
    } catch (error) {
      console.log("acceler",error)
    }
  }

  stopAccel(){
    this.dm.unsubscribe();
  }

  alarma(){

      this.nativeAudio.play('click');
      this.startAccel();
      this.lockimg = "assets/closedlock.png";
      this.buttonColor="rgba(255, 80, 0, 0.4)"
      localStorage.setItem("locked", "locked")
    this.alarmOn=true;
  }

  async checkAngle(){
    /*this.x = this.x.substring(0, 1);
    this.y = this.y.substring(0, 1);
    this.z = this.z.substring(0, 1);*/

    let cx = parseInt(this.x);
    let cy = parseInt(this.y);
    let cz = parseInt(this.z);
    if(cx < -6 && this.soundSatate!="derecha"){
      
      this.soundSatate="derecha";
      this.nativeAudio.play('right');  
    }
    if(cx > 6 && this.soundSatate!="izquierda"){
      
      this.soundSatate="izquierda";
      this.nativeAudio.play('left');  
    }
    if(cy> 7 && this.soundSatate!="vertical" || this.flashon){
      const time: number = Date.now();
      if(!this.flashon){
        this.flashon=true;
        this.soundSatate="vertical";
        this.nativeAudio.play('standing');  
        this.flash.switchOn();
        this.onTime = time;
      }else{
        if(time > (this.onTime+5000)){
          this.soundSatate="vertical";
          this.flash.switchOff();
          this.flashon=false;
        }
      }
      
    }
    if(cz > 8 && cx==0 && cy==0 && this.soundSatate!="acostado"){
     
      this.soundSatate="acostado";
      this.nativeAudio.play('laying');  
      this.vib.vibrate(5000);
    }

  }
  
  turnFlash(){
    /*console.log("lel");
    setTimeout(this.flashOff, 1500);
    /*console.log("on")
    setTimeout(function () {
      
    }, 5000);
    console.log("off")*/
    /*this.flash.toggle();
    this.vib.vibrate(1000);*/
  }

  turnVib(){
    
    navigator.vibrate(1000);
  }

  logout(){
    this.loginService.logout();
    localStorage.setItem('email', '');
    this.nativeAudio.unload('right'); 
    this.nativeAudio.unload('left'); 
    this.nativeAudio.unload('standing'); 
    this.nativeAudio.unload('laying');
    this.nativeAudio.unload('click');  
    this.nativeAudio.unload('clack');  
    this.nativeAudio.unload('wrongpass');  
    this.router.navigate(['/login'])
    
  }


  public alertButtons = ['OK'];
  public alertInputs = [
    {
      type: 'textarea',
      placeholder: 'Contraseña',
    },
  ];

  showAlertData( pass:string){
    
      console.log(pass);
      this.login(pass);
    
  }

  async login(pass:string){
      this.showLoading();
      const logedUser = await this.loginService.loginService(this.email, pass)!;
      //console.log(logedUser);
      if(logedUser != null){
        console.log("Login!");
        this.loadingSpinner.dismiss(); 
        localStorage.setItem('email', this.email);
        this.popInput="";
        this.apagarAlarma();
      }else{

        console.log("No login");
        this.loadingSpinner.dismiss();
        this.wrongpass();
        Swal.fire({
          title: 'Error',
          text: 'La contraseña es incorrecta',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          heightAuto: false
        })
      }  
    }

    wrongpass(){
      const time: number = Date.now();
      if(!this.flashon){
        this.flashon=true;
        this.soundSatate="vertical";
        this.nativeAudio.play('wrongpass');  
        this.flash.switchOn();
        this.onTime = time;
        this.vib.vibrate(5000);
      }else{
        if(time > (this.onTime+5000)){
          this.soundSatate="vertical";
          this.flash.switchOff();
          this.flashon=false;
        }
      }
    }
  
    async showLoading() {
      this.loadingSpinner = await this.loadingCtrl.create({
        message: 'Verificando contraseña . . .',
        duration: 2000,
      });
      this.loadingSpinner.present();
    }

    apagarAlarma(){
      this.nativeAudio.play('clack');
      this.stopAccel();
      this.lockimg = "assets/openlock.png";
      this.buttonColor="rgba(0, 133, 255, 0.4)"
      localStorage.setItem("locked", "unlocked")
      this.alarmOn=false;
    }

    async putpass(){
      const { value: email } = await Swal.fire({
        title: 'Ingrese su contraseña',
        input: 'password',
        inputPlaceholder: 'Contraseña',
        heightAuto: false
      })
      
      if (email) {
        this.showAlertData(email);
      }
    }
}
