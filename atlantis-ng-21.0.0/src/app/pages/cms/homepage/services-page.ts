import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MalikApiService, HomepageService } from '@/app/services/malik-api.service';
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
    selector: 'app-services-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule, DragDropModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        ConfirmDialogModule, ImageUpload
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New Service" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="services()" (onRowReorder)="onRowReorder($event)" [rows]="100"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th style="width: 3rem"></th>
                        <th>Order</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Link</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-service let-i="rowIndex">
                    <tr [pReorderableRow]="i">
                        <td><span class="pi pi-bars" pReorderableRowHandle style="cursor: move"></span></td>
                        <td><span class="font-bold text-primary">{{i + 1}}</span></td>
                        <td>{{service.title}}</td>
                        <td>{{service.description}}</td>
                        <td>{{service.link}}</td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" 
                                (onClick)="editService(service)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteService(service)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="serviceDialog" [style]="{ width: '550px' }" header="Service Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Title</label>
                        <input type="text" pInputText [(ngModel)]="service.title" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Description</label>
                        <textarea pTextarea [(ngModel)]="service.description" rows="3" fluid></textarea>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Link</label>
                        <input type="text" pInputText [(ngModel)]="service.link" fluid />
                    </div>
                    <div>
                        <app-image-upload label="Service Image" folder="homepage"
                            [(currentImage)]="service.image_url" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveService()" [loading]="saving" />
            </ng-template>
        </p-dialog>
    `
})
export class ServicesPage implements OnInit {
    services = signal<HomepageService[]>([]);
    resourceName = 'homepage-service';
    serviceDialog = false;
    service: HomepageService = { title: '' };
    saving = false;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadServices();
    }

    loadServices() {
        this.api.getServices().subscribe({
            next: (data) => this.services.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load services' })
        });
    }

    openNew() {
        this.service = { title: '', sort_order: 0 };
        this.serviceDialog = true;
    }

    editService(s: HomepageService) {
        this.service = { ...s };
        this.serviceDialog = true;
    }

    hideDialog() {
        this.serviceDialog = false;
    }

    saveService() {
        if (!this.service.title?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.', life: 3000 });
            return;
        }
        this.saving = true;
        const data = { ...this.service };
        const request = data.id
            ? this.api.adminUpdate('homepage-service', data.id, data)
            : this.api.adminCreate('homepage-service', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Service saved successfully', life: 3000 });
                this.loadServices();
                this.serviceDialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save service' });
            }
        });
    }

    deleteService(s: HomepageService) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${s.title}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!s.id) return;
                this.api.adminDelete('homepage-service', s.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Service deleted', life: 3000 });
                        this.loadServices();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete service' });
                    }
                });
            }
        });
    }

    onRowReorder(event: any) {
        const order = this.services().map(t => t.id!).filter(id => id !== undefined);
        if (!order.length) return;
        this.api.reorder(this.resourceName, order).subscribe({
            next: () => this.messageService.add({ severity: 'success', summary: 'Reordered', detail: 'Order saved', life: 2000 }),
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to reorder', life: 3000 });
                this.loadServices();
            }
        });
    }
}
