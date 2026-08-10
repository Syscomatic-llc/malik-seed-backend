import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
    MalikApiService,
    JobApplication,
    JobPosition
} from '@/app/services/malik-api.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-applications-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, TableModule,
        DialogModule, TagModule, SelectModule, ToastModule, ToolbarModule,
        InputTextModule, ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <h5 class="m-0 mr-4">Open Position Applications</h5>
                    <input type="text" pInputText [(ngModel)]="searchText" placeholder="Search name, email..." class="w-64 mr-2" />
                    <p-select [options]="positionOptions()" [(ngModel)]="selectedPositionId"
                        (ngModelChange)="onPositionChange($event)"
                        optionLabel="label" optionValue="value" placeholder="All Positions"
                        styleClass="w-56" appendTo="body" />
                </ng-template>
                <ng-template #end>
                    <p-button label="Refresh" icon="pi pi-refresh" (onClick)="loadApplications()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="filteredApplications()" [rows]="10" [paginator]="true"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Position</th>
                        <th>Location</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{item.first_name || ''}} {{item.last_name || ''}}</td>
                        <td>{{item.email || 'N/A'}}</td>
                        <td>{{item.phone || 'N/A'}}</td>
                        <td>{{item.position_title || 'N/A'}}</td>
                        <td>{{item.current_location || 'N/A'}}</td>
                        <td>
                            <span *ngIf="item.source?.length; else noSource">
                                {{item.source.join(', ')}}
                            </span>
                            <ng-template #noSource>N/A</ng-template>
                        </td>
                        <td><p-tag [value]="item.status || 'new'" [severity]="getStatusSeverity(item.status)" /></td>
                        <td>{{item.created_at | date:'mediumDate'}}</td>
                        <td>
                            <p-button icon="pi pi-eye" class="mr-2" [rounded]="true" [outlined]="true"
                                (onClick)="viewApplication(item)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteApplication(item)" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr>
                        <td colspan="9" class="text-center text-muted-color py-4">No applications found</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '850px' }" header="Application Details" [modal]="true">
            <ng-template #content>
                <div *ngIf="selectedApplication()" class="flex flex-col gap-4">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <p-card header="Applicant">
                            <div class="font-bold">{{selectedApplication()?.first_name}} {{selectedApplication()?.last_name}}</div>
                            <div class="text-muted-color text-sm">{{selectedApplication()?.email}}</div>
                            <div class="text-muted-color text-sm">{{selectedApplication()?.phone || 'No phone'}}</div>
                        </p-card>
                        <p-card header="Position">
                            <div class="font-bold">{{selectedApplication()?.position_title || 'N/A'}}</div>
                            <div class="text-muted-color text-sm">Location: {{selectedApplication()?.current_location || 'N/A'}}</div>
                        </p-card>
                        <p-card header="Status">
                            <p-tag [value]="selectedApplication()?.status || 'new'" [severity]="getStatusSeverity(selectedApplication()?.status)" />
                            <div *ngIf="selectedApplication()?.assessment_score !== null && selectedApplication()?.assessment_score !== undefined"
                                class="text-sm mt-2">
                                Assessment: {{selectedApplication()?.assessment_score}}%
                            </div>
                        </p-card>
                    </div>

                    <p-card header="Source">
                        <div *ngIf="selectedApplication()?.source?.length; else noSourceDetail">
                            {{selectedApplication()?.source?.join(', ')}}
                        </div>
                        <ng-template #noSourceDetail><span class="text-muted-color">Not provided</span></ng-template>
                    </p-card>

                    <p-card header="Links & Resume">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div *ngIf="selectedApplication()?.linkedin_url">
                                <span class="text-muted-color">LinkedIn:</span>
                                <a [href]="selectedApplication()?.linkedin_url" target="_blank" class="text-primary hover:underline ml-1">View profile</a>
                            </div>
                            <div *ngIf="selectedApplication()?.portfolio_url">
                                <span class="text-muted-color">Portfolio:</span>
                                <a [href]="selectedApplication()?.portfolio_url" target="_blank" class="text-primary hover:underline ml-1">View portfolio</a>
                            </div>
                            <div *ngIf="selectedApplication()?.resume_url">
                                <span class="text-muted-color">Resume:</span>
                                <a [href]="resolveUrl(selectedApplication()?.resume_url)" target="_blank" class="text-primary hover:underline ml-1">
                                    <i class="pi pi-file-pdf mr-1"></i>View resume
                                </a>
                            </div>
                        </div>
                    </p-card>

                    <p-card header="Additional Information" *ngIf="selectedApplication()?.why_join || selectedApplication()?.additional_info">
                        <div *ngIf="selectedApplication()?.why_join" class="mb-2">
                            <div class="text-sm font-semibold">Why join?</div>
                            <div class="text-sm text-muted-color whitespace-pre-wrap">{{selectedApplication()?.why_join}}</div>
                        </div>
                        <div *ngIf="selectedApplication()?.additional_info">
                            <div class="text-sm font-semibold">Additional info</div>
                            <div class="text-sm text-muted-color whitespace-pre-wrap">{{selectedApplication()?.additional_info}}</div>
                        </div>
                    </p-card>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Close" icon="pi pi-times" text (onClick)="dialogVisible = false" />
            </ng-template>
        </p-dialog>
    `
})
export class ApplicationsPage implements OnInit {
    applications = signal<JobApplication[]>([]);
    positions = signal<JobPosition[]>([]);
    selectedPositionId = signal<number | null>(null);
    searchText = signal<string>('');
    selectedApplication = signal<JobApplication | null>(null);
    dialogVisible = false;
    mediaBaseUrl = environment.mediaBaseUrl;

    positionOptions = computed(() => [
        { label: 'All Positions', value: null },
        ...this.positions().map(p => ({ label: p.title, value: p.id }))
    ]);

    filteredApplications = computed(() => {
        const text = this.searchText().toLowerCase().trim();
        return this.applications().filter(a => {
            if (!text) return true;
            const name = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
            return name.includes(text) || (a.email || '').toLowerCase().includes(text);
        });
    });

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadPositions();
        this.loadApplications();
    }

    loadPositions() {
        this.api.getJobPositions().subscribe({
            next: (data) => this.positions.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load positions' })
        });
    }

    loadApplications() {
        this.api.getJobApplications(this.selectedPositionId() ?? undefined, this.searchText() || undefined).subscribe({
            next: (data) => this.applications.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load applications' })
        });
    }

    onPositionChange(value: number | null) {
        this.selectedPositionId.set(value);
        this.loadApplications();
    }

    viewApplication(item: JobApplication) {
        this.api.getJobApplication(item.id).subscribe({
            next: (data) => {
                this.selectedApplication.set(data);
                this.dialogVisible = true;
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load application details' })
        });
    }

    deleteApplication(item: JobApplication) {
        this.confirmationService.confirm({
            message: `Delete application from ${item.first_name} ${item.last_name}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.api.deleteJobApplication(item.id).subscribe({
                    next: () => {
                        this.applications.set(this.applications().filter(a => a.id !== item.id));
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Application deleted' });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete application' })
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

    getStatusSeverity(status?: string): 'success' | 'warn' | 'danger' | 'info' | null {
        if (!status) return 'info';
        if (status === 'hired' || status === 'submitted' || status === 'additional_info_submitted') return 'success';
        if (status === 'rejected') return 'danger';
        if (status === 'interview') return 'warn';
        return 'info';
    }
}
