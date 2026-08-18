import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MalikApiService, OurBrand } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
import { ImageGalleryUpload } from '@/app/components/image-gallery-upload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { InputNumberModule } from 'primeng/inputnumber';
import { environment } from '@/environments/environment';
import { slugify } from '@/app/utils/slugify';

const CATEGORIES = [
    { label: "Vegetable Seeds", value: "vegetable_seeds" },
    { label: "Potato Seeds", value: "potato_seeds" },
    { label: "Flower", value: "flower" },
    { label: "Malik's Farms", value: "malik_farms" },
    { label: "Innovation", value: "innovation" },
    { label: "Origene by Malik", value: "origene" },
    { label: "Training", value: "training" },
    { label: "Fresh", value: "fresh" },
    { label: "Planted by Malik", value: "planted_by_malik" },
    { label: "Features", value: "features" },
];

function defaultGenericContent(): any {
    return {
        hero: { title: '', subtitle: '', background_image: '', scroll_text: 'Scroll to explore' },
        intro: { heading: '', heading_highlight: '', description: '', tags: [] },
        farmers: { badge: 'WITH OUR FARMERS', heading: '', description: '', images: [] },
        qualities: { badge: 'WHAT WE BREED FOR', heading: '', description: '', cards: [] },
        portfolio: { badge: 'SEED PORTFOLIO', heading: '', description: '', tags: [] },
        heritage: { badge: 'OUR HERITAGE', heading: '', description: '', images: [], youtube_url: '' }
    };
}

function defaultInnovationContent(): any {
    return {
        hero: { bgImage: '' },
        intro: { stats: [{ value: 0, suffix: '', label: '' }], highlights: [''] },
        split1: { badge: '', image: '' },
        grid: { badge: '', images: [''] },
        split2: { badge: '', image: '' },
        Projects: [{ title: '', duration: '', focus: '', location: '', donor: '' }]
    };
}

function defaultFlowerContent(): any {
    return {
        hero: { bgImage: '' },
        intro: { highlights: [''] },
        grid: { badge: '', images: [''] },
        split: { badge: '', image: '' },
        portfolio: { badge: '', card: [{ name: '', image: '' }] }
    };
}

function defaultOrigeneContent(): any {
    return {
        hero: { bgImage: '' },
        grid: { badge: '', images: [''] },
        split1: { badge: '', image: '' },
        process2: { badge: '', images: [''], buttonText: '', buttonLink: '' },
        split2: { badge: '', image: '' }
    };
}

function defaultFarmContent(): any {
    return {
        hero: { bgImage: '' },
        intro: { stats: [{ value: 0, suffix: '', label: '' }] },
        split1: { badge: '', image: '' },
        process: { badge: '', images: [''] },
        split2: { badge: '', images: [''], tags: { Vegetables: [''], Fruits: [''] }, gallery: [''] },
        training: {
            badge: '',
            programs: [{ title: '', image: '' }],
            facilities: [{ title: '', capacity: 0, beds: 0, description: '', image: '' }]
        },
        testimonials: { badge: '', visitorScans: [{ image: '', title: '' }] },
        cropPortfolio: { groups: [{ category: '', items: [['']] }] }
    };
}

function defaultPotatoContent(): any {
    return {
        hero: { bgImage: '' },
        intro: { highlights: [''] },
        grid: { badge: '', images: [''] },
        split: { badge: '', image: '' },
        youtube: { youtubeUrl: '', images: [''], brandLogo: '' }
    };
}

function defaultVegetableContent(): any {
    return {
        hero: { bgImage: '' },
        grid: { badge: '', images: [''] },
        youtube: { badge: '', youtubeUrl: '', images: [''] },
        cropPortfolio: { badge: '', tags: [['']] }
    };
}

function getDefaultContent(category: string): any {
    switch (category) {
        case 'innovation': return defaultInnovationContent();
        case 'flower': return defaultFlowerContent();
        case 'origene': return defaultOrigeneContent();
        case 'malik_farms': return defaultFarmContent();
        case 'potato_seeds': return defaultPotatoContent();
        case 'vegetable_seeds': return defaultVegetableContent();
        default: return defaultGenericContent();
    }
}

