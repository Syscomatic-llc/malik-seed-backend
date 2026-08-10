import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MalikApiService, OurStoryValue } from '@/app/services/malik-api.service';
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
    selector: 'app-values-page',
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
                    <p-button label="New Value" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="values()" (onRowReorder)="onRowReorder($event)" [rows]="100"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th style="width: 3rem"></th>
                        <th>Order</th>
                        <th>Icon</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item let-i="rowIndex">
                    <tr [pReorderableRow]="i">
                        <td><span class="pi pi-bars" pReorderableRowHandle style="cursor: move"></span></td>
                        <td><span class="font-bold text-primary">{{i + 1}}</span></td>
                        <td><i class="pi pi-{{item.icon}} text-primary text-xl"></i></td>
                        <td>{{item.title}}</td>
                        <td>{{item.description | slice:0:80}}...</td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" 
                                (onClick)="editValue(item)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteValue(item)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialog" [style]="{ width: '500px' }" header="Value Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Title</label>
                        <input type="text" pInputText [(ngModel)]="value.title" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Description</label>
                        <textarea pTextarea [(ngModel)]="value.description" rows="3" fluid></textarea>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Icon (pi-*)</label>
                        <input type="text" pInputText [(ngModel)]="value.icon" placeholder="e.g. heart, star, shield" fluid />
                    </div>
                    <div>
                        <app-image-upload label="Image" folder="our-story"
                            [(currentImage)]="value.image_url" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveValue()" [loading]="saving" />
            </ng-template>
        </p-dialog>
    `
})
export class ValuesPage implements OnInit {
    values = signal<OurStoryValue[]>([]);
    resourceName = 'our-story-value';
    dialog = false;
    value: OurStoryValue = { title: '' };
    saving = false;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadValues();
    }

    loadValues() {
        this.api.getValues().subscribe({
            next: (data) => this.values.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load values' })
        });
    }

    openNew() {
        this.value = { title: '', sort_order: 0 };
        this.dialog = true;
    }

    editValue(v: OurStoryValue) {
        this.value = { ...v };
        this.dialog = true;
    }

    hideDialog() {
        this.dialog = false;
    }

    saveValue() {
        if (!this.value.title?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.', life: 3000 });
            return;
        }
        this.saving = true;
        const data = { ...this.value };
        const request = data.id
            ? this.api.adminUpdate('our-story-value', data.id, data)
            : this.api.adminCreate('our-story-value', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Value saved successfully', life: 3000 });
                this.loadValues();
                this.dialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save value' });
            }
        });
    }

    deleteValue(v: OurStoryValue) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${v.title}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!v.id) return;
                this.api.adminDelete('our-story-value', v.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Value deleted', life: 3000 });
                        this.loadValues();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete value' });
                    }
                });
            }
        });
    }

    onRowReorder(event: any) {
        const order = this.values().map(t => t.id!).filter(id => id !== undefined);
        if (!order.length) return;
        this.api.reorder(this.resourceName, order).subscribe({
            next: () => this.messageService.add({ severity: 'success', summary: 'Reordered', detail: 'Order saved', life: 2000 }),
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to reorder', life: 3000 });
                this.loadValues();
            }
        });
    }
}
