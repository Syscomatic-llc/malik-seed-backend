import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MalikApiService, OurBrand, BrandContent, BrandQualityCard } from '@/app/services/malik-api.service';
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
import { environment } from '@/environments/environment';
import { slugify } from '@/app/utils/slugify';

const CATEGORIES = [
    { label: "Vegetable Seeds", value: "vegetable_seeds" },
    { label: "Potato Seeds", value: "potato_seeds" },
    { label: "Flower", value: "flower" },
    { label: "Malik's Farms", value: "malik_farms" },
    { label: "Innovation", value: "innovation" },
    { label: "Training", value: "training" },
    { label: "Fresh", value: "fresh" },
    { label: "Planted by Malik", value: "planted_by_malik" },
    { label: "Features", value: "features" },
];

function emptyContent(): BrandContent {
    return {
        hero: { title: '', subtitle: '', background_image: '', scroll_text: 'Scroll to explore' },
        intro: { heading: '', heading_highlight: '', description: '', tags: [] },
        farmers: { badge: 'WITH OUR FARMERS', heading: '', description: '', images: [] },
        qualities: { badge: 'WHAT WE BREED FOR', heading: '', description: '', cards: [] },
        portfolio: { badge: 'SEED PORTFOLIO', heading: '', description: '', tags: [] },
        heritage: { badge: 'OUR HERITAGE', heading: '', description: '', images: [], youtube_url: '' }
    };
}

