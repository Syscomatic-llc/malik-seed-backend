import { Component, OnInit, signal } from '@angular/core';
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
    { label: "Origene", value: "origene" },
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
        hero: { title: '', subtitle: '', background_image: '', scroll_text: 'Scroll to explore' },
        intro: { heading: '', heading_highlight: '', description: '', stats: [], highlights: [] },
        split1: { badge: '', heading: '', description: '', image: '', reverse: false },
        grid: { badge: '', heading: '', description: '', cards: [] },
        split2: { badge: '', heading: '', description: '', image: '', features: [] },
        projects: { badge: '', heading: '', description: '', items: [] }
    };
}

function defaultFlowerContent(): any {
    return {
        hero: { title: '', subtitle: '', background_image: '', scroll_text: 'Scroll to explore' },
        intro: { heading: '', heading_highlight: '', description: '', tags: [] },
        grid: { badge: '', heading: '', description: '', cards: [] },
        split: { badge: '', heading: '', description: '', image: '', highlights: [] },
        portfolio: { badge: '', heading: '', description: '', tags: [] }
    };
}

function defaultOrigeneContent(): any {
    return {
        hero: { title: '', subtitle: '', background_image: '', scroll_text: 'Scroll to explore' },
        grid: { badge: '', heading: '', description: '', cards: [] },
        split1: { badge: '', heading: '', description: '', image: '', stats: [] },
        process2: { badge: '', heading: '', description: '', steps: [] },
        split2: { badge: '', heading: '', description: '', image: '', features: [] }
    };
}

function defaultFarmContent(): any {
    return {
        hero: { title: '', subtitle: '', background_image: '', scroll_text: 'Scroll to explore' },
        intro: { heading: '', heading_highlight: '', description: '', stats: [] },
        split1: { badge: '', heading: '', description: '', image: '', highlights: [] },
        process: { badge: '', heading: '', description: '', steps: [] },
        split2: { badge: '', heading: '', description: '', image: '', tags: { vegetables: [], fruits: [] } },
        training: { badge: '', heading: '', description: '', programs: [], images: [] },
        testimonials: { badge: '', heading: '', description: '', items: [] },
        cropPortfolio: { badge: '', heading: '', description: '', groups: [] }
    };
}

function defaultPotatoContent(): any {
    return {
        hero: { title: '', subtitle: '', background_image: '', scroll_text: 'Scroll to explore' },
        intro: { heading: '', heading_highlight: '', description: '', tags: [] },
        grid: { badge: '', heading: '', description: '', cards: [] },
        split: { badge: '', heading: '', description: '', image: '', highlights: [] },
        youtube: { title: '', description: '', video_url: '', thumbnail: '' }
    };
}