function tabsForCategory(category: string): { value: string; label: string }[] {
    const base = [{ value: 'basic', label: 'Basic' }];
    switch (category) {
        case 'innovation':
            return [...base, { value: 'hero', label: 'Hero' }, { value: 'intro', label: 'Intro' }, { value: 'split1', label: 'Split 1' }, { value: 'grid', label: 'Grid' }, { value: 'split2', label: 'Split 2' }, { value: 'projects', label: 'Projects' }];
        case 'flower':
            return [...base, { value: 'hero', label: 'Hero' }, { value: 'intro', label: 'Intro' }, { value: 'grid', label: 'Grid' }, { value: 'split', label: 'Split' }, { value: 'portfolio', label: 'Portfolio' }];
        case 'origene':
            return [...base, { value: 'hero', label: 'Hero' }, { value: 'grid', label: 'Grid' }, { value: 'split1', label: 'Split 1' }, { value: 'process2', label: 'Process 2' }, { value: 'split2', label: 'Split 2' }];
        case 'malik_farms':
            return [...base, { value: 'hero', label: 'Hero' }, { value: 'intro', label: 'Intro' }, { value: 'split1', label: 'Split 1' }, { value: 'process', label: 'Process' }, { value: 'split2', label: 'Split 2' }, { value: 'training', label: 'Training' }, { value: 'testimonials', label: 'Testimonials' }, { value: 'cropPortfolio', label: 'Crop Portfolio' }];
        case 'potato_seeds':
            return [...base, { value: 'hero', label: 'Hero' }, { value: 'intro', label: 'Intro' }, { value: 'grid', label: 'Grid' }, { value: 'split', label: 'Split' }, { value: 'youtube', label: 'YouTube' }];
        case 'vegetable_seeds':
            return [...base, { value: 'hero', label: 'Hero' }, { value: 'grid', label: 'Grid' }, { value: 'youtube', label: 'YouTube' }, { value: 'cropPortfolio', label: 'Crop Portfolio' }];
        default:
            return [...base, { value: 'hero', label: 'Hero' }, { value: 'intro', label: 'Intro' }, { value: 'farmers', label: 'Farmers' }, { value: 'qualities', label: 'Qualities' }, { value: 'portfolio', label: 'Portfolio' }, { value: 'heritage', label: 'Heritage' }];
    }
}

