import { Component, OnInit, signal, Input, Output, EventEmitter } from '@angular/core';
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

const DEFAULT_DEPARTMENTS = ['Sales', 'Marketing', 'Operations', 'Research', 'Finance', 'HR', 'IT', 'Field', 'Logistics', 'Production'];
const DEFAULT_JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship'];
const DEFAULT_LOCATIONS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Remote'];

function capitalizeWords(str?: string): string {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function toSlug(str: string): string {
    return str.toLowerCase().trim().replace(/\s+/g, '_');
}

@Component({
    selector: 'app-positions-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        ToggleSwitchModule, TagModule, SelectModule, EditorModule, ConfirmDialogModule,
        EditableSelectComponent
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
                        <th>Team</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Experience</th>
                        <th>Publish</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item let-i="rowIndex">
                    <tr [pReorderableRow]="i">
                        <td><span class="pi pi-bars" pReorderableRowHandle style="cursor: move"></span></td>
                        <td><span class="font-bold text-primary">{{i + 1}}</span></td>
                        <td>{{item.title}}</td>
                        <td>{{capitalizeWords(item.department)}}</td>
                        <td><p-tag [value]="capitalizeWords(item.job_type)" severity="info" /></td>
                        <td>{{capitalizeWords(item.location)}}</td>
                        <td>{{item.experience_required}}</td>
                        <td>
                            <p-tag [value]="item.is_published ? 'Published' : 'Unpublished'"
                                [severity]="item.is_published ? 'success' : 'danger'" />
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
                            <label class="block font-bold mb-2">Team *</label>
                            <app-editable-select
                                [options]="departments()"
                                [(ngModel)]="position.department"
                                placeholder="Select or type team name" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">Job Type *</label>
                            <app-editable-select
                                [options]="jobTypes()"
                                [(ngModel)]="position.job_type"
                                placeholder="Select or type job type" />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Location *</label>
                            <app-editable-select
                                [options]="locations()"
                                [(ngModel)]="position.location"
                                placeholder="Select or type location" />
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
                        <label class="block font-bold mb-2">Salary Range</label>
                        <input type="text" pInputText [(ngModel)]="position.salary_range" placeholder="e.g. 50,000 - 80,000 BDT" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Job Details PDF</label>
                        <div *ngIf="position.details_pdf_url" class="flex items-center gap-2 mb-2">
                            <a [href]="mediaBaseUrl + position.details_pdf_url" target="_blank" class="text-primary hover:underline">
                                <i class="pi pi-file-pdf mr-1"></i>View PDF
                            </a>
                            <p-button icon="pi pi-times" severity="danger" [text]="true" (onClick)="position.details_pdf_url = ''" />
                        </div>
                        <p-button label="Upload PDF" icon="pi pi-upload" severity="secondary" (onClick)="fileInput.click()" />
                        <input #fileInput type="file" accept=".pdf,.doc,.docx" (change)="onPdfSelected($event)" class="hidden" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Publish</label>
                        <p-toggleSwitch [(ngModel)]="position.is_published" />
                        <span class="ml-2 text-sm text-muted-color">{{position.is_published ? 'Published' : 'Unpublished'}}</span>
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
    departments = signal<string[]>(DEFAULT_DEPARTMENTS);
    jobTypes = signal<string[]>(DEFAULT_JOB_TYPES);
    locations = signal<string[]>(DEFAULT_LOCATIONS);

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadPositions();
        this.loadDropdownOptions();
    }

    loadPositions() {
        this.api.adminList('job-position').subscribe({
            next: (data) => this.positions.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load positions' })
        });
    }

    loadDropdownOptions() {
        this.api.getDropdownOptions().subscribe({
            next: (opts) => {
                this.departments.set([...new Set([...DEFAULT_DEPARTMENTS, ...opts.departments.map(capitalizeWords)])]);
                this.jobTypes.set([...new Set([...DEFAULT_JOB_TYPES, ...opts.job_types.map(capitalizeWords)])]);
                this.locations.set([...new Set([...DEFAULT_LOCATIONS, ...opts.locations.map(capitalizeWords)])]);
            },
            error: () => {
                // Silently fail - defaults are already set
            }
        });
    }

    openNew() {
        this.position = { title: '', slug: '', department: '', job_type: '', location: '', description: '', is_published: true };
        this.dialog = true;
    }

    editPosition(p: JobPosition) {
        this.position = { ...p };
        this.dialog = true;
    }

    onTitleChange(title: string) {
        if (!this.position.slug || this.position.slug === slugify(this.position.title || '')) {
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
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill Title, Slug, Team, Job Type, Location, and Full Description.', life: 5000 });
            return;
        }

        this.saving = true;
        const data: JobPosition = {
            ...p,
            department: toSlug(p.department),
            job_type: toSlug(p.job_type),
            location: toSlug(p.location),
            description: p.description.trim(),
            is_published: !!p.is_published
        };

        const request = data.id
            ? this.api.adminUpdate('job-position', data.id, data)
            : this.api.adminCreate('job-position', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Position saved successfully', life: 3000 });
                this.loadPositions();
                this.loadDropdownOptions();
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

    capitalizeWords(str?: string): string {
        return capitalizeWords(str);
    }
}

// ====== Editable Select Component ======
@Component({
    selector: 'app-editable-select',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
    template: `
        <div class="relative">
            <div class="flex gap-1">
                <input
                    type="text"
                    pInputText
                    [(ngModel)]="displayValue"
                    (ngModelChange)="onInputChange($event)"
                    [placeholder]="_placeholderText"
                    class="w-full"
                    (focus)="showDropdown = true"
                    (blur)="onBlur()" />
                <p-button
                    icon="pi pi-chevron-down"
                    severity="secondary"
                    [text]="true"
                    (onClick)="toggleDropdown()" />
            </div>
            <div *ngIf="showDropdown" class="absolute z-50 w-full mt-1 bg-surface-0 border border-surface-200 rounded shadow-lg max-h-48 overflow-y-auto">
                <div
                    *ngFor="let opt of filteredOptions()"
                    class="px-3 py-2 cursor-pointer hover:bg-surface-100 text-sm"
                    (mousedown)="selectOption(opt)">
                    {{opt}}
                </div>
                <div *ngIf="displayValue && !filteredOptions().includes(displayValue)"
                    class="px-3 py-2 cursor-pointer hover:bg-primary-50 text-sm text-primary font-semibold border-t border-surface-200"
                    (mousedown)="addNewOption(displayValue)">
                    <i class="pi pi-plus mr-1"></i> Add "{{displayValue}}"
                </div>
                <div *ngIf="filteredOptions().length === 0 && !displayValue" class="px-3 py-2 text-sm text-muted-color">
                    No options
                </div>
            </div>
        </div>
    `
})
export class EditableSelectComponent {
    _options = signal<string[]>([]);
    displayValue = '';
    showDropdown = false;
    _placeholderText = 'Select or type...';
    private _value = '';

    filteredOptions = signal<string[]>([]);

    ngOnInit() {
        this.filteredOptions.set(this._options());
    }

    @Input() set options(val: string[]) {
        this._options.set(val || []);
        this.filteredOptions.set(val || []);
    }

    @Input() set ngModel(val: string) {
        this._value = val || '';
        this.displayValue = capitalizeWords(val);
    }

    placeholderText = 'Select or type...';

    @Input() set placeholder(val: string) {
        this._placeholderText = val || 'Select or type...';
    }

    @Output() ngModelChange = new EventEmitter<string>();

    onInputChange(value: string) {
        this.displayValue = value;
        this._value = toSlug(value);
        this.ngModelChange.emit(this._value);
        this.filterOptions(value);
        this.showDropdown = true;
    }

    filterOptions(search: string) {
        if (!search) {
            this.filteredOptions.set(this._options());
            return;
        }
        const lower = search.toLowerCase();
        this.filteredOptions.set(this._options().filter(o => o.toLowerCase().includes(lower)));
    }

    selectOption(option: string) {
        this.displayValue = option;
        this._value = toSlug(option);
        this.ngModelChange.emit(this._value);
        this.showDropdown = false;
    }

    addNewOption(value: string) {
        const newOption = value.trim();
        if (newOption && !this._options().includes(newOption)) {
            this._options.set([...this._options(), newOption]);
        }
        this.selectOption(newOption);
    }

    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
        if (this.showDropdown) {
            this.filteredOptions.set(this._options());
        }
    }

    onBlur() {
        setTimeout(() => {
            this.showDropdown = false;
        }, 200);
    }
}
