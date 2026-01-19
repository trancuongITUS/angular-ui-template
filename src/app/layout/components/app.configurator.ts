import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { $t, updatePreset, updateSurfacePalette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import Nora from '@primeuix/themes/nora';
import { PrimeNG } from 'primeng/config';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LayoutService } from '../services/layout.service';
import { SurfacePalette, SURFACE_PALETTES, PRIMARY_COLOR_NAMES } from './configurator/configurator-surfaces.data';
import { getPresetExtension } from './configurator/configurator-preset-extension.util';

const presets = { Aura, Lara, Nora } as const;
type PresetKey = keyof typeof presets;

@Component({
    selector: 'app-configurator',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule, SelectButtonModule],
    template: `
        <div class="flex flex-col gap-4">
            <div>
                <span class="text-sm text-muted-color font-semibold">Primary</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-start">
                    @for (primaryColor of primaryColors(); track primaryColor.name) {
                        <button
                            type="button"
                            [title]="primaryColor.name"
                            (click)="updateColors($event, 'primary', primaryColor)"
                            [ngClass]="{ 'outline outline-primary': primaryColor.name === selectedPrimaryColor() }"
                            class="cursor-pointer w-5 h-5 rounded-full flex shrink-0 items-center justify-center outline-offset-1 shadow"
                            [style]="{ 'background-color': primaryColor?.name === 'noir' ? 'var(--text-color)' : primaryColor?.palette?.['500'] }"
                        ></button>
                    }
                </div>
            </div>
            <div>
                <span class="text-sm text-muted-color font-semibold">Surface</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-start">
                    @for (surface of surfaces; track surface.name) {
                        <button
                            type="button"
                            [title]="surface.name"
                            (click)="updateColors($event, 'surface', surface)"
                            class="cursor-pointer w-5 h-5 rounded-full flex shrink-0 items-center justify-center p-0 outline-offset-1"
                            [ngClass]="{
                                'outline outline-primary': selectedSurfaceColor() ? selectedSurfaceColor() === surface.name : layoutService.layoutConfig().darkTheme ? surface.name === 'zinc' : surface.name === 'slate'
                            }"
                            [style]="{ 'background-color': surface?.palette?.['500'] }"
                        ></button>
                    }
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-color font-semibold">Presets</span>
                <p-selectbutton [options]="presetOptions" [ngModel]="selectedPreset()" (ngModelChange)="onPresetChange($event)" [allowEmpty]="false" size="small" />
            </div>
            <div *ngIf="showMenuModeButton()" class="flex flex-col gap-2">
                <span class="text-sm text-muted-color font-semibold">Menu Mode</span>
                <p-selectbutton [ngModel]="menuMode()" (ngModelChange)="onMenuModeChange($event)" [options]="menuModeOptions" [allowEmpty]="false" size="small" />
            </div>
        </div>
    `,
    host: {
        class: 'hidden absolute top-13 right-0 w-72 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]'
    }
})
export class AppConfigurator implements OnInit {
    private readonly router = inject(Router);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly primeng = inject(PrimeNG);
    readonly layoutService = inject(LayoutService);

    readonly surfaces = SURFACE_PALETTES;
    readonly presetOptions = Object.keys(presets);
    readonly menuModeOptions = [
        { label: 'Static', value: 'static' },
        { label: 'Overlay', value: 'overlay' }
    ];

    readonly showMenuModeButton = signal(!this.router.url.includes('auth'));
    readonly selectedPrimaryColor = computed(() => this.layoutService.layoutConfig().primary);
    readonly selectedSurfaceColor = computed(() => this.layoutService.layoutConfig().surface);
    readonly selectedPreset = computed(() => this.layoutService.layoutConfig().preset);
    readonly menuMode = computed(() => this.layoutService.layoutConfig().menuMode);

    readonly primaryColors = computed<SurfacePalette[]>(() => {
        const presetPalette = presets[this.layoutService.layoutConfig().preset as PresetKey].primitive;
        const palettes: SurfacePalette[] = [{ name: 'noir', palette: {} }];

        PRIMARY_COLOR_NAMES.forEach((color) => {
            palettes.push({
                name: color,
                palette: presetPalette?.[color as keyof typeof presetPalette] as SurfacePalette['palette']
            });
        });

        return palettes;
    });

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            const preset = this.layoutService.layoutConfig().preset ?? 'Aura';
            this.onPresetChange(preset);
        }
    }

    updateColors(event: Event, type: string, color: SurfacePalette) {
        if (type === 'primary') {
            this.layoutService.layoutConfig.update((state) => ({ ...state, primary: color.name }));
        } else if (type === 'surface') {
            this.layoutService.layoutConfig.update((state) => ({ ...state, surface: color.name }));
        }
        this.applyTheme(type, color);
        event.stopPropagation();
    }

    onPresetChange(presetName: string) {
        this.layoutService.layoutConfig.update((state) => ({ ...state, preset: presetName }));
        const preset = presets[presetName as PresetKey];
        const surfacePalette = this.surfaces.find((s) => s.name === this.selectedSurfaceColor())?.palette;
        const presetExt = this.getPresetExt();
        $t().preset(preset).preset(presetExt).surfacePalette(surfacePalette).use({ useDefaultOptions: true });
    }

    onMenuModeChange(mode: string) {
        this.layoutService.layoutConfig.update((prev) => ({ ...prev, menuMode: mode }));
    }

    private applyTheme(type: string, color: SurfacePalette) {
        if (type === 'primary') {
            updatePreset(this.getPresetExt() as Parameters<typeof updatePreset>[0]);
        } else if (type === 'surface') {
            updateSurfacePalette(color.palette);
        }
    }

    private getPresetExt(): object {
        const color = this.primaryColors().find((c) => c.name === this.selectedPrimaryColor()) || {};
        const preset = this.layoutService.layoutConfig().preset ?? 'Aura';
        return getPresetExtension(color, preset);
    }
}