@Component({
    selector: 'app-brands-list-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        ToggleSwitchModule, TagModule, ConfirmDialogModule, SelectModule, TabsModule,
        InputNumberModule, ImageUpload, ImageGalleryUpload
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New Brand" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="brands()" [rows]="100" [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>Order</th>
                        <th>Logo</th>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Category</th>
                        <th>Featured</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>
                            <div class="flex items-center gap-2">
                                <span class="font-bold text-primary">{{(item.sort_order ?? 0) + 1}}</span>
                                <div class="flex flex-col">
                                    <p-button icon="pi pi-chevron-up" [text]="true" [rounded]="true" size="small" (onClick)="moveBrand(item, 'up')" />
                                    <p-button icon="pi pi-chevron-down" [text]="true" [rounded]="true" size="small" (onClick)="moveBrand(item, 'down')" />
                                </div>
                            </div>
                        </td>
                        <td>
                            <img *ngIf="item.logo_url" [src]="mediaBaseUrl + item.logo_url"
                                alt="{{item.name}}" class="w-12 h-12 object-contain rounded" />
                            <span *ngIf="!item.logo_url" class="text-muted-color">No logo</span>
                        </td>
                        <td>{{item.name}}</td>
                        <td>{{item.slug}}</td>
                        <td>{{item.category}}</td>
                        <td>
                            <p-tag [value]="item.is_featured ? 'Yes' : 'No'"
                                [severity]="item.is_featured ? 'success' : 'secondary'" />
                        </td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true"
                                (onClick)="editBrand(item)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteBrand(item)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialog" [style]="{ width: '90vw', 'max-width': '1100px' }" header="Brand Details" [modal]="true">
            <ng-template #content>
                <p-tabs [value]="activeTab()" (valueChange)="activeTab.set($event ?? 'basic')">
                    <p-tablist>
                        <p-tab *ngFor="let tab of dialogTabs()" [value]="tab.value">{{tab.label}}</p-tab>
                    </p-tablist>
                    <p-tabpanels>
                        <p-tabpanel *ngFor="let tab of dialogTabs()" [value]="tab.value">
                            <ng-container [ngSwitch]="tab.value">
                                <ng-container *ngSwitchCase="'basic'"><ng-container *ngTemplateOutlet="basicFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'hero'"><ng-container *ngTemplateOutlet="heroFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'intro'"><ng-container *ngTemplateOutlet="introFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'farmers'"><ng-container *ngTemplateOutlet="farmersFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'qualities'"><ng-container *ngTemplateOutlet="qualitiesFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'portfolio'"><ng-container *ngTemplateOutlet="portfolioFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'heritage'"><ng-container *ngTemplateOutlet="heritageFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'split1'"><ng-container *ngTemplateOutlet="split1Fields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'split2'"><ng-container *ngTemplateOutlet="split2Fields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'split'"><ng-container *ngTemplateOutlet="splitFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'grid'"><ng-container *ngTemplateOutlet="gridFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'projects'"><ng-container *ngTemplateOutlet="projectsFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'process'"><ng-container *ngTemplateOutlet="processFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'process2'"><ng-container *ngTemplateOutlet="process2Fields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'youtube'"><ng-container *ngTemplateOutlet="youtubeFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'training'"><ng-container *ngTemplateOutlet="trainingFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'testimonials'"><ng-container *ngTemplateOutlet="testimonialsFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'cropPortfolio'"><ng-container *ngTemplateOutlet="cropPortfolioFields"></ng-container></ng-container>
                            </ng-container>
                        </p-tabpanel>
                    </p-tabpanels>
                </p-tabs>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveBrand()" [loading]="saving" />
            </ng-template>
        </p-dialog>

        <!-- BASIC -->
        <ng-template #basicFields>
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block font-bold mb-2">Name *</label>
                    <input type="text" pInputText [(ngModel)]="brand.name" (ngModelChange)="onNameChange($event)" fluid />
                </div>
                <div>
                    <label class="block font-bold mb-2">Slug *</label>
                    <input type="text" pInputText [(ngModel)]="brand.slug" placeholder="brand-name" [disabled]="!brand.id" fluid />
                </div>
                <div>
                    <label class="block font-bold mb-2">Category *</label>
                    <p-select [options]="categories" [(ngModel)]="brand.category" (ngModelChange)="onCategoryChange($event)" optionLabel="label" optionValue="value" placeholder="Select category" fluid appendTo="body" />
                </div>
                <div>
                    <label class="block font-bold mb-2">Tagline</label>
                    <input type="text" pInputText [(ngModel)]="brand.tagline" fluid />
                </div>
                <div>
                    <label class="block font-bold mb-2">Short Description</label>
                    <textarea pTextarea [(ngModel)]="brand.description" rows="3" fluid></textarea>
                </div>
                <div>
                    <app-image-upload label="Logo" folder="brands" [(currentImage)]="brand.logo_url" />
                </div>
                <div class="flex items-center gap-4">
                    <div>
                        <label class="block font-bold mb-2">Featured</label>
                        <p-toggleSwitch [(ngModel)]="brand.is_featured" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Active</label>
                        <p-toggleSwitch [(ngModel)]="brand.is_active" />
                    </div>
                </div>
            </div>
        </ng-template>

        <!-- HERO -->
        <ng-template #heroFields>
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block font-bold mb-2">Hero Background Image</label>
                    <app-image-upload folder="brands" [(currentImage)]="brandContent().hero.bgImage" />
                </div>
            </div>
        </ng-template>

        <!-- INTRO -->
        <ng-template #introFields>
            <div class="flex flex-col gap-4">
                <div *ngIf="brandContent().intro.highlights !== undefined">
                    <label class="block font-bold mb-2">Highlights</label>
                    <div class="flex flex-wrap gap-2 mb-2">
                        <p-tag *ngFor="let h of brandContent().intro.highlights; let i = index" [value]="h" icon="pi pi-times" (onClick)="removeString(brandContent().intro.highlights, i)" severity="secondary" class="cursor-pointer" />
                    </div>
                    <div class="flex gap-2">
                        <input type="text" pInputText #introHighInput placeholder="Add highlight" fluid (keydown.enter)="addString(brandContent().intro.highlights, introHighInput.value); introHighInput.value = ''" />
                        <p-button icon="pi pi-plus" (onClick)="addString(brandContent().intro.highlights, introHighInput.value); introHighInput.value = ''" />
                    </div>
                </div>
                <div *ngIf="brandContent().intro.stats !== undefined">
                    <div class="flex items-center justify-between mb-2">
                        <label class="block font-bold">Stats</label>
                        <p-button label="Add Stat" icon="pi pi-plus" (onClick)="addToPath('intro.stats', {value: 0, suffix: '', label: ''})" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <p-card *ngFor="let stat of brandContent().intro.stats; let i = index">
                            <div class="flex flex-col gap-3">
                                <div class="grid grid-cols-3 gap-3">
                                    <div><label class="block text-sm font-bold mb-1">Label</label><input type="text" pInputText [(ngModel)]="stat.label" fluid /></div>
                                    <div><label class="block text-sm font-bold mb-1">Value</label><input type="number" pInputText [(ngModel)]="stat.value" fluid /></div>
                                    <div><label class="block text-sm font-bold mb-1">Suffix</label><input type="text" pInputText [(ngModel)]="stat.suffix" fluid /></div>
                                </div>
                                <div class="flex justify-end"><p-button icon="pi pi-trash" severity="danger" text (onClick)="removeAt('intro.stats', i)" /></div>
                            </div>
                        </p-card>
                    </div>
                </div>
                <!-- generic intro -->
                <div *ngIf="brandContent().intro.heading !== undefined">
                    <label class="block font-bold mb-2">Heading</label>
                    <input type="text" pInputText [(ngModel)]="brandContent().intro.heading" fluid />
                </div>
                <div *ngIf="brandContent().intro.heading_highlight !== undefined">
                    <label class="block font-bold mb-2">Heading Highlight</label>
                    <input type="text" pInputText [(ngModel)]="brandContent().intro.heading_highlight" fluid />
                </div>
                <div *ngIf="brandContent().intro.description !== undefined">
                    <label class="block font-bold mb-2">Description</label>
                    <textarea pTextarea [(ngModel)]="brandContent().intro.description" rows="4" fluid></textarea>
                </div>
                <div *ngIf="brandContent().intro.tags !== undefined">
                    <label class="block font-bold mb-2">Tags</label>
                    <div class="flex flex-wrap gap-2 mb-2">
                        <p-tag *ngFor="let tag of brandContent().intro.tags; let i = index" [value]="tag" icon="pi pi-times" (onClick)="removeString(brandContent().intro.tags, i)" severity="secondary" class="cursor-pointer" />
                    </div>
                    <div class="flex gap-2">
                        <input type="text" pInputText #introTagInput placeholder="Add tag" fluid (keydown.enter)="addString(brandContent().intro.tags, introTagInput.value); introTagInput.value = ''" />
                        <p-button icon="pi pi-plus" (onClick)="addString(brandContent().intro.tags, introTagInput.value); introTagInput.value = ''" />
                    </div>
                </div>
            </div>
        </ng-template>

        <!-- GENERIC FARMERS -->
        <ng-template #farmersFields>
            <div class="flex flex-col gap-4">
                <div><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().farmers.badge" fluid /></div>
                <div><label class="block font-bold mb-2">Heading</label><input type="text" pInputText [(ngModel)]="brandContent().farmers.heading" fluid /></div>
                <div><label class="block font-bold mb-2">Description</label><textarea pTextarea [(ngModel)]="brandContent().farmers.description" rows="3" fluid></textarea></div>
                <div><app-image-gallery-upload label="Farmers Images" folder="brands" [(images)]="brandContent().farmers.images" /></div>
            </div>
        </ng-template>

        <!-- GENERIC QUALITIES -->
        <ng-template #qualitiesFields>
            <div class="flex flex-col gap-4">
                <div><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().qualities.badge" fluid /></div>
                <div><label class="block font-bold mb-2">Heading</label><input type="text" pInputText [(ngModel)]="brandContent().qualities.heading" fluid /></div>
                <div><label class="block font-bold mb-2">Description</label><textarea pTextarea [(ngModel)]="brandContent().qualities.description" rows="3" fluid></textarea></div>
                <div>
                    <div class="flex items-center justify-between mb-2"><label class="block font-bold">Quality Cards</label><p-button label="Add Card" icon="pi pi-plus" (onClick)="addToPath('qualities.cards', {number: brandContent().qualities.cards.length + 1, title: '', description: ''})" /></div>
                    <div class="flex flex-col gap-3">
                        <p-card *ngFor="let card of brandContent().qualities.cards; let i = index">
                            <div class="flex flex-col gap-3">
                                <div class="grid grid-cols-2 gap-3">
                                    <div><label class="block text-sm font-bold mb-1">Number</label><input type="number" pInputText [(ngModel)]="card.number" fluid /></div>
                                    <div><label class="block text-sm font-bold mb-1">Title</label><input type="text" pInputText [(ngModel)]="card.title" fluid /></div>
                                </div>
                                <div><label class="block text-sm font-bold mb-1">Description</label><textarea pTextarea [(ngModel)]="card.description" rows="2" fluid></textarea></div>
                                <div class="flex justify-end"><p-button icon="pi pi-trash" severity="danger" text (onClick)="removeAt('qualities.cards', i)" /></div>
                            </div>
                        </p-card>
                    </div>
                </div>
            </div>
        </ng-template>

        <!-- GENERIC PORTFOLIO -->
        <ng-template #portfolioFields>
            <div class="flex flex-col gap-4">
                <div><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().portfolio.badge" fluid /></div>
                <div><label class="block font-bold mb-2">Heading</label><input type="text" pInputText [(ngModel)]="brandContent().portfolio.heading" fluid /></div>
                <div><label class="block font-bold mb-2">Description</label><textarea pTextarea [(ngModel)]="brandContent().portfolio.description" rows="3" fluid></textarea></div>
                <div *ngIf="brandContent().portfolio.tags !== undefined">
                    <label class="block font-bold mb-2">Portfolio Tags</label>
                    <div class="flex flex-wrap gap-2 mb-2">
                        <p-tag *ngFor="let tag of brandContent().portfolio.tags; let i = index" [value]="tag" icon="pi pi-times" (onClick)="removeString(brandContent().portfolio.tags, i)" severity="secondary" class="cursor-pointer" />
                    </div>
                    <div class="flex gap-2">
                        <input type="text" pInputText #portfolioTagInput placeholder="Add tag" fluid (keydown.enter)="addString(brandContent().portfolio.tags, portfolioTagInput.value); portfolioTagInput.value = ''" />
                        <p-button icon="pi pi-plus" (onClick)="addString(brandContent().portfolio.tags, portfolioTagInput.value); portfolioTagInput.value = ''" />
                    </div>
                </div>
                <div *ngIf="brandContent().portfolio.card !== undefined">
                    <div class="flex items-center justify-between mb-2"><label class="block font-bold">Portfolio Cards</label><p-button label="Add Card" icon="pi pi-plus" (onClick)="addToPath('portfolio.card', {name: '', image: ''})" /></div>
                    <div class="flex flex-col gap-3">
                        <p-card *ngFor="let card of brandContent().portfolio.card; let i = index">
                            <div class="flex flex-col gap-3">
                                <div><label class="block text-sm font-bold mb-1">Name</label><input type="text" pInputText [(ngModel)]="card.name" fluid /></div>
                                <div><app-image-upload label="Card Image" folder="brands" [(currentImage)]="card.image" /></div>
                                <div class="flex justify-end"><p-button icon="pi pi-trash" severity="danger" text (onClick)="removeAt('portfolio.card', i)" /></div>
                            </div>
                        </p-card>
                    </div>
                </div>
            </div>
        </ng-template>

        <!-- GENERIC HERITAGE -->
        <ng-template #heritageFields>
            <div class="flex flex-col gap-4">
                <div><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().heritage.badge" fluid /></div>
                <div><label class="block font-bold mb-2">Heading</label><input type="text" pInputText [(ngModel)]="brandContent().heritage.heading" fluid /></div>
                <div><label class="block font-bold mb-2">Description</label><textarea pTextarea [(ngModel)]="brandContent().heritage.description" rows="3" fluid></textarea></div>
                <div><app-image-gallery-upload label="Heritage Images" folder="brands" [(images)]="brandContent().heritage.images" /></div>
                <div><label class="block font-bold mb-2">YouTube URL</label><input type="text" pInputText [(ngModel)]="brandContent().heritage.youtube_url" fluid /></div>
            </div>
        </ng-template>

        <!-- SPLIT -->
        <ng-template #splitFields>
            <div class="flex flex-col gap-4">
                <div><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().split.badge" fluid /></div>
                <div><app-image-upload label="Split Image" folder="brands" [(currentImage)]="brandContent().split.image" /></div>
            </div>
        </ng-template>

        <!-- SPLIT1 -->
        <ng-template #split1Fields>
            <div class="flex flex-col gap-4">
                <div><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().split1.badge" fluid /></div>
                <div><app-image-upload label="Split 1 Image" folder="brands" [(currentImage)]="brandContent().split1.image" /></div>
            </div>
        </ng-template>

        <!-- SPLIT2 -->
        <ng-template #split2Fields>
            <div class="flex flex-col gap-4">
                <div><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().split2.badge" fluid /></div>
                <div><app-image-upload label="Split 2 Image" folder="brands" [(currentImage)]="brandContent().split2.image" /></div>
                <div *ngIf="brandContent().split2.features !== undefined">
                    <label class="block font-bold mb-2">Features</label>
                    <div class="flex flex-wrap gap-2 mb-2">
                        <p-tag *ngFor="let f of brandContent().split2.features; let i = index" [value]="f" icon="pi pi-times" (onClick)="removeString(brandContent().split2.features, i)" severity="secondary" class="cursor-pointer" />
                    </div>
                    <div class="flex gap-2">
                        <input type="text" pInputText #split2FeatInput placeholder="Add feature" fluid (keydown.enter)="addString(brandContent().split2.features, split2FeatInput.value); split2FeatInput.value = ''" />
                        <p-button icon="pi pi-plus" (onClick)="addString(brandContent().split2.features, split2FeatInput.value); split2FeatInput.value = ''" />
                    </div>
                </div>
                <div *ngIf="brandContent().split2.tags !== undefined">
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Vegetables</label>
                            <div class="flex flex-wrap gap-2 mb-2">
                                <p-tag *ngFor="let v of brandContent().split2.tags.Vegetables; let i = index" [value]="v" icon="pi pi-times" (onClick)="removeString(brandContent().split2.tags.Vegetables, i)" severity="secondary" class="cursor-pointer" />
                            </div>
                            <div class="flex gap-2">
                                <input type="text" pInputText #vegInput placeholder="Add vegetable" fluid (keydown.enter)="addString(brandContent().split2.tags.Vegetables, vegInput.value); vegInput.value = ''" />
                                <p-button icon="pi pi-plus" (onClick)="addString(brandContent().split2.tags.Vegetables, vegInput.value); vegInput.value = ''" />
                            </div>
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Fruits</label>
                            <div class="flex flex-wrap gap-2 mb-2">
                                <p-tag *ngFor="let f of brandContent().split2.tags.Fruits; let i = index" [value]="f" icon="pi pi-times" (onClick)="removeString(brandContent().split2.tags.Fruits, i)" severity="secondary" class="cursor-pointer" />
                            </div>
                            <div class="flex gap-2">
                                <input type="text" pInputText #fruitInput placeholder="Add fruit" fluid (keydown.enter)="addString(brandContent().split2.tags.Fruits, fruitInput.value); fruitInput.value = ''" />
                                <p-button icon="pi pi-plus" (onClick)="addString(brandContent().split2.tags.Fruits, fruitInput.value); fruitInput.value = ''" />
                            </div>
                        </div>
                    </div>
                </div>
                <div *ngIf="brandContent().split2.gallery !== undefined">
                    <app-image-gallery-upload label="Split 2 Gallery" folder="brands" [(images)]="brandContent().split2.gallery" />
                </div>
            </div>
        </ng-template>

        <!-- GRID -->
        <ng-template #gridFields>
            <div class="flex flex-col gap-4">
                <div><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().grid.badge" fluid /></div>
                <div><app-image-gallery-upload label="Grid Images" folder="brands" [(images)]="brandContent().grid.images" /></div>
            </div>
        </ng-template>

        <!-- PROJECTS -->
        <ng-template #projectsFields>
            <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between mb-2"><label class="block font-bold">Projects</label><p-button label="Add Project" icon="pi pi-plus" (onClick)="addToPath('Projects', {title: '', duration: '', focus: '', location: '', donor: ''})" /></div>
                <div class="flex flex-col gap-3">
                    <p-card *ngFor="let item of brandContent().Projects; let i = index">
                        <div class="flex flex-col gap-3">
                            <div class="grid grid-cols-2 gap-3">
                                <div><label class="block text-sm font-bold mb-1">Title</label><input type="text" pInputText [(ngModel)]="item.title" fluid /></div>
                                <div><label class="block text-sm font-bold mb-1">Duration</label><input type="text" pInputText [(ngModel)]="item.duration" fluid /></div>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div><label class="block text-sm font-bold mb-1">Focus</label><input type="text" pInputText [(ngModel)]="item.focus" fluid /></div>
                                <div><label class="block text-sm font-bold mb-1">Location</label><input type="text" pInputText [(ngModel)]="item.location" fluid /></div>
                            </div>
                            <div><label class="block text-sm font-bold mb-1">Donor</label><input type="text" pInputText [(ngModel)]="item.donor" fluid /></div>
                            <div class="flex justify-end"><p-button icon="pi pi-trash" severity="danger" text (onClick)="removeAt('Projects', i)" /></div>
                        </div>
                    </p-card>
                </div>
            </div>
        </ng-template>

        <!-- PROCESS -->
        <ng-template #processFields>
            <div class="flex flex-col gap-4">
                <div><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().process.badge" fluid /></div>
                <div><app-image-gallery-upload label="Process Images" folder="brands" [(images)]="brandContent().process.images" /></div>
            </div>
        </ng-template>

        <!-- PROCESS2 -->
        <ng-template #process2Fields>
            <div class="flex flex-col gap-4">
                <div><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().process2.badge" fluid /></div>
                <div><label class="block font-bold mb-2">Button Text</label><input type="text" pInputText [(ngModel)]="brandContent().process2.buttonText" fluid /></div>
                <div><label class="block font-bold mb-2">Button Link</label><input type="text" pInputText [(ngModel)]="brandContent().process2.buttonLink" fluid /></div>
                <div><app-image-gallery-upload label="Process 2 Images" folder="brands" [(images)]="brandContent().process2.images" /></div>
            </div>
        </ng-template>

        <!-- YOUTUBE -->
        <ng-template #youtubeFields>
            <div class="flex flex-col gap-4">
                <div *ngIf="brandContent().youtube.badge !== undefined"><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().youtube.badge" fluid /></div>
                <div *ngIf="brandContent().youtube.youtubeUrl !== undefined"><label class="block font-bold mb-2">YouTube URL</label><input type="text" pInputText [(ngModel)]="brandContent().youtube.youtubeUrl" fluid /></div>
                <div *ngIf="brandContent().youtube.video_url !== undefined"><label class="block font-bold mb-2">Video URL</label><input type="text" pInputText [(ngModel)]="brandContent().youtube.video_url" fluid /></div>
                <div *ngIf="brandContent().youtube.brandLogo !== undefined"><app-image-upload label="Brand Logo" folder="brands" [(currentImage)]="brandContent().youtube.brandLogo" /></div>
                <div *ngIf="brandContent().youtube.images !== undefined"><app-image-gallery-upload label="YouTube Images" folder="brands" [(images)]="brandContent().youtube.images" /></div>
            </div>
        </ng-template>

        <!-- TRAINING -->
        <ng-template #trainingFields>
            <div class="flex flex-col gap-4">
                <div><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().training.badge" fluid /></div>
                <div>
                    <div class="flex items-center justify-between mb-2"><label class="block font-bold">Programs</label><p-button label="Add Program" icon="pi pi-plus" (onClick)="addToPath('training.programs', {title: '', image: ''})" /></div>
                    <div class="flex flex-col gap-3">
                        <p-card *ngFor="let prog of brandContent().training.programs; let i = index">
                            <div class="flex flex-col gap-3">
                                <div><label class="block text-sm font-bold mb-1">Title</label><input type="text" pInputText [(ngModel)]="prog.title" fluid /></div>
                                <div><app-image-upload label="Program Image" folder="brands" [(currentImage)]="prog.image" /></div>
                                <div class="flex justify-end"><p-button icon="pi pi-trash" severity="danger" text (onClick)="removeAt('training.programs', i)" /></div>
                            </div>
                        </p-card>
                    </div>
                </div>
                <div>
                    <div class="flex items-center justify-between mb-2"><label class="block font-bold">Facilities</label><p-button label="Add Facility" icon="pi pi-plus" (onClick)="addToPath('training.facilities', {title: '', capacity: 0, beds: 0, description: '', image: ''})" /></div>
                    <div class="flex flex-col gap-3">
                        <p-card *ngFor="let fac of brandContent().training.facilities; let i = index">
                            <div class="flex flex-col gap-3">
                                <div class="grid grid-cols-2 gap-3">
                                    <div><label class="block text-sm font-bold mb-1">Title</label><input type="text" pInputText [(ngModel)]="fac.title" fluid /></div>
                                    <div><label class="block text-sm font-bold mb-1">Capacity</label><input type="number" pInputText [(ngModel)]="fac.capacity" fluid /></div>
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div><label class="block text-sm font-bold mb-1">Beds</label><input type="number" pInputText [(ngModel)]="fac.beds" fluid /></div>
                                    <div><label class="block text-sm font-bold mb-1">Image</label><app-image-upload folder="brands" [(currentImage)]="fac.image" /></div>
                                </div>
                                <div><label class="block text-sm font-bold mb-1">Description</label><textarea pTextarea [(ngModel)]="fac.description" rows="2" fluid></textarea></div>
                                <div class="flex justify-end"><p-button icon="pi pi-trash" severity="danger" text (onClick)="removeAt('training.facilities', i)" /></div>
                            </div>
                        </p-card>
                    </div>
                </div>
            </div>
        </ng-template>

        <!-- TESTIMONIALS -->
        <ng-template #testimonialsFields>
            <div class="flex flex-col gap-4">
                <div><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().testimonials.badge" fluid /></div>
                <div>
                    <div class="flex items-center justify-between mb-2"><label class="block font-bold">Visitor Scans</label><p-button label="Add Scan" icon="pi pi-plus" (onClick)="addToPath('testimonials.visitorScans', {image: '', title: ''})" /></div>
                    <div class="flex flex-col gap-3">
                        <p-card *ngFor="let scan of brandContent().testimonials.visitorScans; let i = index">
                            <div class="flex flex-col gap-3">
                                <div><label class="block text-sm font-bold mb-1">Title</label><input type="text" pInputText [(ngModel)]="scan.title" fluid /></div>
                                <div><app-image-upload label="Scan Image" folder="brands" [(currentImage)]="scan.image" /></div>
                                <div class="flex justify-end"><p-button icon="pi pi-trash" severity="danger" text (onClick)="removeAt('testimonials.visitorScans', i)" /></div>
                            </div>
                        </p-card>
                    </div>
                </div>
            </div>
        </ng-template>

        <!-- CROP PORTFOLIO -->
        <ng-template #cropPortfolioFields>
            <div class="flex flex-col gap-4">
                <div *ngIf="brandContent().cropPortfolio.badge !== undefined"><label class="block font-bold mb-2">Badge</label><input type="text" pInputText [(ngModel)]="brandContent().cropPortfolio.badge" fluid /></div>
                <div>
                    <div class="flex items-center justify-between mb-2"><label class="block font-bold">Crop Groups</label><p-button label="Add Group" icon="pi pi-plus" (onClick)="addToPath('cropPortfolio.groups', {category: '', items: []})" /></div>
                    <div class="flex flex-col gap-3">
                        <p-card *ngFor="let group of brandContent().cropPortfolio.groups; let i = index">
                            <div class="flex flex-col gap-3">
                                <div><label class="block text-sm font-bold mb-1">Category</label><input type="text" pInputText [(ngModel)]="group.category" fluid /></div>
                                <div>
                                    <div class="flex items-center justify-between mb-2"><label class="block text-sm font-bold mb-1">Rows (comma-separated)</label><p-button label="Add Row" icon="pi pi-plus" size="small" (onClick)="addCropRow(group)" /></div>
                                    <div class="flex flex-col gap-2">
                                        <div *ngFor="let row of group.items; let j = index" class="flex gap-2">
                                            <input type="text" pInputText [ngModel]="rowToString(row)" (ngModelChange)="updateRow(row, $event)" placeholder="Value 1, Value 2, ..." fluid />
                                            <p-button icon="pi pi-trash" severity="danger" text (onClick)="removeCropRow(group, j)" />
                                        </div>
                                    </div>
                                </div>
                                <div class="flex justify-end"><p-button icon="pi pi-trash" severity="danger" text (onClick)="removeAt('cropPortfolio.groups', i)" /></div>
                            </div>
                        </p-card>
                    </div>
                </div>
                <div *ngIf="brandContent().cropPortfolio.tags !== undefined">
                    <div class="flex items-center justify-between mb-2"><label class="block font-bold">Tags</label><p-button label="Add Row" icon="pi pi-plus" (onClick)="addToPath('cropPortfolio.tags', [''])" /></div>
                    <div class="flex flex-col gap-2">
                        <div *ngFor="let row of brandContent().cropPortfolio.tags; let i = index" class="flex gap-2">
                            <input type="text" pInputText [ngModel]="rowToString(row)" (ngModelChange)="updateRow(row, $event)" placeholder="Tag 1, Tag 2, ..." fluid />
                            <p-button icon="pi pi-trash" severity="danger" text (onClick)="removeAt('cropPortfolio.tags', i)" />
                        </div>
                    </div>
                </div>
            </div>
        </ng-template>
    `
})
export class BrandsListPage implements OnInit {
    brands = signal<OurBrand[]>([]);
    resourceName = 'brand';
    dialog = false;
    brand: OurBrand = this.newBrand();
    activeTab = signal<string | number>('basic');
    dialogTabs = signal<{ value: string; label: string }[]>([]);
    saving = false;
    mediaBaseUrl = environment.mediaBaseUrl;
    categories = CATEGORIES;

    brandContent(): any {
        return this.brand.content || {};
    }

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadBrands();
    }

    newBrand(): OurBrand {
        return {
            name: '',
            slug: '',
            category: 'vegetable_seeds',
            is_featured: false,
            is_active: true,
            sort_order: 0,
            content: getDefaultContent('vegetable_seeds')
        };
    }

    loadBrands() {
        this.api.getBrands().subscribe({
            next: (data) => this.brands.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load brands' })
        });
    }

    openNew() {
        this.brand = this.newBrand();
        this.dialogTabs.set(tabsForCategory(this.brand.category || 'generic'));
        this.activeTab.set('basic');
        this.dialog = true;
    }

    editBrand(b: OurBrand) {
        const category = b.category || 'generic';
        this.brand = {
            ...b,
            content: { ...getDefaultContent(category), ...(b.content || {}) }
        };
        this.dialogTabs.set(tabsForCategory(category));
        this.activeTab.set('basic');
        this.dialog = true;
    }

    onNameChange(name: string) {
        if (!this.brand.slug) {
            this.brand.slug = slugify(name);
        }
    }

    onCategoryChange(category: string) {
        if (!this.brand.id) {
            this.brand.category = category;
            this.brand.content = getDefaultContent(category);
            this.dialogTabs.set(tabsForCategory(category));
        }
    }

    hideDialog() {
        this.dialog = false;
    }

    private getPath(path: string): any {
        const parts = path.split('.');
        let current: any = this.brandContent();
        for (const part of parts) {
            if (current == null) return undefined;
            current = current[part];
        }
        return current;
    }

    addToPath(path: string, item: any) {
        const arr = this.getPath(path);
        if (Array.isArray(arr)) {
            arr.push({ ...item });
        }
    }

    removeAt(path: string, index: number) {
        const arr = this.getPath(path);
        if (Array.isArray(arr)) {
            arr.splice(index, 1);
        }
    }

    addString(list: string[] | undefined, value: string) {
        const trimmed = value?.trim();
        if (!trimmed || !list) return;
        if (!list.includes(trimmed)) {
            list.push(trimmed);
        }
    }

    removeString(list: string[] | undefined, index: number) {
        list?.splice(index, 1);
    }

    addCropRow(group: any) {
        if (!group.items) group.items = [];
        group.items.push(['']);
    }

    removeCropRow(group: any, index: number) {
        group.items?.splice(index, 1);
    }

    rowToString(row: string[]): string {
        return (row || []).join(', ');
    }

    updateRow(row: string[], value: string) {
        row.length = 0;
        value.split(',').map(s => s.trim()).filter(Boolean).forEach(v => row.push(v));
    }

    moveBrand(item: OurBrand, direction: 'up' | 'down') {
        const current = [...this.brands()];
        const idx = current.findIndex(b => b.id === item.id);
        if (idx < 0) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= current.length) return;

        const updated = current.map(b => ({ ...b }));
        const a = updated[idx];
        const b = updated[swapIdx];
        const aOrder = a.sort_order ?? 0;
        const bOrder = b.sort_order ?? 0;
        a.sort_order = bOrder;
        b.sort_order = aOrder;

        updated.sort((x, y) => (x.sort_order ?? 0) - (y.sort_order ?? 0));
        const order = updated.map(b => b.id).filter((id): id is number => !!id);
        if (!order.length) return;

        this.brands.set(updated);
        this.api.reorder(this.resourceName, order).subscribe({
            next: () => this.messageService.add({ severity: 'success', summary: 'Reordered', detail: 'Order saved', life: 2000 }),
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to reorder', life: 3000 });
                this.loadBrands();
            }
        });
    }

    saveBrand() {
        if (!this.brand.name?.trim() || !this.brand.slug?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in name and slug.', life: 3000 });
            return;
        }
        this.saving = true;
        const data = { ...this.brand };
        const request = data.id
            ? this.api.adminUpdate('brand', data.id, data)
            : this.api.adminCreate('brand', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Brand saved successfully', life: 3000 });
                this.loadBrands();
                this.dialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save brand' });
            }
        });
    }

    deleteBrand(b: OurBrand) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${b.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!b.id) return;
                this.api.adminDelete('brand', b.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Brand deleted', life: 3000 });
                        this.loadBrands();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete brand' });
                    }
                });
            }
        });
    }
}
