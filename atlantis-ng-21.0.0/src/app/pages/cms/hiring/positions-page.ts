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
import { TabsModule } from 'primeng/tabs';
import { ConfirmationService } from 'primeng/api';
import { slugify } from '@/app/utils/slugify';
import { environment } from '@/environments/environment';

const DEFAULT_DEPARTMENTS: { label: string; value: string }[] = [
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

const DEFAULT_JOB_TYPES: { label: string; value: string }[] = [
    { label: 'Full Time', value: 'full_time' },
    { label: 'Part Time', value: 'part_time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Internship', value: 'internship' }
];

const DEFAULT_LOCATIONS: { label: string; value: string }[] = [
    { label: 'Dhaka', value: 'dhaka' },
    { label: 'Chittagong', value: 'chittagong' },
    { label: 'Rajshahi', value: 'rajshahi' },
    { label: 'Khulna', value: 'khulna' },
    { label: 'Sylhet', value: 'sylhet' },
    { label: 'Barisal', value: 'barisal' },
    { label: 'Rangpur', value: 'rangpur' },
    { label: 'Remote', value: 'remote' }
];

function capitalizeWords(str?: string): string {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function toSlug(str: string): string {
    return str.toLowerCase().trim().replace(/\s+/g, '_');
}

interface DropdownOption {
    id?: number;
    option_type: 'department' | 'job_type' | 'location';
    label: string;
    value: string;
    sort_order?: number;
    is_active?: boolean;
}

@Component({
    selector: 'app-positions-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        ToggleSwitchModule, TagModule, SelectModule, EditorModule, ConfirmDialogModule,
        TabsModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New Position" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                    <p-button label="Manage Lists" icon="pi pi-cog" severity="secondary" (onClick)="openConfigDialog()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="positions()" [rows]="10" [paginator]="true"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>Order</th>
                        <th>Title</th>
                        <th>Team</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Experience</th>
                        <th>Salary</th>
                        <th>Publish</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item let-i="rowIndex">
                    <tr>
                        <td><span class="font-bold text-primary">{{i + 1}}</span></td>
                        <td>{{item.title}}</td>
                        <td>{{capitalizeWords(item.department)}}</td>
                        <td><p-tag [value]="capitalizeWords(item.job_type)" severity="info" /></td>
                        <td>{{capitalizeWords(item.location)}}</td>
                        <td>{{item.experience_required}}</td>
                        <td>{{item.salary_range || '-'}}</td>
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
                            <input type="text" pInputText [(ngModel)]="position.slug" placeholder="auto-generated from title" [disabled]="true" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Team *</label>
                            <p-select [options]="departments()" [(ngModel)]="position.department"
                                optionLabel="label" optionValue="value"
                                placeholder="Select team" fluid appendTo="body" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">Job Type *</label>
                            <p-select [options]="jobTypes()" [(ngModel)]="position.job_type"
                                optionLabel="label" optionValue="value"
                                placeholder="Select job type" fluid appendTo="body" />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Location *</label>
                            <p-select [options]="locations()" [(ngModel)]="position.location"
                                optionLabel="label" optionValue="value"
                                placeholder="Select location" fluid appendTo="body" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">Experience Required</label>
                            <input type="text" pInputText [(ngModel)]="position.experience_required" placeholder="e.g. 2-3 years" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Salary Range</label>
                            <input type="text" pInputText [(ngModel)]="position.salary_range" placeholder="e.g. 50,000 - 80,000 BDT" fluid />
                        </div>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Short Description</label>
                        <textarea pTextarea [(ngModel)]="position.short_description" rows="2" fluid></textarea>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Full Description *</label>
                        <p-editor [(ngModel)]="position.description" [style]="{height: '200px'}" (onBlur)="cleanDescriptionBullets()"></p-editor>
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

        <p-dialog [(visible)]="configDialog" [style]="{ width: '700px' }" header="Manage Job Lists" [modal]="true">
            <ng-template #content>
                <p-tabs [(value)]="activeConfigTab" (valueChange)="onConfigTabChange($event)">
                    <p-tablist>
                        <p-tab value="department">Team</p-tab>
                        <p-tab value="job_type">Job Type</p-tab>
                        <p-tab value="location">Location</p-tab>
                    </p-tablist>
                    <p-tabpanels>
                        <p-tabpanel *ngFor="let tab of configTabs" [value]="tab.value">
                            <div class="flex flex-col gap-3">
                                <div class="flex gap-2">
                                    <input type="text" pInputText [(ngModel)]="newConfigLabel[tab.value]" placeholder="Add new {{tab.label}}" fluid
                                        (keydown.enter)="addConfigOption(tab.value)" />
                                    <p-button icon="pi pi-plus" severity="success" (onClick)="addConfigOption(tab.value)" />
                                </div>
                                <p-table [value]="configOptionsForTab(tab.value)" [rows]="50" [paginator]="configOptionsForTab(tab.value).length > 10"
                                    [tableStyle]="{ 'min-width': '30rem' }">
                                    <ng-template #header>
                                        <tr>
                                            <th>Order</th>
                                            <th>Label</th>
                                            <th>Active</th>
                                            <th>Actions</th>
                                        </tr>
                                    </ng-template>
                                    <ng-template #body let-opt let-i="rowIndex">
                                        <tr>
                                            <td>{{i + 1}}</td>
                                            <td>
                                                <input *ngIf="editingConfig()?.id === opt.id; else readMode" type="text" pInputText
                                                    [ngModel]="editingConfig()?.label"
                                                    (ngModelChange)="updateEditingLabel($event)"
                                                    (keydown.enter)="saveEditingConfig()" fluid />
                                                <ng-template #readMode>
                                                    <span>{{opt.label}}</span>
                                                </ng-template>
                                            </td>
                                            <td>
                                                <p-toggleSwitch [(ngModel)]="opt.is_active" (onChange)="toggleConfigActive(opt)" />
                                            </td>
                                            <td>
                                                <p-button *ngIf="editingConfig()?.id !== opt.id" icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true"
                                                    (onClick)="startEditConfig(opt)" />
                                                <p-button *ngIf="editingConfig()?.id === opt.id" icon="pi pi-check" class="mr-2" [rounded]="true" [outlined]="true"
                                                    severity="success" (onClick)="saveEditingConfig()" />
                                                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                                    (onClick)="deleteConfigOption(opt)" />
                                            </td>
                                        </tr>
                                    </ng-template>
                                </p-table>
                            </div>
                        </p-tabpanel>
                    </p-tabpanels>
                </p-tabs>
            </ng-template>
            <ng-template #footer>
                <p-button label="Close" icon="pi pi-times" text (onClick)="configDialog = false" />
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
    departments = signal<{ label: string; value: string }[]>(DEFAULT_DEPARTMENTS);
    jobTypes = signal<{ label: string; value: string }[]>(DEFAULT_JOB_TYPES);
    locations = signal<{ label: string; value: string }[]>(DEFAULT_LOCATIONS);

    configDialog = false;
    activeConfigTab: string = 'department';
    configTabs = [
        { label: 'Team', value: 'department' as const },
        { label: 'Job Type', value: 'job_type' as const },
        { label: 'Location', value: 'location' as const }
    ];
    configOptions = signal<DropdownOption[]>([]);
    newConfigLabel: Record<'department' | 'job_type' | 'location', string> = { department: '', job_type: '', location: '' };
    editingConfig = signal<DropdownOption | null>(null);

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
                const mapLabels = (items: string[]) => items.map(label => ({ label, value: toSlug(label) }));
                this.departments.set([...DEFAULT_DEPARTMENTS, ...mapLabels(opts.departments).filter(o => !DEFAULT_DEPARTMENTS.some(d => d.value === o.value))]);
                this.jobTypes.set([...DEFAULT_JOB_TYPES, ...mapLabels(opts.job_types).filter(o => !DEFAULT_JOB_TYPES.some(d => d.value === o.value))]);
                this.locations.set([...DEFAULT_LOCATIONS, ...mapLabels(opts.locations).filter(o => !DEFAULT_LOCATIONS.some(d => d.value === o.value))]);
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
        if (this.position.description) {
            this.position.description = this.cleanBulletListHtml(this.position.description);
        }
        this.dialog = true;
    }

    cleanDescriptionBullets() {
        if (this.position.description) {
            this.position.description = this.cleanBulletListHtml(this.position.description);
        }
    }

    private cleanBulletListHtml(html: string): string {
        if (!html) return html;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        let changed = false;

        const stripLeadingNumber = (node: Node): boolean => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || '';
                const newText = text.replace(/^\s*\d+[:.)]\s*/, '');
                if (newText !== text) {
                    node.textContent = newText;
                    return true;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                for (const child of Array.from(node.childNodes)) {
                    if (stripLeadingNumber(child)) return true;
                }
            }
            return false;
        };

        doc.querySelectorAll('li').forEach(li => {
            if (stripLeadingNumber(li)) changed = true;
        });

        return changed ? doc.body.innerHTML : html;
    }

    onTitleChange(title: string) {
        this.position.slug = slugify(title);
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
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill Title, Team, Job Type, Location, and Full Description.', life: 5000 });
            return;
        }

        this.saving = true;
        const data: JobPosition = {
            ...p,
            description: this.cleanBulletListHtml(p.description.trim()),
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

    capitalizeWords(str?: string): string {
        return capitalizeWords(str);
    }

    // ===== CONFIG MANAGEMENT =====

    openConfigDialog() {
        this.activeConfigTab = 'department';
        this.newConfigLabel = { department: '', job_type: '', location: '' };
        this.editingConfig.set(null);
        this.loadConfigOptions();
        this.configDialog = true;
    }

    onConfigTabChange(tab: string | number | undefined) {
        if (!tab) return;
        this.activeConfigTab = tab as any;
        this.editingConfig.set(null);
    }

    configOptionsForTab(tab: 'department' | 'job_type' | 'location'): DropdownOption[] {
        return this.configOptions()
            .filter(o => o.option_type === tab)
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    }

    loadConfigOptions() {
        this.api.getAllDropdownOptions().subscribe({
            next: (data) => {
                this.configOptions.set(data.map((o: any) => ({
                    id: o.id,
                    option_type: o.option_type,
                    label: o.label,
                    value: o.value,
                    sort_order: o.sort_order ?? 0,
                    is_active: o.is_active ?? true
                })));
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load list options' })
        });
    }

    addConfigOption(type: 'department' | 'job_type' | 'location') {
        const label = this.newConfigLabel[type]?.trim();
        if (!label) return;
        this.api.createDropdownOption({ option_type: type, label }).subscribe({
            next: () => {
                this.newConfigLabel[type] = '';
                this.loadConfigOptions();
                this.loadDropdownOptions();
                this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Option added', life: 2000 });
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to add option' })
        });
    }

    startEditConfig(opt: DropdownOption) {
        this.editingConfig.set({ ...opt });
    }

    updateEditingLabel(value: string) {
        const current = this.editingConfig();
        if (current) {
            this.editingConfig.set({ ...current, label: value });
        }
    }

    saveEditingConfig() {
        const current = this.editingConfig();
        if (!current?.id || !current.label?.trim()) {
            this.editingConfig.set(null);
            return;
        }
        this.api.updateDropdownOption(current.id, { label: current.label.trim() }).subscribe({
            next: () => {
                this.editingConfig.set(null);
                this.loadConfigOptions();
                this.loadDropdownOptions();
                this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Option updated', life: 2000 });
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to update option' })
        });
    }

    toggleConfigActive(opt: DropdownOption) {
        if (!opt.id) return;
        this.api.updateDropdownOption(opt.id, { is_active: !!opt.is_active }).subscribe({
            next: () => {
                this.loadConfigOptions();
                this.loadDropdownOptions();
                this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Active status updated', life: 2000 });
            },
            error: () => {
                opt.is_active = !opt.is_active;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update active status' });
            }
        });
    }

    deleteConfigOption(opt: DropdownOption) {
        if (!opt.id) return;
        this.confirmationService.confirm({
            message: `Delete "${opt.label}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.api.deleteDropdownOption(opt.id!).subscribe({
                    next: () => {
                        this.loadConfigOptions();
                        this.loadDropdownOptions();
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Option deleted', life: 2000 });
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete option' })
                });
            }
        });
    }
}
