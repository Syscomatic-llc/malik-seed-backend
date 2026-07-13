import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, OurBrand } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
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
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { environment } from '@/environments/environment';
import { slugify } from '@/app/utils/slugify';


@Component({
    selector: 'app-brands-list-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        ToggleSwitchModule, TagModule, SelectModule, ConfirmDialogModule, ImageUpload
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New Brand" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="brands()" [rows]="10" [paginator]="true"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>ID</th>
                        <th>Logo</th>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Category</th>
                        <th>Tagline</th>
                        <th>Featured</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{item.id}}</td>
                        <td>
                            <img *ngIf="item.logo_url" [src]="mediaBaseUrl + item.logo_url"
                                alt="{{item.name}}" class="w-12 h-12 object-contain rounded" />
                            <span *ngIf="!item.logo_url" class="text-muted-color">No logo</span>
                        </td>
                        <td>{{item.name}}</td>
                        <td>{{item.slug}}</td>
                        <td><p-tag [value]="item.category" severity="info" /></td>
                        <td>{{item.tagline}}</td>
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

        <p-dialog [(visible)]="dialog" [style]="{ width: '600px' }" header="Brand Details" [modal]="true">
            <ng-template #content>
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
                        <p-select [options]="categories()" [(ngModel)]="brand.category"
                            optionLabel="label" optionValue="value" placeholder="Select Category" fluid appendTo="body" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Tagline</label>
                        <input type="text" pInputText [(ngModel)]="brand.tagline" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Description</label>
                        <textarea pTextarea [(ngModel)]="brand.description" rows="3" fluid></textarea>
                    </div>
                    <div>
                        <app-image-upload label="Logo" folder="brands"
                            [(currentImage)]="brand.logo_url" />
                    </div>
                    <div>
                        <app-image-upload label="Hero Image" folder="brands"
                            [(currentImage)]="brand.image_url" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Featured</label>
                        <p-toggleSwitch [(ngModel)]="brand.is_featured" />
                    </div>
                </div>
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
    dialog = false;
    brand: OurBrand = { name: '', slug: '', category: '' };
    saving = false;
    mediaBaseUrl = environment.mediaBaseUrl;
    categories = signal<{ label: string; value: string }[]>([]);

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadBrands();
        this.loadCategories();
    }

    loadCategories() {
        this.api.getBrandCategories().subscribe({
            next: (data) => this.categories.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' })
        });
    }

    loadBrands() {
        this.api.getBrands().subscribe({
            next: (data) => this.brands.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load brands' })
        });
    }

    openNew() {
        this.brand = { name: '', slug: '', category: '', is_featured: false, sort_order: 0 };
        this.dialog = true;
    }

    editBrand(b: OurBrand) {
        this.brand = { ...b };
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

    saveBrand() {
        if (!this.brand.name?.trim() || !this.brand.slug?.trim() || !this.brand.category) return;
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
