import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, HomepageCTABanner } from '@/app/services/malik-api.service';
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

@Component({
    selector: 'app-cta-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        ConfirmDialogModule, ImageUpload
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New CTA Banner" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="ctaBanners()" [rows]="10" [paginator]="true"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>Order</th>
                        <th>Title</th>
                        <th>Subtitle</th>
                        <th>Description</th>
                        <th>CTA</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{item.sort_order}}</td>
                        <td>{{item.title}}</td>
                        <td>{{item.subtitle}}</td>
                        <td>{{item.description | slice:0:60}}...</td>
                        <td>
                            <div class="flex flex-col gap-1">
                                <span class="text-sm">{{item.cta_text}}</span>
                                <span class="text-xs text-muted-color">{{item.cta_link}}</span>
                            </div>
                        </td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" 
                                (onClick)="editItem(item)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteItem(item)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialog" [style]="{ width: '550px' }" header="CTA Banner" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Title</label>
                        <input type="text" pInputText [(ngModel)]="item.title" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Subtitle</label>
                        <input type="text" pInputText [(ngModel)]="item.subtitle" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Description</label>
                        <textarea pTextarea [(ngModel)]="item.description" rows="3" fluid></textarea>
                    </div>
                    <div>
                        <app-image-upload label="Background Image" folder="homepage"
                            [(currentImage)]="item.background_image" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">CTA Text</label>
                            <input type="text" pInputText [(ngModel)]="item.cta_text" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">CTA Link</label>
                            <input type="text" pInputText [(ngModel)]="item.cta_link" fluid />
                        </div>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveItem()" [loading]="saving" />
            </ng-template>
        </p-dialog>
    `
})
export class CTAPage implements OnInit {
    ctaBanners = signal<HomepageCTABanner[]>([]);
    dialog = false;
    item: HomepageCTABanner = { title: '' };
    saving = false;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadCTAs();
    }

    loadCTAs() {
        this.api.getCTABanners().subscribe({
            next: (data) => this.ctaBanners.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load CTA banners' })
        });
    }

    openNew() {
        this.item = { title: '' };
        this.dialog = true;
    }

    editItem(t: HomepageCTABanner) {
        this.item = { ...t };
        this.dialog = true;
    }

    hideDialog() {
        this.dialog = false;
    }

    saveItem() {
        if (!this.item.title?.trim()) return;
        this.saving = true;
        const data = { ...this.item };
        const request = data.id
            ? this.api.adminUpdate('homepage-cta', data.id, data)
            : this.api.adminCreate('homepage-cta', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'CTA banner saved successfully', life: 3000 });
                this.loadCTAs();
                this.dialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save CTA banner' });
            }
        });
    }

    deleteItem(t: HomepageCTABanner) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${t.title}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!t.id) return;
                this.api.adminDelete('homepage-cta', t.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'CTA banner deleted', life: 3000 });
                        this.loadCTAs();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete CTA banner' });
                    }
                });
            }
        });
    }
}
