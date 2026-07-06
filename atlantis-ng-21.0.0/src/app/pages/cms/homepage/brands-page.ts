import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, HomepageBrand } from '@/app/services/malik-api.service';
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'app-brands-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        ConfirmDialogModule, SelectModule, ImageUpload
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
                        <th>Description</th>
                        <th>Link</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-brand>
                    <tr>
                        <td>{{brand.id}}</td>
                        <td>
                            <img *ngIf="brand.logo_url" [src]="'http://localhost:8000/' + brand.logo_url" 
                                alt="{{brand.name}}" class="w-16 h-16 object-contain rounded" />
                            <span *ngIf="!brand.logo_url" class="text-muted-color">No logo</span>
                        </td>
                        <td>{{brand.name}}</td>
                        <td>{{brand.slug}}</td>
                        <td>
                            <span class="px-2 py-1 rounded-full text-xs font-semibold"
                                [ngClass]="brand.category === 'premium' ? 'bg-primary/10 text-primary' : 'bg-surface-200 text-surface-700'">
                                {{brand.category}}
                            </span>
                        </td>
                        <td>{{brand.description}}</td>
                        <td>{{brand.link}}</td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" 
                                (onClick)="editBrand(brand)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteBrand(brand)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="brandDialog" [style]="{ width: '500px' }" header="Brand Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Name</label>
                        <input type="text" pInputText [(ngModel)]="brand.name" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Description</label>
                        <textarea pTextarea [(ngModel)]="brand.description" rows="3" fluid></textarea>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Category</label>
                        <p-select [options]="categories()" [(ngModel)]="brand.category"
                            optionLabel="label" optionValue="value"
                            placeholder="Select Category" fluid appendTo="body" />
                    </div>
                    <div>
                        <app-image-upload label="Logo" folder="homepage"
                            [(currentImage)]="brand.logo_url" />
                    </div>
                    <div>
                        <app-image-upload label="Image" folder="homepage"
                            [(currentImage)]="brand.image_url" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Link</label>
                        <input type="text" pInputText [(ngModel)]="brand.link" fluid />
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
export class BrandsPage implements OnInit {
    brands = signal<HomepageBrand[]>([]);
    categories = signal<{ label: string; value: string }[]>([]);
    brandDialog = false;
    brand: HomepageBrand = { name: '', slug: '' };
    saving = false;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadBrands();
    }

    loadBrands() {
        this.api.getHomepageBrands().subscribe({
            next: (data) => {
                this.brands.set(data);
                const catValues = Array.from(new Set(data.map(b => b.category).filter((c): c is string => !!c)));
                const defaults = ['General', 'Premium', 'Standard', 'Featured'];
                const all = Array.from(new Set([...defaults, ...catValues]));
                this.categories.set(all.map(c => ({ label: c, value: c })));
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load brands' })
        });
    }

    openNew() {
        this.brand = { name: '', slug: '', category: '', sort_order: 0 };
        this.brandDialog = true;
    }

    editBrand(b: HomepageBrand) {
        this.brand = { ...b };
        this.brandDialog = true;
    }

    hideDialog() {
        this.brandDialog = false;
    }

    saveBrand() {
        if (!this.brand.name?.trim() || !this.brand.slug?.trim()) return;
        this.saving = true;
        const data = { ...this.brand };
        const request = data.id
            ? this.api.adminUpdate('homepage-brand', data.id, data)
            : this.api.adminCreate('homepage-brand', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Brand saved successfully', life: 3000 });
                this.loadBrands();
                this.brandDialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save brand' });
            }
        });
    }

    deleteBrand(b: HomepageBrand) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${b.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!b.id) return;
                this.api.adminDelete('homepage-brand', b.id).subscribe({
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
