import { NgModule } from '@angular/core';
import { SharedModule } from '../../../core/modules/shared.module';
import { RouterModule } from '@angular/router';

import { FuseMaintenanceComponent } from './maintenance.component';

const routes = [
    {
        path     : 'thankyou',
        component: FuseMaintenanceComponent
    }
];

@NgModule({
    declarations: [
        FuseMaintenanceComponent
    ],
    imports     : [
        SharedModule,
        RouterModule.forChild(routes)
    ]
})

export class MaintenanceModule
{

}
