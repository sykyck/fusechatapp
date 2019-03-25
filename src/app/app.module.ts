import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import 'hammerjs';
import { SharedModule } from './core/modules/shared.module';
import { AppComponent } from './app.component';
import { FuseSplashScreenService } from './core/services/splash-screen.service';
import { FuseConfigService } from './core/services/config.service';
import { FuseNavigationService } from './core/components/navigation/navigation.service';
import { TranslateModule } from '@ngx-translate/core';
import { FuseMainModule } from './main/main.module';
import { FuseFakeDbService } from './fuse-fake-db/fuse-fake-db.service';
import { FuseChatModule } from './main/content/apps/chat/chat.module';
import { FuseMaintenanceComponent } from './main/content/logout/maintenance.component';
import { FuseChatComponent } from './main/content/apps/chat/chat.component';

const appRoutes: Routes = [
    {
        path      : 'chat/:token',
        component : FuseChatComponent
    },
    {
        path      : 'thankyou',
        component : FuseMaintenanceComponent
    }
];

@NgModule({
    declarations: [
        AppComponent,
        FuseMaintenanceComponent
    ],
    imports     : [
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        SharedModule,
        TranslateModule.forRoot(),
        InMemoryWebApiModule.forRoot(FuseFakeDbService, {
            delay             : 0,
            passThruUnknownUrl: true
        }),
        FuseMainModule,
        FuseChatModule,
        RouterModule.forRoot(appRoutes)
    ],
    providers   : [
        FuseSplashScreenService,
        FuseConfigService,
        FuseNavigationService
    ],
    bootstrap   : [
        AppComponent
    ]
})
export class AppModule
{
}
