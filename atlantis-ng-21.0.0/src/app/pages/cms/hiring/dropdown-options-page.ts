import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MalikApiService } from '@/app/services/malik-api.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

interface DropdownOption {
    id: number;
    option_type: 'department' | 'job_type' | 'location';
    value: string;
    label: string;
    sort_order: number;
    is_active: boolean;
}

const OPTION_TYPES = [
    { label: 'Team (Department)', value: 'department' },
    { label: 'Job Type', value: 'job_type' },
    { label: 'Location', value: 'location' }
];

@Component({
    selector: 'app-dropdown-options-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, SelectModule, ToastModule, ToolbarModule,
        ConfirmDialogModule, TagModule, ToggleSwitchModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <h5 class="m-0 mr-4">Manage Dropdown Options</h5>
                    <p-select [options]="optionTypes" [(ngModel)]="selectedType"
                        (ngModelChange)="loadOptions()"
                        optionLabel="label" optionValue="value"
                        placeholder="Select Type" styleClass="w-48" />
                </ng-template>
                <ng-template #end>
                    <p-button label="New Option" icon="pi pi-plus" severity="success" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-card>
                <p class="text-muted-color mb-4">
                    Manage Team, Job Type, and Location options used in job positions.
                    Drag rows to reorder. Inactive options are hidden from the job position form.
                </p>

                <p-table [value]="options()" [rows]="20" [paginator]="options().length > 20"
                    (onRowReorder)="onRowReorder($event)"
                    [tableStyle]="{ 'min-width': '50rem' }" [loading]="loading()">
                    <ng-template #header>
                        <tr>
                            <th style="width: 3rem"></th>
                            <th>Order</th>
                            <th>Label</th>
                            <th>Value</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-item let-i="rowIndex">
                        <tr [pReorderableRow]="i">
                            <td><span class="pi pi-bars" pReorderableRowHandle style="cursor: move"></span></td>
                            <td><span class="font-bold text-primary">{{i + 1}}</span></td>
                            <td>{{item.label}}</td>
                            <td><code class="text-sm text-muted-color">{{item.value}}</code></td>
                            <td>
                                <p-tag [value]="item.is_active ? 'Active' : 'Inactive'"
                                    [severity]="item.is_active ? 'success' : 'danger'" />
                            </td>
                            <td>
                                <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true"
                                    (onClick)="editOption(item)" />
                                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                    (onClick)="deleteOption(item)" />
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="6" class="text-center text-muted-color py-4">No options found for this type</td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>

        <p-dialog [(visible)]="dialog" [style]="{ width: '450px' }" [header]="editing ? 'Edit Option' : 'New Option'" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Type *</label>
                        <p-select [options]="optionTypes" [(ngModel)]="option.option_type"
                            optionLabel="label" optionValue="value" placeholder="Select Type" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Label *</label>
                        <input type="text" pInputText [(ngModel)]="option.label" placeholder="e.g. Sales" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Active</label>
                        <p-toggleSwitch [(ngModel)]="option.is_active" />
                        <span class="ml-2 text-sm text-muted-color">{{option.is_active ? 'Active' : 'Inactive'}}</span>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveOption()" [loading]="saving" />
            </ng-template>
        </p-dialog>
    `
})
export class DropdownOptionsPage implements OnInit {
    options = signal<DropdownOption[]>([]);
    loading = signal(false);
    saving = false;
    dialog = false;
    editing = false;
    selectedType: 'department' | 'job_type' | 'location' = 'department';
    optionTypes = OPTION_TYPES;

    option: Partial<DropdownOption> = {
        option_type: 'department',
        label: '',
        is_active: true
    };

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadOptions();
    }

    loadOptions() {
        this.loading.set(true);
        this.api.getAllDropdownOptions(this.selectedType).subscribe({
            next: (data) => {
                this.options.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load options' });
            }
        });
    }

    openNew() {
        this.option = { option_type: this.selectedType, label: '', is_active: true };
        this.editing = false;
        this.dialog = true;
    }

    editOption(item: DropdownOption) {
        this.option = { ...item };
        this.editing = true;
        this.dialog = true;
    }

    hideDialog() {
        this.dialog = false;
    }

    saveOption() {
        const label = (this.option.label || '').trim();
        if (!label) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Label is required' });
            return;
        }
        if (!this.option.option_type) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Type is required' });
            return;
        }

        this.saving = true;
        const data = {
            option_type: this.option.option_type,
            label: label,
            is_active: !!this.option.is_active
        };

        const request = this.editing && this.option.id
            ? this.api.updateDropdownOption(this.option.id, data)
            : this.api.createDropdownOption(data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Option saved successfully', life: 3000 });
                this.loadOptions();
                this.dialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                const detail = err?.error?.detail || 'Failed to save option';
                this.messageService.add({ severity: 'error', summary: 'Error', detail });
            }
        });
    }

    deleteOption(item: DropdownOption) {
        this.confirmationService.confirm({
            message: `Delete "${item.label}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.api.deleteDropdownOption(item.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Option deleted', life: 3000 });
                        this.loadOptions();
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete option' })
                });
            }
        });
    }

    onRowReorder(event: any) {
        const order = this.options().map(o => o.id);
        this.api.reorderDropdownOptions(this.selectedType, order).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Reordered', detail: 'Order saved', life: 3000 });
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save order' });
                this.loadOptions();
            }
        });
    }
}