function defaultVegetableContent(): any {
    return {
        hero: { title: '', subtitle: '', background_image: '', scroll_text: 'Scroll to explore' },
        grid: { badge: '', heading: '', description: '', cards: [] },
        youtube: { title: '', description: '', video_url: '', thumbnail: '' },
        cropPortfolio: { badge: '', heading: '', description: '', groups: [] }
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
                <ng-template #basicFields>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Name</label>
                            <input type="text" pInputText [(ngModel)]="brand.name" (ngModelChange)="onNameChange($event)" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Slug</label>
                            <input type="text" pInputText [(ngModel)]="brand.slug" placeholder="brand-name" [readonly]="!brand.id" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Category</label>
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

                <ng-template #heroFields>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Hero Title</label>
                            <input type="text" pInputText [(ngModel)]="content.hero.title" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Hero Subtitle</label>
                            <input type="text" pInputText [(ngModel)]="content.hero.subtitle" fluid />
                        </div>
                        <div>
                            <app-image-upload label="Hero Background Image" folder="brands" [(currentImage)]="content.hero.background_image" />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Scroll Text</label>
                            <input type="text" pInputText [(ngModel)]="content.hero.scroll_text" fluid />
                        </div>
                    </div>
                </ng-template>

                <ng-template #introFields>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Heading</label>
                            <input type="text" pInputText [(ngModel)]="content.intro.heading" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Heading Highlight</label>
                            <input type="text" pInputText [(ngModel)]="content.intro.heading_highlight" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="content.intro.description" rows="4" fluid></textarea>
                        </div>
                        <div *ngIf="content.intro.tags">
                            <label class="block font-bold mb-2">Tags</label>
                            <div class="flex flex-wrap gap-2 mb-2">
                                <p-tag *ngFor="let tag of content.intro.tags; let i = index" [value]="tag" icon="pi pi-times" (onClick)="removeString(content.intro.tags, i)" severity="secondary" class="cursor-pointer" />
                            </div>
                            <div class="flex gap-2">
                                <input type="text" pInputText #introTagInput placeholder="Add tag" fluid (keydown.enter)="addString(content.intro.tags, introTagInput.value); introTagInput.value = ''" />
                                <p-button icon="pi pi-plus" (onClick)="addString(content.intro.tags, introTagInput.value); introTagInput.value = ''" />
                            </div>
                        </div>
                        <div *ngIf="content.intro.stats">
                            <div class="flex items-center justify-between mb-2">
                                <label class="block font-bold">Stats</label>
                                <p-button label="Add Stat" icon="pi pi-plus" (onClick)="addObjectItem('intro.stats', {label: '', value: '', suffix: ''})" />
                            </div>
                            <div class="flex flex-col gap-3">
                                <p-card *ngFor="let stat of content.intro.stats; let i = index">
                                    <div class="flex flex-col gap-3">
                                        <div class="grid grid-cols-3 gap-3">
                                            <div>
                                                <label class="block text-sm font-bold mb-1">Label</label>
                                                <input type="text" pInputText [(ngModel)]="stat.label" fluid />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-bold mb-1">Value</label>
                                                <input type="text" pInputText [(ngModel)]="stat.value" fluid />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-bold mb-1">Suffix</label>
                                                <input type="text" pInputText [(ngModel)]="stat.suffix" fluid />
                                            </div>
                                        </div>
                                        <div class="flex justify-end">
                                            <p-button icon="pi pi-trash" severity="danger" text (onClick)="removeObjectItem('intro.stats', i)" />
                                        </div>
                                    </div>
                                </p-card>
                            </div>
                        </div>
                        <div *ngIf="content.intro.highlights">
                            <label class="block font-bold mb-2">Highlights</label>
                            <div class="flex flex-wrap gap-2 mb-2">
                                <p-tag *ngFor="let h of content.intro.highlights; let i = index" [value]="h" icon="pi pi-times" (onClick)="removeString(content.intro.highlights, i)" severity="secondary" class="cursor-pointer" />
                            </div>
                            <div class="flex gap-2">
                                <input type="text" pInputText #introHighInput placeholder="Add highlight" fluid (keydown.enter)="addString(content.intro.highlights, introHighInput.value); introHighInput.value = ''" />
                                <p-button icon="pi pi-plus" (onClick)="addString(content.intro.highlights, introHighInput.value); introHighInput.value = ''" />
                            </div>
                        </div>
                    </div>
                </ng-template>

                <ng-template #splitFields let-section="section">
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Badge</label>
                            <input type="text" pInputText [(ngModel)]="content[section].badge" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Heading</label>
                            <input type="text" pInputText [(ngModel)]="content[section].heading" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="content[section].description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <app-image-upload [label]="section + ' Image'" folder="brands" [(currentImage)]="content[section].image" />
                        </div>
                        <div *ngIf="content[section].reverse !== undefined">
                            <label class="block font-bold mb-2">Reverse Layout</label>
                            <p-toggleSwitch [(ngModel)]="content[section].reverse" />
                        </div>
                        <div *ngIf="content[section].features">
                            <label class="block font-bold mb-2">Features</label>
                            <div class="flex flex-wrap gap-2 mb-2">
                                <p-tag *ngFor="let f of content[section].features; let i = index" [value]="f" icon="pi pi-times" (onClick)="removeString(content[section].features, i)" severity="secondary" class="cursor-pointer" />
                            </div>
                            <div class="flex gap-2">
                                <input type="text" pInputText #splitFeatInput placeholder="Add feature" fluid (keydown.enter)="addString(content[section].features, splitFeatInput.value); splitFeatInput.value = ''" />
                                <p-button icon="pi pi-plus" (onClick)="addString(content[section].features, splitFeatInput.value); splitFeatInput.value = ''" />
                            </div>
                        </div>
                        <div *ngIf="content[section].highlights">
                            <label class="block font-bold mb-2">Highlights</label>
                            <div class="flex flex-wrap gap-2 mb-2">
                                <p-tag *ngFor="let h of content[section].highlights; let i = index" [value]="h" icon="pi pi-times" (onClick)="removeString(content[section].highlights, i)" severity="secondary" class="cursor-pointer" />
                            </div>
                            <div class="flex gap-2">
                                <input type="text" pInputText #splitHighInput placeholder="Add highlight" fluid (keydown.enter)="addString(content[section].highlights, splitHighInput.value); splitHighInput.value = ''" />
                                <p-button icon="pi pi-plus" (onClick)="addString(content[section].highlights, splitHighInput.value); splitHighInput.value = ''" />
                            </div>
                        </div>
                        <div *ngIf="content[section].stats">
                            <div class="flex items-center justify-between mb-2">
                                <label class="block font-bold">Stats</label>
                                <p-button label="Add Stat" icon="pi pi-plus" (onClick)="addObjectItem(section + '.stats', {label: '', value: '', suffix: ''})" />
                            </div>
                            <div class="flex flex-col gap-3">
                                <p-card *ngFor="let stat of content[section].stats; let i = index">
                                    <div class="flex flex-col gap-3">
                                        <div class="grid grid-cols-3 gap-3">
                                            <div>
                                                <label class="block text-sm font-bold mb-1">Label</label>
                                                <input type="text" pInputText [(ngModel)]="stat.label" fluid />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-bold mb-1">Value</label>
                                                <input type="text" pInputText [(ngModel)]="stat.value" fluid />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-bold mb-1">Suffix</label>
                                                <input type="text" pInputText [(ngModel)]="stat.suffix" fluid />
                                            </div>
                                        </div>
                                        <div class="flex justify-end">
                                            <p-button icon="pi pi-trash" severity="danger" text (onClick)="removeObjectItem(section + '.stats', i)" />
                                        </div>
                                    </div>
                                </p-card>
                            </div>
                        </div>
                        <div *ngIf="content[section].tags && content[section].tags.vegetables">
                            <div class="flex flex-col gap-4">
                                <div>
                                    <label class="block font-bold mb-2">Vegetables</label>
                                    <div class="flex flex-wrap gap-2 mb-2">
                                        <p-tag *ngFor="let v of content[section].tags.vegetables; let i = index" [value]="v" icon="pi pi-times" (onClick)="removeString(content[section].tags.vegetables, i)" severity="secondary" class="cursor-pointer" />
                                    </div>
                                    <div class="flex gap-2">
                                        <input type="text" pInputText #vegInput placeholder="Add vegetable" fluid (keydown.enter)="addString(content[section].tags.vegetables, vegInput.value); vegInput.value = ''" />
                                        <p-button icon="pi pi-plus" (onClick)="addString(content[section].tags.vegetables, vegInput.value); vegInput.value = ''" />
                                    </div>
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Fruits</label>
                                    <div class="flex flex-wrap gap-2 mb-2">
                                        <p-tag *ngFor="let f of content[section].tags.fruits; let i = index" [value]="f" icon="pi pi-times" (onClick)="removeString(content[section].tags.fruits, i)" severity="secondary" class="cursor-pointer" />
                                    </div>
                                    <div class="flex gap-2">
                                        <input type="text" pInputText #fruitInput placeholder="Add fruit" fluid (keydown.enter)="addString(content[section].tags.fruits, fruitInput.value); fruitInput.value = ''" />
                                        <p-button icon="pi pi-plus" (onClick)="addString(content[section].tags.fruits, fruitInput.value); fruitInput.value = ''" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>

                <ng-template #gridFields let-section="section">
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Badge</label>
                            <input type="text" pInputText [(ngModel)]="content[section].badge" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Heading</label>
                            <input type="text" pInputText [(ngModel)]="content[section].heading" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="content[section].description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="block font-bold">Cards</label>
                                <p-button label="Add Card" icon="pi pi-plus" (onClick)="addObjectItem(section + '.cards', {icon: '', title: '', description: '', image: ''})" />
                            </div>
                            <div class="flex flex-col gap-3">
                                <p-card *ngFor="let card of content[section].cards; let i = index">
                                    <div class="flex flex-col gap-3">
                                        <div>
                                            <app-image-upload label="Card Image" folder="brands" [(currentImage)]="card.image" />
                                        </div>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-sm font-bold mb-1">Icon</label>
                                                <input type="text" pInputText [(ngModel)]="card.icon" fluid />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-bold mb-1">Title</label>
                                                <input type="text" pInputText [(ngModel)]="card.title" fluid />
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Description</label>
                                            <textarea pTextarea [(ngModel)]="card.description" rows="2" fluid></textarea>
                                        </div>
                                        <div class="flex justify-end">
                                            <p-button icon="pi pi-trash" severity="danger" text (onClick)="removeObjectItem(section + '.cards', i)" />
                                        </div>
                                    </div>
                                </p-card>
                            </div>
                        </div>
                    </div>
                </ng-template>

                <ng-template #processFields let-section="section">
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Badge</label>
                            <input type="text" pInputText [(ngModel)]="content[section].badge" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Heading</label>
                            <input type="text" pInputText [(ngModel)]="content[section].heading" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="content[section].description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="block font-bold">Steps</label>
                                <p-button label="Add Step" icon="pi pi-plus" (onClick)="addObjectItem(section + '.steps', {title: '', description: '', image: ''})" />
                            </div>
                            <div class="flex flex-col gap-3">
                                <p-card *ngFor="let step of content[section].steps; let i = index">
                                    <div class="flex flex-col gap-3">
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Title</label>
                                            <input type="text" pInputText [(ngModel)]="step.title" fluid />
                                        </div>
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Description</label>
                                            <textarea pTextarea [(ngModel)]="step.description" rows="2" fluid></textarea>
                                        </div>
                                        <div>
                                            <app-image-upload label="Step Image" folder="brands" [(currentImage)]="step.image" />
                                        </div>
                                        <div class="flex justify-end">
                                            <p-button icon="pi pi-trash" severity="danger" text (onClick)="removeObjectItem(section + '.steps', i)" />
                                        </div>
                                    </div>
                                </p-card>
                            </div>
                        </div>
                    </div>
                </ng-template>

                <ng-template #projectsFields>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Badge</label>
                            <input type="text" pInputText [(ngModel)]="content.projects.badge" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Heading</label>
                            <input type="text" pInputText [(ngModel)]="content.projects.heading" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="content.projects.description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="block font-bold">Projects</label>
                                <p-button label="Add Project" icon="pi pi-plus" (onClick)="addObjectItem('projects.items', {title: '', description: '', image: '', tags: []})" />
                            </div>
                            <div class="flex flex-col gap-3">
                                <p-card *ngFor="let item of content.projects.items; let i = index">
                                    <div class="flex flex-col gap-3">
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Title</label>
                                            <input type="text" pInputText [(ngModel)]="item.title" fluid />
                                        </div>
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Description</label>
                                            <textarea pTextarea [(ngModel)]="item.description" rows="2" fluid></textarea>
                                        </div>
                                        <div>
                                            <app-image-upload label="Project Image" folder="brands" [(currentImage)]="item.image" />
                                        </div>
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Tags</label>
                                            <div class="flex flex-wrap gap-2 mb-2">
                                                <p-tag *ngFor="let tag of item.tags; let j = index" [value]="tag" icon="pi pi-times" (onClick)="removeString(item.tags, j)" severity="secondary" class="cursor-pointer" />
                                            </div>
                                            <div class="flex gap-2">
                                                <input type="text" pInputText #projectTagInput placeholder="Add tag" fluid (keydown.enter)="addString(item.tags, projectTagInput.value); projectTagInput.value = ''" />
                                                <p-button icon="pi pi-plus" (onClick)="addString(item.tags, projectTagInput.value); projectTagInput.value = ''" />
                                            </div>
                                        </div>
                                        <div class="flex justify-end">
                                            <p-button icon="pi pi-trash" severity="danger" text (onClick)="removeObjectItem('projects.items', i)" />
                                        </div>
                                    </div>
                                </p-card>
                            </div>
                        </div>
                    </div>
                </ng-template>

                <ng-template #youtubeFields>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">YouTube Title</label>
                            <input type="text" pInputText [(ngModel)]="content.youtube.title" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="content.youtube.description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Video URL</label>
                            <input type="text" pInputText [(ngModel)]="content.youtube.video_url" fluid />
                        </div>
                        <div>
                            <app-image-upload label="Thumbnail" folder="brands" [(currentImage)]="content.youtube.thumbnail" />
                        </div>
                    </div>
                </ng-template>

                <ng-template #trainingFields>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Badge</label>
                            <input type="text" pInputText [(ngModel)]="content.training.badge" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Heading</label>
                            <input type="text" pInputText [(ngModel)]="content.training.heading" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="content.training.description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <app-image-gallery-upload label="Training Images" folder="brands" [(images)]="content.training.images" />
                        </div>
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="block font-bold">Programs</label>
                                <p-button label="Add Program" icon="pi pi-plus" (onClick)="addObjectItem('training.programs', {title: '', description: '', image: ''})" />
                            </div>
                            <div class="flex flex-col gap-3">
                                <p-card *ngFor="let prog of content.training.programs; let i = index">
                                    <div class="flex flex-col gap-3">
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Title</label>
                                            <input type="text" pInputText [(ngModel)]="prog.title" fluid />
                                        </div>
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Description</label>
                                            <textarea pTextarea [(ngModel)]="prog.description" rows="2" fluid></textarea>
                                        </div>
                                        <div>
                                            <app-image-upload label="Program Image" folder="brands" [(currentImage)]="prog.image" />
                                        </div>
                                        <div class="flex justify-end">
                                            <p-button icon="pi pi-trash" severity="danger" text (onClick)="removeObjectItem('training.programs', i)" />
                                        </div>
                                    </div>
                                </p-card>
                            </div>
                        </div>
                    </div>
                </ng-template>

                <ng-template #testimonialsFields>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Badge</label>
                            <input type="text" pInputText [(ngModel)]="content.testimonials.badge" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Heading</label>
                            <input type="text" pInputText [(ngModel)]="content.testimonials.heading" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="content.testimonials.description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="block font-bold">Testimonials</label>
                                <p-button label="Add Testimonial" icon="pi pi-plus" (onClick)="addObjectItem('testimonials.items', {name: '', role: '', content: '', image: ''})" />
                            </div>
                            <div class="flex flex-col gap-3">
                                <p-card *ngFor="let t of content.testimonials.items; let i = index">
                                    <div class="flex flex-col gap-3">
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-sm font-bold mb-1">Name</label>
                                                <input type="text" pInputText [(ngModel)]="t.name" fluid />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-bold mb-1">Role</label>
                                                <input type="text" pInputText [(ngModel)]="t.role" fluid />
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Content</label>
                                            <textarea pTextarea [(ngModel)]="t.content" rows="2" fluid></textarea>
                                        </div>
                                        <div>
                                            <app-image-upload label="Avatar" folder="brands" [(currentImage)]="t.image" />
                                        </div>
                                        <div class="flex justify-end">
                                            <p-button icon="pi pi-trash" severity="danger" text (onClick)="removeObjectItem('testimonials.items', i)" />
                                        </div>
                                    </div>
                                </p-card>
                            </div>
                        </div>
                    </div>
                </ng-template>

                <ng-template #cropPortfolioFields>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Badge</label>
                            <input type="text" pInputText [(ngModel)]="content.cropPortfolio.badge" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Heading</label>
                            <input type="text" pInputText [(ngModel)]="content.cropPortfolio.heading" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="content.cropPortfolio.description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="block font-bold">Crop Groups</label>
                                <p-button label="Add Group" icon="pi pi-plus" (onClick)="addObjectItem('cropPortfolio.groups', {category: '', items: []})" />
                            </div>
                            <div class="flex flex-col gap-3">
                                <p-card *ngFor="let group of content.cropPortfolio.groups; let i = index">
                                    <div class="flex flex-col gap-3">
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Category</label>
                                            <input type="text" pInputText [(ngModel)]="group.category" fluid />
                                        </div>
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <label class="block text-sm font-bold mb-1">Rows (comma-separated values)</label>
                                                <p-button label="Add Row" icon="pi pi-plus" size="small" (onClick)="addCropRow(group)" />
                                            </div>
                                            <div class="flex flex-col gap-2">
                                                <div *ngFor="let row of group.items; let j = index" class="flex gap-2">
                                                    <input type="text" pInputText [ngModel]="rowToString(row)" (ngModelChange)="updateRow(row, $event)" placeholder="Value 1, Value 2, ..." fluid />
                                                    <p-button icon="pi pi-trash" severity="danger" text (onClick)="removeCropRow(group, j)" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex justify-end">
                                            <p-button icon="pi pi-trash" severity="danger" text (onClick)="removeObjectItem('cropPortfolio.groups', i)" />
                                        </div>
                                    </div>
                                </p-card>
                            </div>
                        </div>
                    </div>
                </ng-template>

                <ng-template #farmersFields>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Badge</label>
                            <input type="text" pInputText [(ngModel)]="content.farmers.badge" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Heading</label>
                            <input type="text" pInputText [(ngModel)]="content.farmers.heading" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="content.farmers.description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <app-image-gallery-upload label="Farmers Images" folder="brands" [(images)]="content.farmers.images" />
                        </div>
                    </div>
                </ng-template>

                <ng-template #qualitiesFields>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Badge</label>
                            <input type="text" pInputText [(ngModel)]="content.qualities.badge" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Heading</label>
                            <input type="text" pInputText [(ngModel)]="content.qualities.heading" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="content.qualities.description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="block font-bold">Quality Cards</label>
                                <p-button label="Add Card" icon="pi pi-plus" (onClick)="addObjectItem('qualities.cards', {number: content.qualities.cards.length + 1, title: '', description: ''})" />
                            </div>
                            <div class="flex flex-col gap-3">
                                <p-card *ngFor="let card of content.qualities.cards; let i = index">
                                    <div class="flex flex-col gap-3">
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-sm font-bold mb-1">Number</label>
                                                <input type="number" pInputText [(ngModel)]="card.number" fluid />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-bold mb-1">Title</label>
                                                <input type="text" pInputText [(ngModel)]="card.title" fluid />
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Description</label>
                                            <textarea pTextarea [(ngModel)]="card.description" rows="2" fluid></textarea>
                                        </div>
                                        <div class="flex justify-end">
                                            <p-button icon="pi pi-trash" severity="danger" text (onClick)="removeObjectItem('qualities.cards', i)" />
                                        </div>
                                    </div>
                                </p-card>
                            </div>
                        </div>
                    </div>
                </ng-template>

                <ng-template #portfolioFields>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Badge</label>
                            <input type="text" pInputText [(ngModel)]="content.portfolio.badge" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Heading</label>
                            <input type="text" pInputText [(ngModel)]="content.portfolio.heading" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="content.portfolio.description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Portfolio Tags</label>
                            <div class="flex flex-wrap gap-2 mb-2">
                                <p-tag *ngFor="let tag of content.portfolio.tags; let i = index" [value]="tag" icon="pi pi-times" (onClick)="removeString(content.portfolio.tags, i)" severity="secondary" class="cursor-pointer" />
                            </div>
                            <div class="flex gap-2">
                                <input type="text" pInputText #portfolioTagInput placeholder="Add tag" fluid (keydown.enter)="addString(content.portfolio.tags, portfolioTagInput.value); portfolioTagInput.value = ''" />
                                <p-button icon="pi pi-plus" (onClick)="addString(content.portfolio.tags, portfolioTagInput.value); portfolioTagInput.value = ''" />
                            </div>
                        </div>
                    </div>
                </ng-template>

                <ng-template #heritageFields>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Badge</label>
                            <input type="text" pInputText [(ngModel)]="content.heritage.badge" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Heading</label>
                            <input type="text" pInputText [(ngModel)]="content.heritage.heading" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="content.heritage.description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <app-image-gallery-upload label="Heritage Images" folder="brands" [(images)]="content.heritage.images" />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">YouTube URL</label>
                            <input type="text" pInputText [(ngModel)]="content.heritage.youtube_url" fluid />
                        </div>
                    </div>
                </ng-template>

                <p-tabs [(value)]="activeTab">
                    <p-tablist>
                        <p-tab *ngFor="let tab of dialogTabs" [value]="tab.value">{{tab.label}}</p-tab>
                    </p-tablist>
                    <p-tabpanels>
                        <p-tabpanel *ngFor="let tab of dialogTabs" [value]="tab.value">
                            <ng-container [ngSwitch]="tab.value">
                                <ng-container *ngSwitchCase="'basic'"><ng-container *ngTemplateOutlet="basicFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'hero'"><ng-container *ngTemplateOutlet="heroFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'intro'"><ng-container *ngTemplateOutlet="introFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'farmers'"><ng-container *ngTemplateOutlet="farmersFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'qualities'"><ng-container *ngTemplateOutlet="qualitiesFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'portfolio'"><ng-container *ngTemplateOutlet="portfolioFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'heritage'"><ng-container *ngTemplateOutlet="heritageFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'split1'"><ng-container *ngTemplateOutlet="splitFields; context: {section: 'split1'}"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'split2'"><ng-container *ngTemplateOutlet="splitFields; context: {section: 'split2'}"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'split'"><ng-container *ngTemplateOutlet="splitFields; context: {section: 'split'}"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'grid'"><ng-container *ngTemplateOutlet="gridFields; context: {section: 'grid'}"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'projects'"><ng-container *ngTemplateOutlet="projectsFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'process'"><ng-container *ngTemplateOutlet="processFields; context: {section: 'process'}"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'process2'"><ng-container *ngTemplateOutlet="processFields; context: {section: 'process2'}"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'youtube'"><ng-container *ngTemplateOutlet="youtubeFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'training'"><ng-container *ngTemplateOutlet="trainingFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'testimonials'"><ng-container *ngTemplateOutlet="testimonialsFields"></ng-container></ng-container>
                                <ng-container *ngSwitchCase="'cropPortfolio'"><ng-container *ngTemplateOutlet="cropPortfolioFields"></ng-container></ng-container>
                            </ng-container>
                        </p-tabpanel>
                    </p-tabpanels>
                </p-tabs>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveBrand()" [loading]="saving" />
            </ng-template>
        </p-dialog>
    `
})
export class BrandsListPage implements OnInit {
    brands = signal<OurBrand[]>([]);
    resourceName = 'brand';
    dialog = false;
    brand: OurBrand = this.newBrand();
    activeTab = 'basic';
    saving = false;
    mediaBaseUrl = environment.mediaBaseUrl;
    categories = CATEGORIES;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadBrands();
    }

    get content(): any {
        return this.brand.content || {};
    }

    get dialogTabs(): { value: string; label: string }[] {
        const generic = [
            { value: 'basic', label: 'Basic' },
            { value: 'hero', label: 'Hero' },
            { value: 'intro', label: 'Intro' },
            { value: 'farmers', label: 'Farmers' },
            { value: 'qualities', label: 'Qualities' },
            { value: 'portfolio', label: 'Portfolio' },
            { value: 'heritage', label: 'Heritage' },
        ];
        const base = [{ value: 'basic', label: 'Basic' }];
        switch (this.brand.category) {
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
                return generic;
        }
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
        this.activeTab = 'basic';
        this.dialog = true;
    }

    editBrand(b: OurBrand) {
        this.brand = {
            ...b,
            content: { ...getDefaultContent(b.category || 'generic'), ...(b.content || {}) }
        };
        this.activeTab = 'basic';
        this.dialog = true;
    }

    onNameChange(name: string) {
        if (!this.brand.slug) {
            this.brand.slug = slugify(name);
        }
    }

    onCategoryChange(category: string) {
        if (!this.brand.id) {
            this.brand.content = getDefaultContent(category);
        }
    }

    hideDialog() {
        this.dialog = false;
    }

    private getArray(path: string): any[] | undefined {
        const parts = path.split('.');
        let current: any = this.content;
        for (const part of parts) {
            if (current == null) return undefined;
            current = current[part];
        }
        return Array.isArray(current) ? current : undefined;
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

    addObjectItem(path: string, item: any) {
        const arr = this.getArray(path);
        if (arr) {
            arr.push({ ...item });
        }
    }

    removeObjectItem(path: string, index: number) {
        this.getArray(path)?.splice(index, 1);
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
