import { Component, OnInit, signal } from '@angular/core';
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
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-resumes-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        ToastModule, ToolbarModule, TagModule, ToggleSwitchModule, ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <h5 class="m-0">Uploaded Resumes / CVs</h5>
                </ng-template>
                <ng-template #end>
                    <p-button label="Refresh" icon="pi pi-refresh" (onClick)="loadResumes()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="resumes()" [rows]="10" [paginator]="true"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>ID</th>
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
                        <td>{{item.id}}</td>
                        <td>{{item.name || 'N/A'}}</td>
                        <td>{{item.email || 'N/A'}}</td>
                        <td>{{item.phone || 'N/A'}}</td>
                        <td>{{item.position || 'N/A'}}</td>
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
export class ResumesPage implements OnInit {
    resumes = signal<ResumeUpload[]>([]);
    mediaBaseUrl = environment.mediaBaseUrl;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadResumes();
    }

    loadResumes() {
        this.api.getResumes().subscribe({
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
            message: `Delete resume from ${item.name || item.email || 'anonymous'}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.api.deleteResume(item.id!).subscribe({
                    next: () => {
                        this.resumes.set(this.resumes().filter(r => r.id !== item.id));
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Resume deleted' });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete resume' })
                });
            }
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
