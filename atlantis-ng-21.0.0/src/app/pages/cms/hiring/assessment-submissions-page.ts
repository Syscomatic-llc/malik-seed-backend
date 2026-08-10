import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
    MalikApiService,
    AssessmentSubmission,
    AssessmentSubmissionDetail,
    AssessmentSubmissionQuestion,
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

@Component({
    selector: 'app-assessment-submissions-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, TableModule,
        DialogModule, TagModule, SelectModule, ToastModule, ToolbarModule
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <h5 class="m-0 mr-4">Assessment Submissions</h5>
                    <p-select [options]="positionOptions()" [(ngModel)]="selectedPositionId"
                        (ngModelChange)="onPositionChange($event)"
                        optionLabel="label" optionValue="value" placeholder="Filter by Position"
                        styleClass="w-64" appendTo="body" />
                </ng-template>
                <ng-template #end>
                    <p-button label="Refresh" icon="pi pi-refresh" (onClick)="loadSubmissions()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="submissions()" [rows]="10" [paginator]="true"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>Applicant</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Position</th>
                        <th>Score</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{item.first_name}} {{item.last_name}}</td>
                        <td>{{item.email || 'N/A'}}</td>
                        <td>{{item.phone || 'N/A'}}</td>
                        <td>{{item.position_title || 'N/A'}}</td>
                        <td>
                            <p-tag [value]="(item.assessment_score ?? 0) + '%'"
                                [severity]="getScoreSeverity(item.assessment_score)" />
                        </td>
                        <td>{{item.assessment_submitted_at | date:'medium'}}</td>
                        <td><p-tag [value]="item.status" severity="info" /></td>
                        <td>
                            <p-button icon="pi pi-eye" class="mr-2" [rounded]="true" [outlined]="true"
                                (onClick)="viewSubmission(item)" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr>
                        <td colspan="8" class="text-center text-muted-color py-4">No assessment submissions found</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '800px' }" header="Assessment Details" [modal]="true">
            <ng-template #content>
                <div *ngIf="selectedSubmission()" class="flex flex-col gap-4">
                    <div class="grid grid-cols-2 gap-4 mb-2">
                        <p-card header="Applicant">
                            <div class="text-lg font-bold">{{selectedSubmission()?.first_name}} {{selectedSubmission()?.last_name}}</div>
                            <div class="text-muted-color">{{selectedSubmission()?.email}}</div>
                            <div *ngIf="selectedSubmission()?.phone" class="text-muted-color">{{selectedSubmission()?.phone}}</div>
                        </p-card>
                        <p-card header="Result">
                            <div class="flex items-center gap-2">
                                <span class="text-2xl font-bold text-primary">{{selectedSubmission()?.assessment_score ?? 0}}%</span>
                                <span class="text-muted-color">/ passing {{selectedSubmission()?.passing_score ?? 70}}%</span>
                            </div>
                            <div *ngIf="selectedSubmission()?.mcq_score" class="text-sm mt-1">
                                MCQ: {{selectedSubmission()?.mcq_score}}
                            </div>
                        </p-card>
                    </div>

                    <p-card header="Questions & Answers">
                        <div *ngFor="let q of selectedSubmission()?.questions; let i = index" class="mb-4 p-3 border border-surface-200 rounded-lg">
                            <div class="flex items-start justify-between gap-2 mb-2">
                                <div>
                                    <span class="text-xs font-bold uppercase text-muted-color">{{q.question_type}}</span>
                                    <div class="font-semibold mt-1">{{i + 1}}. {{q.question}}</div>
                                </div>
                                <p-tag *ngIf="q.question_type === 'mcq'"
                                    [value]="q.is_correct ? 'Correct' : 'Incorrect'"
                                    [severity]="q.is_correct ? 'success' : 'danger'" />
                            </div>

                            <div *ngIf="q.options?.length" class="mb-2">
                                <div *ngFor="let opt of q.options" class="text-sm pl-2 py-1"
                                    [ngClass]="{
                                        'text-green-600 font-semibold': opt === q.correct_answer,
                                        'text-orange-600 font-semibold': opt === q.applicant_answer && opt !== q.correct_answer
                                    }">
                                    {{opt}}
                                    <span *ngIf="opt === q.correct_answer" class="ml-2 text-xs">(correct)</span>
                                    <span *ngIf="opt === q.applicant_answer && opt !== q.correct_answer" class="ml-2 text-xs">(applicant)</span>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div *ngIf="q.correct_answer !== undefined && q.correct_answer !== null">
                                    <span class="text-muted-color">Correct answer:</span>
                                    <span class="font-medium ml-1">{{q.correct_answer}}</span>
                                </div>
                                <div>
                                    <span class="text-muted-color">Applicant answer:</span>
                                    <span class="font-medium ml-1">{{q.applicant_answer || '-'}}</span>
                                </div>
                            </div>

                            <div class="text-xs text-muted-color mt-2">
                                Marks: {{q.earned_marks ?? '-'}} / {{q.marks}}
                            </div>
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
export class AssessmentSubmissionsPage implements OnInit {
    submissions = signal<AssessmentSubmission[]>([]);
    positions = signal<JobPosition[]>([]);
    selectedPositionId = signal<number | null>(null);
    selectedSubmission = signal<AssessmentSubmissionDetail | null>(null);
    dialogVisible = false;

    positionOptions = computed(() => [
        { label: 'All Positions', value: null },
        ...this.positions().map(p => ({ label: p.title, value: p.id }))
    ]);

    constructor(
        private api: MalikApiService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadPositions();
        this.loadSubmissions();
    }

    loadPositions() {
        this.api.getJobPositions().subscribe({
            next: (data) => this.positions.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load positions' })
        });
    }

    loadSubmissions() {
        this.api.getAssessmentSubmissions(this.selectedPositionId() ?? undefined).subscribe({
            next: (data) => this.submissions.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load submissions' })
        });
    }

    onPositionChange(value: number | null) {
        this.selectedPositionId.set(value);
        this.loadSubmissions();
    }

    viewSubmission(item: AssessmentSubmission) {
        this.api.getAssessmentSubmission(item.id).subscribe({
            next: (data) => {
                this.selectedSubmission.set(data);
                this.dialogVisible = true;
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load submission details' })
        });
    }

    getScoreSeverity(score?: number | null): 'success' | 'warn' | 'danger' | 'info' | null {
        if (score === null || score === undefined) return 'info';
        if (score >= 70) return 'success';
        if (score >= 50) return 'warn';
        return 'danger';
    }
}
