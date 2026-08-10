import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, ResumeUpload } from '@/app/services/malik-api.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-general-resumes-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        ToastModule, ToolbarModule, TagModule, ToggleSwitchModule, ConfirmDialogModule, InputTextModule, SelectModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="bottom-left" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <h5 class="m-0 mr-4">General Resumes</h5>
                    <input type="text" pInputText [(ngModel)]="filterText" placeholder="Search name, email..." class="w-64 mr-2" />
                    <p-select [options]="positionOptions()" [(ngModel)]="positionFilter"
                        (ngModelChange)="positionFilter.set($event)"
                        optionLabel="label" optionValue="value" placeholder="Filter by position"
                        styleClass="w-56" appendTo="body" />
                </ng-template>
                <ng-template #end>
                    <p-button label="Bulk Delete" icon="pi pi-trash" severity="danger" class="mr-2"
                        [disabled]="selectedResumes().length === 0" (onClick)="bulkDelete()" />
                    <p-button label="Download PDFs" icon="pi pi-file-pdf" class="mr-2" (onClick)="downloadPDFs()" />
                    <p-button label="Refresh" icon="pi pi-refresh" (onClick)="loadResumes()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="filteredResumes()" [rows]="10" [paginator]="true"
                [selection]="selectedResumes()" (selectionChange)="selectedResumes.set($event)"
                dataKey="id" [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Position</th>
                        <th>File</th>
                        <th>Size</th>
                        <th>Reviewed</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td><p-tableCheckbox [value]="item" /></td>
                        <td>{{item.name || item.applicant_name || 'N/A'}}</td>
                        <td>{{item.email || 'N/A'}}</td>
                        <td>{{item.phone || 'N/A'}}</td>
                        <td>General Resume</td>
                        <td>
                            <a *ngIf="item.file_url" [href]="resolveUrl(item.file_url)" target="_blank" class="text-primary hover:underline">
                                <i class="pi pi-file-pdf mr-1"></i>{{item.filename}}
                            </a>
                            <span *ngIf="!item.file_url" class="text-muted-color">No file</span>
                        </td>
                        <td>{{formatSize(item.file_size)}}</td>
                        <td>
                            <p-toggleSwitch [(ngModel)]="item.is_reviewed" (onChange)="toggleReviewed(item)" />
                        </td>
                        <td>{{item.created_at | date:'mediumDate'}}</td>
                        <td>
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteResume(item)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class GeneralResumesPage implements OnInit {
    resumes = signal<ResumeUpload[]>([]);
    selectedResumes = signal<ResumeUpload[]>([]);
    filterText = signal<string>('');
    positionFilter = signal<string | null>(null);
    mediaBaseUrl = environment.mediaBaseUrl;
    resumeType = 'general';

    positionOptions = computed(() => {
        const positions = Array.from(new Set(
            this.resumes()
                .map(r => r.position)
                .filter((p): p is string => !!p)
        )).sort();
        return [
            { label: 'All Positions', value: null },
            ...positions.map(p => ({ label: p, value: p }))
        ];
    });

    filteredResumes = computed(() => {
        const text = this.filterText().toLowerCase().trim();
        const position = this.positionFilter();
        return this.resumes().filter(r => {
            const matchesText = !text ||
                (r.name || r.applicant_name || '').toLowerCase().includes(text) ||
                (r.email || '').toLowerCase().includes(text) ||
                (r.position || '').toLowerCase().includes(text);
            const matchesPosition = !position || r.position === position;
            return matchesText && matchesPosition;
        });
    });

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadResumes();
    }

    loadResumes() {
        this.selectedResumes.set([]);
        this.api.getResumes(this.resumeType).subscribe({
            next: (data) => this.resumes.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load resumes' })
        });
    }

    toggleReviewed(item: ResumeUpload) {
        this.api.adminUpdate('resume', item.id!, { is_reviewed: item.is_reviewed }).subscribe({
            next: () => this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Review status updated' }),
            error: () => {
                item.is_reviewed = !item.is_reviewed;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update review status' });
            }
        });
    }

    deleteResume(item: ResumeUpload) {
        this.confirmationService.confirm({
            message: `Delete resume from ${item.name || item.applicant_name || item.email || 'anonymous'}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.api.deleteResume(item.id!).subscribe({
                    next: () => {
                        this.resumes.set(this.resumes().filter(r => r.id !== item.id));
                        this.selectedResumes.set(this.selectedResumes().filter(r => r.id !== item.id));
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Resume deleted' });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete resume' })
                });
            }
        });
    }

    bulkDelete() {
        const items = this.selectedResumes();
        if (!items.length) return;
        this.confirmationService.confirm({
            message: `Delete ${items.length} selected resume(s)?`,
            header: 'Confirm Bulk Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const ids = items.map(i => i.id!).filter(Boolean);
                this.api.bulkDeleteResumes(ids).subscribe({
                    next: () => {
                        this.resumes.set(this.resumes().filter(r => !ids.includes(r.id!)));
                        this.selectedResumes.set([]);
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${items.length} resume(s) deleted` });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to bulk delete resumes' })
                });
            }
        });
    }

    downloadPDFs() {
        const ids = this.selectedResumes().length ? this.selectedResumes().map(r => r.id!).filter(Boolean) : [];
        this.api.downloadResumePDFs(ids, this.resumeType).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${this.resumeType}_resumes.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                this.messageService.add({ severity: 'success', summary: 'Downloaded', detail: 'Resume PDFs downloaded' });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to download PDFs' })
        });
    }

    resolveUrl(path?: string): string {
        if (!path) return '';
        const base = (this.mediaBaseUrl || '').replace(/\/$/, '');
        const cleanPath = path.replace(/^\//, '');
        return `${base}/${cleanPath}`;
    }

    formatSize(bytes?: number): string {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}
