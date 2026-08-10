import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MalikApiService, JobPosition } from '@/app/services/malik-api.service';
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
import { EditorModule } from 'primeng/editor';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { slugify } from '@/app/utils/slugify';
import { environment } from '@/environments/environment';

const DEPARTMENTS = [
    { label: 'Sales', value: 'sales' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Operations', value: 'operations' },
    { label: 'Research', value: 'research' },
    { label: 'Finance', value: 'finance' },
    { label: 'HR', value: 'hr' },
    { label: 'IT', value: 'it' },
    { label: 'Field', value: 'field' },
    { label: 'Logistics', value: 'logistics' },
    { label: 'Production', value: 'production' }
];

const JOB_TYPES = [
    { label: 'Full Time', value: 'full_time' },
    { label: 'Part Time', value: 'part_time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Internship', value: 'internship' }
];

const LOCATIONS = [
    { label: 'Dhaka', value: 'dhaka' },
    { label: 'Chittagong', value: 'chittagong' },
    { label: 'Rajshahi', value: 'rajshahi' },
    { label: 'Khulna', value: 'khulna' },
    { label: 'Sylhet', value: 'sylhet' },
    { label: 'Barisal', value: 'barisal' },
    { label: 'Rangpur', value: 'rangpur' },
    { label: 'Remote', value: 'remote' }
];

@Component({
    selector: 'app-positions-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        ToggleSwitchModule, TagModule, SelectModule, EditorModule, ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New Position" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="positions()" [rows]="10" [paginator]="true"
                (onRowReorder)="onRowReorder($event)"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th style="width: 3rem"></th>
                        <th>Order</th>
                        <th>Title</th>
                        <th>Department</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Experience</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item let-i="rowIndex">
                    <tr [pReorderableRow]="i">
                        <td><span class="pi pi-bars" pReorderableRowHandle style="cursor: move"></span></td>
                        <td><span class="font-bold text-primary">{{i + 1}}</span></td>
                        <td>{{item.title}}</td>
                        <td>{{item.department}}</td>
                        <td><p-tag [value]="item.job_type" severity="info" /></td>
                        <td>{{item.location}}</td>
                        <td>{{item.experience_required}}</td>
                        <td>
                            <p-tag [value]="item.is_active ? 'Yes' : 'No'" 
                                [severity]="item.is_active ? 'success' : 'danger'" />
                        </td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" 
                                (onClick)="editPosition(item)" />
                            <p-button icon="pi pi-trash" severity="danger" class="mr-2" [rounded]="true" [outlined]="true"
                                (onClick)="deletePosition(item)" />
                            <p-button icon="pi pi-question-circle" severity="secondary" [rounded]="true" [outlined]="true"
                                [routerLink]="['/cms/hiring/assessment', item.id]" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialog" [style]="{ width: '650px' }" header="Job Position" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Title *</label>
                        <input type="text" pInputText [(ngModel)]="position.title" (ngModelChange)="onTitleChange($event)" fluid />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">Slug *</label>
                            <input type="text" pInputText [(ngModel)]="position.slug" placeholder="e.g. it-head" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Department *</label>
                            <p-select [options]="departments" [(ngModel)]="position.department"
                                optionLabel="label" optionValue="value" placeholder="Select" fluid appendTo="body" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">Job Type *</label>
                            <p-select [options]="jobTypes" [(ngModel)]="position.job_type"
                                optionLabel="label" optionValue="value" placeholder="Select" fluid appendTo="body" />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Location *</label>
                            <p-select [options]="locations" [(ngModel)]="position.location"
                                optionLabel="label" optionValue="value" placeholder="Select" fluid appendTo="body" />
                        </div>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Short Description</label>
                        <textarea pTextarea [(ngModel)]="position.short_description" rows="2" fluid></textarea>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Full Description *</label>
                        <p-editor [(ngModel)]="position.description" [style]="{height: '200px'}"></p-editor>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Experience Required</label>
                        <input type="text" pInputText [(ngModel)]="position.experience_required" placeholder="e.g. 2-3 years" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Job Details PDF</label>
                        <div *ngIf="position.details_pdf_url" class="flex items-center gap-2 mb-2">
                            <a [href]="mediaBaseUrl + position.details_pdf_url" target="_blank" class="text-primary hover:underline">
                                <i class="pi pi-file-pdf mr-1"></i>View PDF
                            </a>
                            <p-button icon="pi pi-times" severity="danger" [text]="true" (onClick)="position.details_pdf_url = ''" />
                        </div>
                        <input type="file" accept=".pdf,.doc,.docx" (change)="onPdfSelected($event)" class="block w-full text-sm text-surface-600" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Active</label>
                        <p-toggleSwitch [(ngModel)]="position.is_active" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="savePosition()" [loading]="saving" />
            </ng-template>
        </p-dialog>
    `
})
export class PositionsPage implements OnInit {
    positions = signal<JobPosition[]>([]);
    dialog = false;
    position: JobPosition = { title: '', slug: '', department: '', job_type: '', location: '', description: '' };
    saving = false;
    uploadingPdf = false;
    mediaBaseUrl = environment.mediaBaseUrl;
    departments = DEPARTMENTS;
    jobTypes = JOB_TYPES;
    locations = LOCATIONS;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadPositions();
    }

    loadPositions() {
        this.api.getJobPositions().subscribe({
            next: (data) => this.positions.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load positions' })
        });
    }

    openNew() {
        this.position = { title: '', slug: '', department: '', job_type: '', location: '', description: '', is_active: true };
        this.dialog = true;
    }

    editPosition(p: JobPosition) {
        this.position = { ...p };
        this.dialog = true;
    }

    onTitleChange(title: string) {
        if (!this.position.slug) {
            this.position.slug = slugify(title);
        }
    }

    hideDialog() {
        this.dialog = false;
    }

    onPdfSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        const file = input.files[0];
        this.uploadingPdf = true;
        this.api.uploadFile(file, 'positions').subscribe({
            next: (res) => {
                this.position.details_pdf_url = res.url;
                this.uploadingPdf = false;
                this.messageService.add({ severity: 'success', summary: 'Uploaded', detail: 'PDF uploaded successfully' });
            },
            error: () => {
                this.uploadingPdf = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload PDF' });
            }
        });
    }

    savePosition() {
        const p = this.position;
        if (!p.title?.trim() || !p.slug?.trim() || !p.department || !p.job_type || !p.location || !p.description?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill Title, Slug, Department, Job Type, Location, and Full Description.', life: 5000 });
            return;
        }

        this.saving = true;
        const data: JobPosition = {
            ...p,
            description: p.description.trim(),
            is_active: !!p.is_active
        };

        const request = data.id
            ? this.api.adminUpdate('job-position', data.id, data)
            : this.api.adminCreate('job-position', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Position saved successfully', life: 3000 });
                this.loadPositions();
                this.dialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save position', life: 5000 });
            }
        });
    }

    deletePosition(p: JobPosition) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${p.title}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!p.id) return;
                this.api.adminDelete('job-position', p.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Position deleted', life: 3000 });
                        this.loadPositions();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete position' });
                    }
                });
            }
        });
    }

    onRowReorder(event: any) {
        const order = this.positions().map(p => p.id!).filter(id => id !== undefined);
        if (!order.length) return;
        this.api.reorderJobPositions(order).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Reordered', detail: 'Job positions order saved', life: 3000 });
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save order' });
                this.loadPositions();
            }
        });
    }
}