@Component({
    selector: 'app-brands-list-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        ToggleSwitchModule, TagModule, ConfirmDialogModule, SelectModule, TabsModule,
        ImageUpload, ImageGalleryUpload
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

            <p-table [value]="brands()" (onRowReorder)="onRowReorder($event)" [rows]="100"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th style="width: 3rem"></th>
                        <th>Order</th>
                        <th>Logo</th>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Category</th>
                        <th>Featured</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item let-i="rowIndex">
                    <tr [pReorderableRow]="i">
                        <td><span class="pi pi-bars" pReorderableRowHandle style="cursor: move"></span></td>
                        <td><span class="font-bold text-primary">{{(item.sort_order ?? 0) + 1}}</span></td>
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
                <p-tabs value="basic">
                    <p-tablist>
                        <p-tab value="basic">Basic</p-tab>
                        <p-tab value="hero">Hero</p-tab>
                        <p-tab value="intro">Intro</p-tab>
                        <p-tab value="farmers">Farmers</p-tab>
                        <p-tab value="qualities">Qualities</p-tab>
                        <p-tab value="portfolio">Portfolio</p-tab>
                        <p-tab value="heritage">Heritage</p-tab>
                    </p-tablist>
                    <p-tabpanels>
                        <!-- BASIC -->
                        <p-tabpanel value="basic">
                            <div class="flex flex-col gap-4">
                                <div>
                                    <label class="block font-bold mb-2">Name</label>
                                    <input type="text" pInputText [(ngModel)]="brand.name" (ngModelChange)="onNameChange($event)" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Slug</label>
                                    <input type="text" pInputText [(ngModel)]="brand.slug" placeholder="brand-name" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Category</label>
                                    <p-select [options]="categories" [(ngModel)]="brand.category" optionLabel="label" optionValue="value" placeholder="Select category" fluid appendTo="body" />
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
                        </p-tabpanel>

                        <!-- HERO -->
                        <p-tabpanel value="hero">
                            <div class="flex flex-col gap-4">
                                <div>
                                    <label class="block font-bold mb-2">Hero Title</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.hero!.title" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Hero Subtitle</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.hero!.subtitle" fluid />
                                </div>
                                <div>
                                    <app-image-upload label="Hero Background Image" folder="brands" [(currentImage)]="brand.content!.hero!.background_image" />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Scroll Text</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.hero!.scroll_text" fluid />
                                </div>
                            </div>
                        </p-tabpanel>

                        <!-- INTRO -->
                        <p-tabpanel value="intro">
                            <div class="flex flex-col gap-4">
                                <div>
                                    <label class="block font-bold mb-2">Heading</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.intro!.heading" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Heading Highlight</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.intro!.heading_highlight" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Description</label>
                                    <textarea pTextarea [(ngModel)]="brand.content!.intro!.description" rows="4" fluid></textarea>
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Tags</label>
                                    <div class="flex flex-wrap gap-2 mb-2">
                                        <p-tag *ngFor="let tag of brand.content!.intro!.tags; let i = index" [value]="tag" icon="pi pi-times" (onClick)="removeTag('intro', i)" severity="secondary" class="cursor-pointer" />
                                    </div>
                                    <div class="flex gap-2">
                                        <input type="text" pInputText [(ngModel)]="newIntroTag" placeholder="Add tag" fluid (keydown.enter)="addTag('intro', newIntroTag); newIntroTag = ''" />
                                        <p-button icon="pi pi-plus" (onClick)="addTag('intro', newIntroTag); newIntroTag = ''" />
                                    </div>
                                </div>
                            </div>
                        </p-tabpanel>

                        <!-- FARMERS -->
                        <p-tabpanel value="farmers">
                            <div class="flex flex-col gap-4">
                                <div>
                                    <label class="block font-bold mb-2">Badge</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.farmers!.badge" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Heading</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.farmers!.heading" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Description</label>
                                    <textarea pTextarea [(ngModel)]="brand.content!.farmers!.description" rows="3" fluid></textarea>
                                </div>
                                <div>
                                    <app-image-gallery-upload label="Farmers Images" folder="brands" [(images)]="brand.content!.farmers!.images!" />
                                </div>
                            </div>
                        </p-tabpanel>

                        <!-- QUALITIES -->
                        <p-tabpanel value="qualities">
                            <div class="flex flex-col gap-4">
                                <div>
                                    <label class="block font-bold mb-2">Badge</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.qualities!.badge" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Heading</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.qualities!.heading" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Description</label>
                                    <textarea pTextarea [(ngModel)]="brand.content!.qualities!.description" rows="3" fluid></textarea>
                                </div>
                                <div>
                                    <div class="flex items-center justify-between mb-2">
                                        <label class="block font-bold">Quality Cards</label>
                                        <p-button label="Add Card" icon="pi pi-plus" (onClick)="addQualityCard()" />
                                    </div>
                                    <div class="flex flex-col gap-3">
                                        <p-card *ngFor="let card of brand.content!.qualities!.cards; let i = index">
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
                                                    <p-button icon="pi pi-trash" severity="danger" text (onClick)="removeQualityCard(i)" />
                                                </div>
                                            </div>
                                        </p-card>
                                    </div>
                                </div>
                            </div>
                        </p-tabpanel>

                        <!-- PORTFOLIO -->
                        <p-tabpanel value="portfolio">
                            <div class="flex flex-col gap-4">
                                <div>
                                    <label class="block font-bold mb-2">Badge</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.portfolio!.badge" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Heading</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.portfolio!.heading" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Description</label>
                                    <textarea pTextarea [(ngModel)]="brand.content!.portfolio!.description" rows="3" fluid></textarea>
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Portfolio Tags</label>
                                    <div class="flex flex-wrap gap-2 mb-2">
                                        <p-tag *ngFor="let tag of brand.content!.portfolio!.tags; let i = index" [value]="tag" icon="pi pi-times" (onClick)="removeTag('portfolio', i)" severity="secondary" class="cursor-pointer" />
                                    </div>
                                    <div class="flex gap-2">
                                        <input type="text" pInputText [(ngModel)]="newPortfolioTag" placeholder="Add tag" fluid (keydown.enter)="addTag('portfolio', newPortfolioTag); newPortfolioTag = ''" />
                                        <p-button icon="pi pi-plus" (onClick)="addTag('portfolio', newPortfolioTag); newPortfolioTag = ''" />
                                    </div>
                                </div>
                            </div>
                        </p-tabpanel>

                        <!-- HERITAGE -->
                        <p-tabpanel value="heritage">
                            <div class="flex flex-col gap-4">
                                <div>
                                    <label class="block font-bold mb-2">Badge</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.heritage!.badge" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Heading</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.heritage!.heading" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">Description</label>
                                    <textarea pTextarea [(ngModel)]="brand.content!.heritage!.description" rows="3" fluid></textarea>
                                </div>
                                <div>
                                    <app-image-gallery-upload label="Heritage Images" folder="brands" [(images)]="brand.content!.heritage!.images!" />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2">YouTube URL</label>
                                    <input type="text" pInputText [(ngModel)]="brand.content!.heritage!.youtube_url" fluid />
                                </div>
                            </div>
                        </p-tabpanel>
                    </p-tabpanels>
                </p-tabs>
            </ng-template>
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
    saving = false;
    mediaBaseUrl = environment.mediaBaseUrl;
    categories = CATEGORIES;
    newIntroTag = '';
    newPortfolioTag = '';

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
            content: emptyContent()
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
        this.dialog = true;
    }

    editBrand(b: OurBrand) {
        this.brand = {
            ...b,
            content: b.content ? { ...emptyContent(), ...b.content } : emptyContent()
        };
        this.dialog = true;
    }

    onNameChange(name: string) {
        if (!this.brand.slug) {
            this.brand.slug = slugify(name);
        }
    }

    hideDialog() {
        this.dialog = false;
    }

    addTag(section: 'intro' | 'portfolio', value: string) {
        const trimmed = value?.trim();
        if (!trimmed) return;
        const sectionObj = section === 'intro' ? this.brand.content!.intro! : this.brand.content!.portfolio!;
        if (!sectionObj.tags) {
            sectionObj.tags = [];
        }
        if (!sectionObj.tags.includes(trimmed)) {
            sectionObj.tags.push(trimmed);
        }
    }

    removeTag(section: 'intro' | 'portfolio', index: number) {
        const sectionObj = section === 'intro' ? this.brand.content!.intro! : this.brand.content!.portfolio!;
        if (sectionObj.tags) {
            sectionObj.tags.splice(index, 1);
        }
    }

    addQualityCard() {
        const cards = this.brand.content!.qualities!.cards || [];
        cards.push({ number: cards.length + 1, title: '', description: '' });
    }

    removeQualityCard(index: number) {
        this.brand.content!.qualities!.cards!.splice(index, 1);
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

    onRowReorder(event: any) {
        const order = this.brands().map(t => t.id!).filter(id => id !== undefined);
        if (!order.length) return;
        this.api.reorder(this.resourceName, order).subscribe({
            next: () => this.messageService.add({ severity: 'success', summary: 'Reordered', detail: 'Order saved', life: 2000 }),
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to reorder', life: 3000 });
                this.loadBrands();
            }
        });
    }
}
