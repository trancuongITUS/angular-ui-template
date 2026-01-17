import { Component } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ContextMenuModule } from 'primeng/contextmenu';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MegaMenuModule } from 'primeng/megamenu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TabsModule } from 'primeng/tabs';
import { MenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { StepperModule } from 'primeng/stepper';
import { IconField, IconFieldModule } from 'primeng/iconfield';
import { InputIcon, InputIconModule } from 'primeng/inputicon';
import {
    MENU_DEMO_NESTED_ITEMS,
    MENU_DEMO_TIERED_ITEMS,
    MENU_DEMO_OVERLAY_ITEMS,
    MENU_DEMO_PLAIN_ITEMS,
    MENU_DEMO_CONTEXT_ITEMS,
    MENU_DEMO_MEGA_ITEMS,
    MENU_DEMO_PANEL_ITEMS,
    MENU_DEMO_BREADCRUMB_HOME,
    MENU_DEMO_BREADCRUMB_ITEMS
} from './menu-demo.data';

@Component({
    selector: 'app-menu-demo',
    standalone: true,
    imports: [
        CommonModule,
        BreadcrumbModule,
        TieredMenuModule,
        IconFieldModule,
        InputIconModule,
        MenuModule,
        ButtonModule,
        ContextMenuModule,
        MegaMenuModule,
        PanelMenuModule,
        TabsModule,
        MenubarModule,
        InputTextModule,
        StepperModule,
        IconField,
        InputIcon
    ],
    templateUrl: './menu-demo.component.html'
})
export class MenuDemo {
    nestedMenuItems = MENU_DEMO_NESTED_ITEMS;
    breadcrumbHome = MENU_DEMO_BREADCRUMB_HOME;
    breadcrumbItems = MENU_DEMO_BREADCRUMB_ITEMS;
    tieredMenuItems = MENU_DEMO_TIERED_ITEMS;
    overlayMenuItems = MENU_DEMO_OVERLAY_ITEMS;
    menuItems = MENU_DEMO_PLAIN_ITEMS;
    contextMenuItems = MENU_DEMO_CONTEXT_ITEMS;
    megaMenuItems = MENU_DEMO_MEGA_ITEMS;
    panelMenuItems = MENU_DEMO_PANEL_ITEMS;
}
