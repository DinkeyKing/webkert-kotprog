import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FirebaseAppModule, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { MenuComponent } from './shared/menu/menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AngularFireModule } from '@angular/fire/compat';
import { AdminModule } from './pages/admin/admin.module';


@NgModule({
  declarations: [
    AppComponent,
    MenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

    AngularFireModule.initializeApp({"projectId":"webkert-5ee6c","appId":"1:1068681501486:web:3913bd29c9a28a73b1b8bf","storageBucket":"webkert-5ee6c.appspot.com","apiKey":"AIzaSyDDePzu47RMhr3poG-iBjkkvAlqa-FEqvI","authDomain":"webkert-5ee6c.firebaseapp.com","messagingSenderId":"1068681501486","measurementId":"G-4QKTPEZ2ZE"}),
    //provideFirebaseApp(() => initializeApp({"projectId":"webkert-5ee6c","appId":"1:1068681501486:web:3913bd29c9a28a73b1b8bf","storageBucket":"webkert-5ee6c.appspot.com","apiKey":"AIzaSyDDePzu47RMhr3poG-iBjkkvAlqa-FEqvI","authDomain":"webkert-5ee6c.firebaseapp.com","messagingSenderId":"1068681501486","measurementId":"G-4QKTPEZ2ZE"})),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),

    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    AdminModule,
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
