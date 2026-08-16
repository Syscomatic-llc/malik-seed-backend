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
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    selector: 'app-assessment-submissions-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, TableModule,
        DialogModule, TagModule, SelectModule, ToastModule, InputTextModule,
        ToolbarModule, ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
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
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteSubmission(item)" />
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

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '90vw', 'max-width': '900px' }"
            header="Assessment Details" [modal]="true" [dismissableMask]="true">
            <ng-template #content>
                <div *ngIf="selectedSubmission()" class="flex flex-col gap-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
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
                            <div class="text-sm mt-1 text-muted-color">
                                Total: {{selectedSubmission()?.earned_marks ?? 0}} / {{selectedSubmission()?.total_marks ?? 0}}
                            </div>
                        </p-card>
                    </div>

                    <div *ngIf="mcqQuestions().length" class="flex flex-col gap-3">
                        <div class="font-bold text-lg">Multiple Choice Questions</div>
                        <p-card *ngFor="let q of mcqQuestions(); let i = index">
                            <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
                                <div class="min-w-0 flex-1">
                                    <span class="text-xs font-bold uppercase text-primary">MCQ</span>
                                    <div class="font-semibold mt-1 break-words">{{questionOrder(q)}}. <span [innerHTML]="q.question"></span></div>
                                </div>
                                <p-tag [value]="q.is_correct ? 'Correct' : 'Incorrect'"
                                    [severity]="q.is_correct ? 'success' : 'danger'" />
                            </div>

                            <div class="flex flex-col gap-2 mb-3">
                                <div *ngFor="let opt of q.options; let idx = index" class="p-2 rounded border text-sm break-words"
                                    [ngClass]="{
                                        'border-green-500 bg-green-50 text-green-700': isCorrectOption(opt, q),
                                        'border-orange-500 bg-orange-50 text-orange-700': isApplicantOption(opt, q) && !isCorrectOption(opt, q),
                                        'border-surface-200': !isCorrectOption(opt, q) && !isApplicantOption(opt, q)
                                    }">
                                    <div class="flex flex-wrap items-center justify-between gap-2">
                                        <span class="break-words">{{opt}}</span>
                                        <span *ngIf="isCorrectOption(opt, q) && isApplicantOption(opt, q)" class="text-xs font-bold text-green-700">Correct & applicant's answer</span>
                                        <span *ngIf="isCorrectOption(opt, q) && !isApplicantOption(opt, q)" class="text-xs font-bold text-green-700">Correct</span>
                                        <span *ngIf="isApplicantOption(opt, q) && !isCorrectOption(opt, q)" class="text-xs font-bold text-orange-700">Applicant's answer</span>
                                    </div>
                                </div>
                            </div>

                            <div class="text-xs text-muted-color">
                                Marks: {{q.earned_marks ?? 0}} / {{q.marks}}
                            </div>
                        </p-card>
                    </div>

                    <div *ngIf="textQuestions().length" class="flex flex-col gap-3">
                        <div class="font-bold text-lg">Manual Scoring</div>
                        <p-card *ngFor="let q of textQuestions(); let i = index">
                            <div class="mb-2">
                                <span class="text-xs font-bold uppercase text-primary">{{q.question_type === 'long_answer' ? 'Long Answer' : 'Short Answer'}}</span>
                                <div class="font-semibold mt-1 break-words">{{questionOrder(q)}}. <span [innerHTML]="q.question"></span></div>
                            </div>
                            <div class="p-3 rounded bg-surface-50 border border-surface-200 max-h-80 overflow-y-auto">
                                <div class="text-xs text-muted-color mb-1">Applicant answer</div>
                                <div class="text-sm whitespace-pre-wrap break-words" [innerHTML]="q.applicant_answer || 'No answer'"></div>
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                                <div class="text-xs text-muted-color">
                                    Current marks: <span class="font-semibold">{{q.earned_marks ?? 'Pending'}}</span> / {{q.marks}}
                                </div>
                                <div class="flex items-center gap-2">
                                    <label class="text-sm font-medium">Earned marks</label>
                                    <input type="number" pInputText [(ngModel)]="scoreInputs[q.id]"
                                        [min]="0" [max]="q.marks" step="0.5"
                                        class="w-24 text-center" placeholder="0" />
                                    <span class="text-xs text-muted-color">/ {{q.marks}}</span>
                                </div>
                            </div>
                        </p-card>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Save Marks & Close" icon="pi pi-save" severity="success" [loading]="savingScores()"
                    (onClick)="saveScoresAndClose()" />
            </ng-template>
        </p-dialog>
    `
})
export class AssessmentSubmissionsPage implements OnInit {
    submissions = signal<AssessmentSubmission[]>([]);
    positions = signal<JobPosition[]>([]);
    selectedPositionId = signal<number | null>(null);
    selectedSubmission = signal<AssessmentSubmissionDetail | null>(null);
    scoreInputs: Record<number, number | null> = {};
    savingScores = signal(false);
    dialogVisible = false;

    positionOptions = computed(() => [
        { label: 'All Positions', value: null },
        ...this.positions().map(p => ({ label: p.title, value: p.id }))
    ]);

    questions = computed(() => this.selectedSubmission()?.questions || []);
    mcqQuestions = computed(() => this.questions().filter(q => q.question_type === 'mcq'));
    textQuestions = computed(() => this.questions().filter(q => q.question_type === 'short_answer' || q.question_type === 'long_answer'));

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
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

    questionOrder(q: AssessmentSubmissionQuestion): number {
        return (q.sort_order ?? 0) + 1;
    }

    viewSubmission(item: AssessmentSubmission) {
        this.api.getAssessmentSubmission(item.id).subscribe({
            next: (data) => {
                this.selectedSubmission.set(data);
                const inputs: Record<number, number | null> = {};
                (data.questions || []).forEach(q => {
                    if (q.question_type !== 'mcq') {
                        inputs[q.id] = q.earned_marks ?? null;
                    }
                });
                this.scoreInputs = inputs;
                this.dialogVisible = true;
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load submission details' })
        });
    }

    saveScores() {
        const submission = this.selectedSubmission();
        if (!submission || !submission.id) return;

        const scores: Record<string, number> = {};
        for (const q of this.textQuestions()) {
            const value = this.scoreInputs[q.id];
            if (value !== null && value !== undefined && !isNaN(value)) {
                const parsed = Number(value);
                if (parsed < 0 || parsed > q.marks) continue;
                scores[q.id] = parsed;
            }
        }

        if (Object.keys(scores).length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'No marks entered', detail: 'Please enter earned marks for at least one question' });
            return;
        }

        this.savingScores.set(true);
        this.api.updateAssessmentScores(submission.id, scores).subscribe({
            next: (data) => {
                this.selectedSubmission.set(data);
                this.submissions.update(list => list.map(s => s.id === data.id ? { ...s, assessment_score: data.assessment_score } : s));
                const inputs: Record<number, number | null> = {};
                (data.questions || []).forEach(q => {
                    if (q.question_type !== 'mcq') {
                        inputs[q.id] = q.earned_marks ?? null;
                    }
                });
                this.scoreInputs = inputs;
                this.savingScores.set(false);
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Scores saved successfully' });
            },
            error: (err) => {
                this.savingScores.set(false);
                const detail = err?.error?.detail || 'Failed to save scores';
                this.messageService.add({ severity: 'error', summary: 'Error', detail });
            }
        });
    }

    saveScoresAndClose() {
        this.saveScores();
        this.dialogVisible = false;
    }

    deleteSubmission(item: AssessmentSubmission) {
        this.confirmationService.confirm({
            message: `Delete assessment submission from ${item.first_name || ''} ${item.last_name || ''} (${item.email || item.id})?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.api.adminDelete('hiring/applications', item.id).subscribe({
                    next: () => {
                        this.submissions.set(this.submissions().filter(s => s.id !== item.id));
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Submission deleted' });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete submission' })
                });
            }
        });
    }

    getScoreSeverity(score?: number | null): 'success' | 'warn' | 'danger' | 'info' | null {
        if (score === null || score === undefined) return 'info';
        if (score >= 70) return 'success';
        if (score >= 50) return 'warn';
        return 'danger';
    }

    private _optionPrefix(text?: string | null): string | null {
        const m = String(text || '').match(/^([A-Za-z0-9]+)[\.\)]/);
        return m ? m[1].toLowerCase() : null;
    }

    isCorrectOption(option: string, q: AssessmentSubmissionQuestion): boolean {
        if (!q.correct_answer) return false;
        const correct = String(q.correct_answer).trim().toLowerCase();
        if (option.trim().toLowerCase() === correct) return true;
        const prefix = this._optionPrefix(option);
        return !!prefix && prefix === correct;
    }

    isApplicantOption(option: string, q: AssessmentSubmissionQuestion): boolean {
        if (!q.applicant_answer) return false;
        const answer = String(q.applicant_answer).trim().toLowerCase();
        if (option.trim().toLowerCase() === answer) return true;
        const optionPrefix = this._optionPrefix(option);
        const answerPrefix = this._optionPrefix(q.applicant_answer);
        return !!(optionPrefix && answerPrefix && optionPrefix === answerPrefix);
    }
}
