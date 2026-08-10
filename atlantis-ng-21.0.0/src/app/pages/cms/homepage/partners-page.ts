import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MalikApiService, HomepagePartner } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-partners-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule, DragDropModule,
        DialogModule, InputTextModule, InputNumberModule, ToastModule, ToolbarModule,
        ToggleSwitchModule, TagModule, ConfirmDialogModule, ImageUpload
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New Partner" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="partners()" (onRowReorder)="onRowReorder($event)" [rows]="100"
                [tableStyle]="{ 'min-width': '60rem' }">
                <ng-template #header>
                    <tr>
                        <th style="width: 3rem"></th>
                        <th>Order</th>
                        <th>Logo</th>
                        <th>Name</th>
                        <th>Website</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item let-i="rowIndex">
                    <tr [pReorderableRow]="i">
                        <td><span class="pi pi-bars" pReorderableRowHandle style="cursor: move"></span></td>
                        <td><span class="font-bold text-primary">{{i + 1}}</span></td>
                        <td>
                            <img *ngIf="item.logo_url" [src]="mediaBaseUrl + item.logo_url"
                                alt="{{item.name}}" class="h-12 w-auto object-contain" />
                            <span *ngIf="!item.logo_url" class="text-muted-color">No logo</span>
                        </td>
                        <td>{{item.name}}</td>
                        <td>
                            <a *ngIf="item.website_url && item.website_url !== '#'" [href]="item.website_url" target="_blank" class="text-primary hover:underline">
                                {{item.website_url}}
                            </a>
                            <span *ngIf="!item.website_url || item.website_url === '#'" class="text-muted-color">-</span>
                        </td>
                        <td>
                            <p-tag [value]="item.is_active ? 'Yes' : 'No'"
                                [severity]="item.is_active ? 'success' : 'danger'" />
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

        <p-dialog [(visible)]="dialog" [style]="{ width: '500px' }" header="Development Partner" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Name</label>
                        <input type="text" pInputText [(ngModel)]="item.name" fluid />
                    </div>
                    <div>
                        <app-image-upload label="Logo" folder="partners"
                            [(currentImage)]="item.logo_url" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Website URL</label>
                        <input type="text" pInputText [(ngModel)]="item.website_url" placeholder="https://example.com" fluid />
                    </div>
                    <div class="flex items-center gap-2 pt-2">
                        <label class="font-bold">Active</label>
                        <p-toggleSwitch [(ngModel)]="item.is_active" />
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
export class PartnersPage implements OnInit {
    partners = signal<HomepagePartner[]>([]);
    resourceName = 'homepage-partner';
    dialog = false;
    item: HomepagePartner = { name: '' };
    saving = false;
    mediaBaseUrl = environment.mediaBaseUrl;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadPartners();
    }

    loadPartners() {
        this.api.adminList('homepage-partner').subscribe({
            next: (data) => this.partners.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load partners' })
        });
    }

    openNew() {
        this.item = { name: '', is_active: true, sort_order: 0 };
        this.dialog = true;
    }

    editItem(p: HomepagePartner) {
        this.item = { ...p };
        this.dialog = true;
    }

    hideDialog() {
        this.dialog = false;
    }

    saveItem() {
        if (!this.item.name?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.', life: 3000 });
            return;
        }
        this.saving = true;
        const data = { ...this.item };
        const request = data.id
            ? this.api.adminUpdate('homepage-partner', data.id, data)
            : this.api.adminCreate('homepage-partner', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Partner saved successfully', life: 3000 });
                this.loadPartners();
                this.dialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save partner' });
            }
        });
    }

    deleteItem(p: HomepagePartner) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${p.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!p.id) return;
                this.api.adminDelete('homepage-partner', p.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Partner deleted', life: 3000 });
                        this.loadPartners();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete partner' });
                    }
                });
            }
        });
    }

    onRowReorder(event: any) {
        const order = this.partners().map(t => t.id!).filter(id => id !== undefined);
        if (!order.length) return;
        this.api.reorder(this.resourceName, order).subscribe({
            next: () => this.messageService.add({ severity: 'success', summary: 'Reordered', detail: 'Order saved', life: 2000 }),
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to reorder', life: 3000 });
                this.loadPartners();
            }
        });
    }
}
