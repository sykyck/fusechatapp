import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../core/modules/shared.module';

import { FuseMainComponent } from './main.component';
import { FuseContentComponent } from './content/content.component';

@NgModule({
    declarations: [
        FuseContentComponent,
        FuseMainComponent,
    ],
    imports     : [
        SharedModule,
        RouterModule,
    ],
    exports     : [
        FuseMainComponent
    ]
})

export class FuseMainModule
{
}
