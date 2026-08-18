import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MalikApiService } from '@/app/services/malik-api.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Editor } from 'primeng/editor';

const QUESTION_TYPES = [
    { label: 'MCQ', value: 'mcq' },
    { label: 'Short Answer', value: 'short_answer' },
    { label: 'Long Answer', value: 'long_answer' }
];

function stripHtml(html?: string): string {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

@Component({
    selector: 'app-assessment-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        SelectModule, TagModule, ConfirmDialogModule, Editor
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="Back to Positions" icon="pi pi-arrow-left" class="mr-2" routerLink="/cms/hiring/positions" />
                    <p-button label="New Question" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>

            </p-toolbar>

            <p-card [header]="'Assessment Questions: ' + positionTitle()">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-bold m-0">Exam Durations (minutes)</h3>
                    <p-button label="Save Durations" icon="pi pi-check" severity="success"
                        (onClick)="saveDurations()" [loading]="savingDurations" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div class="p-4 rounded border border-surface-200 bg-surface-0 flex flex-col gap-2 shadow-sm"
                        [ngClass]="{'opacity-60': !hasMCQQuestions()}">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-bold flex items-center gap-2">
                                <i class="pi pi-check-circle text-primary"></i> MCQ Duration
                            </label>
                            <p-tag [value]="hasMCQQuestions() ? 'Enabled' : 'No MCQ yet'" [severity]="hasMCQQuestions() ? 'success' : 'secondary'" styleClass="text-xs" />
                        </div>
                        <input type="number" pInputText [(ngModel)]="mcqDuration" placeholder="0"
                            [disabled]="!hasMCQQuestions()" fluid />
                        <span class="text-xs text-muted-color">
                            {{ hasMCQQuestions() ? 'Time allowed for all MCQ questions' : 'Add at least one MCQ question to enable' }}
                        </span>
                    </div>
                    <div class="p-4 rounded border border-surface-200 bg-surface-0 flex flex-col gap-2 shadow-sm"
                        [ngClass]="{'opacity-60': !hasShortAnswerQuestions()}">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-bold flex items-center gap-2">
                                <i class="pi pi-pencil text-info"></i> Short Answer Duration
                            </label>
                            <p-tag [value]="hasShortAnswerQuestions() ? 'Enabled' : 'No short answers'" [severity]="hasShortAnswerQuestions() ? 'success' : 'secondary'" styleClass="text-xs" />
                        </div>
                        <input type="number" pInputText [(ngModel)]="shortAnswerDuration" placeholder="0"
                            [disabled]="!hasShortAnswerQuestions()" fluid />
                        <span class="text-xs text-muted-color">
                            {{ hasShortAnswerQuestions() ? 'Time allowed for all short answer questions' : 'Add at least one short answer question to enable' }}
                        </span>
                    </div>
                    <div class="p-4 rounded border border-surface-200 bg-surface-0 flex flex-col gap-2 shadow-sm"
                        [ngClass]="{'opacity-60': !hasLongAnswerQuestions()}">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-bold flex items-center gap-2">
                                <i class="pi pi-align-left text-warn"></i> Long Answer Duration
                            </label>
                            <p-tag [value]="hasLongAnswerQuestions() ? 'Enabled' : 'No long answers'" [severity]="hasLongAnswerQuestions() ? 'success' : 'secondary'" styleClass="text-xs" />
                        </div>
                        <input type="number" pInputText [(ngModel)]="longAnswerDuration" placeholder="0"
                            [disabled]="!hasLongAnswerQuestions()" fluid />
                        <span class="text-xs text-muted-color">
                            {{ hasLongAnswerQuestions() ? 'Time allowed for all long answer questions' : 'Add at least one long answer question to enable' }}
                        </span>
                    </div>
                </div>

                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-bold m-0">Passing Score</h3>
                    <p-button label="Save Passing Score" icon="pi pi-check" severity="success"
                        (onClick)="savePassingScore()" [loading]="savingPassingScore" />
                </div>
                <div class="p-3 bg-primary/5 rounded flex flex-col gap-2 mb-4">
                    <input type="number" pInputText [(ngModel)]="passingScore" placeholder="Leave empty for no passing score" fluid />
                    <span class="text-xs text-muted-color">Minimum score (percentage) required to pass the exam. Leave empty for no passing score requirement.</span>
                </div>

                <div class="flex items-center gap-4 mb-4">
                    <label class="font-bold">Filter by Type:</label>
                    <p-select [options]="questionTypeFilterOptions" [(ngModel)]="selectedQuestionTypeFilter"
                        optionLabel="label" optionValue="value" placeholder="All Types"
                        styleClass="w-48" appendTo="body" (ngModelChange)="onQuestionTypeFilterChange()" />
                </div>

                <p-table [value]="filteredQuestions()" [rows]="10" [paginator]="true"
                    [tableStyle]="{ 'min-width': '75rem' }">
                    <ng-template #header>
                        <tr>
                            <th>Order</th>
                            <th>Type</th>
                            <th>Question</th>
                            <th>Correct Answer</th>
                            <th>Marks</th>
                            <th>Char Limit</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-q let-index="rowIndex">
                        <tr>
                            <td><span class="font-bold text-primary">{{(q.sort_order ?? 0) + 1}}</span></td>
                            <td><p-tag [value]="q.question_type" [severity]="getTypeSeverity(q.question_type)" /></td>
                            <td>{{stripHtml(q.question) | slice:0:60}}...</td>
                            <td>{{q.correct_answer || '-'}}</td>
                            <td>{{q.marks}}</td>
                            <td>{{q.char_limit || '-'}}</td>
                            <td>
                                <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true"
                                    (onClick)="editQuestion(q)" />
                                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                    (onClick)="deleteQuestion(q)" />
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
                <div *ngIf="questions().length === 0" class="text-center p-8 text-muted-color">
                    No assessment questions found for this position.
                </div>
            </p-card>
        </div>

        <p-dialog [(visible)]="dialog" [style]="{ width: '700px' }" header="Assessment Question" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Question Type *</label>
                        <p-select [options]="questionTypes" [(ngModel)]="question.question_type"
                            optionLabel="label" optionValue="value" placeholder="Select Type" fluid appendTo="body" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Question *</label>
                        <ng-container *ngIf="question.question_type === 'long_answer'; else plainQuestion">
                            <p-editor [(ngModel)]="question.question" [style]="{ height: '160px' }"
                                [modules]="editorModules" placeholder="Enter long-answer question"
                                (onBlur)="cleanQuestionBullets()">
                                <ng-template #toolbar>
                                    <span class="ql-formats">
                                        <button class="ql-bold" aria-label="Bold"></button>
                                        <button class="ql-italic" aria-label="Italic"></button>
                                        <button class="ql-underline" aria-label="Underline"></button>
                                        <button class="ql-list" value="ordered" aria-label="Ordered List"></button>
                                        <button class="ql-list" value="bullet" aria-label="Unordered List"></button>
                                    </span>
                                </ng-template>
                            </p-editor>
                        </ng-container>
                        <ng-template #plainQuestion>
                            <textarea pTextarea [(ngModel)]="question.question" rows="3" fluid></textarea>
                        </ng-template>
                    </div>
                    <div *ngIf="question.question_type === 'mcq'">
                        <label class="block font-bold mb-2">Options (one per line) *</label>
                        <textarea pTextarea [(ngModel)]="optionsText" rows="4" placeholder="A. Option 1&#10;B. Option 2" fluid></textarea>
                    </div>
                    <div *ngIf="question.question_type === 'mcq'">
                        <label class="block font-bold mb-2">Correct Answer *</label>
                        <input type="text" pInputText [(ngModel)]="question.correct_answer" placeholder="A or option text" fluid />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">Marks *</label>
                            <input type="number" pInputText [(ngModel)]="question.marks" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Sort Order</label>
                            <input type="number" pInputText [(ngModel)]="question.sort_order" fluid />
                        </div>
                    </div>
                    <div *ngIf="question.question_type === 'short_answer' || question.question_type === 'long_answer'">
                        <label class="block font-bold mb-2">Character Limit</label>
                        <input type="number" pInputText [(ngModel)]="question.char_limit" placeholder="Leave empty for no limit" fluid />
                        <span class="text-xs text-muted-color">Leave empty for no limit</span>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveQuestion()" [loading]="saving" />
            </ng-template>
        </p-dialog>
    `
})
export class AssessmentPage implements OnInit {
    positionId = signal<number>(0);
    positionTitle = signal<string>('');
    questions = signal<any[]>([]);
    filteredQuestions = signal<any[]>([]);
    mcqDuration: number | null = 0;
    shortAnswerDuration: number | null = 0;
    longAnswerDuration: number | null = 0;
    passingScore: number | null = null;
    dialog = false;
    question: any = {};
    optionsText = '';
    saving = false;
    savingDurations = false;
    savingPassingScore = false;
    questionTypes = QUESTION_TYPES;
    questionTypeFilterOptions = [
        { label: 'All Types', value: '' },
        { label: 'MCQ', value: 'mcq' },
        { label: 'Short Answer', value: 'short_answer' },
        { label: 'Long Answer', value: 'long_answer' }
    ];
    selectedQuestionTypeFilter = '';

    editorModules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }]
        ]
    };

    hasMCQQuestions = computed(() => this.questions().some(q => q.question_type === 'mcq'));
    hasShortAnswerQuestions = computed(() => this.questions().some(q => q.question_type === 'short_answer'));
    hasLongAnswerQuestions = computed(() => this.questions().some(q => q.question_type === 'long_answer'));

    constructor(
        private route: ActivatedRoute,
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.positionId.set(+id);
            this.loadQuestions();
        }
    }

    loadQuestions() {
        this.api.getAssessmentQuestions(this.positionId()).subscribe({
            next: (res: any) => {
                this.positionTitle.set(res.position_title);
                const qs = res.questions || [];
                // Ensure proper indexing/sorting
                qs.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                this.questions.set(qs);
                this.filteredQuestions.set(qs);
                this.mcqDuration = res.mcq_duration ?? 0;
                this.shortAnswerDuration = res.short_answer_duration ?? 0;
                this.longAnswerDuration = res.long_answer_duration ?? 0;
                this.passingScore = res.passing_score ?? null;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load assessment questions' });
            }
        });
    }

    onQuestionTypeFilterChange() {
        const filter = this.selectedQuestionTypeFilter;
        if (!filter) {
            this.filteredQuestions.set(this.questions());
        } else {
            this.filteredQuestions.set(this.questions().filter(q => q.question_type === filter));
        }
    }

    saveDurations() {
        this.savingDurations = true;
        const payload = {
            mcq_duration: this.mcqDuration,
            short_answer_duration: this.shortAnswerDuration,
            long_answer_duration: this.longAnswerDuration
        };
        this.api.adminUpdate('job-position', this.positionId(), payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Exam durations saved successfully', life: 3000 });
                this.savingDurations = false;
            },
            error: (err) => {
                this.savingDurations = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save durations' });
            }
        });
    }

    savePassingScore() {
        this.savingPassingScore = true;
        const payload = this.passingScore !== null && this.passingScore !== undefined
            ? { passing_score: this.passingScore }
            : { passing_score: null };
        this.api.adminUpdate('job-position', this.positionId(), payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Passing score saved successfully', life: 3000 });
                this.savingPassingScore = false;
            },
            error: (err) => {
                this.savingPassingScore = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save passing score' });
            }
        });
    }

    getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null {
        switch (type) {
            case 'mcq': return 'success';
            case 'short_answer': return 'info';
            case 'long_answer': return 'warn';
            default: return 'secondary';
        }
    }

    openNew() {
        this.question = {
            question_type: 'mcq',
            marks: 1,
            sort_order: this.questions().length + 1
        };
        this.optionsText = '';
        this.dialog = true;
    }

    editQuestion(q: any) {
        this.question = { ...q };
        if (this.question.question) {
            this.question.question = this.cleanBulletListHtml(this.question.question);
        }
        if (Array.isArray(q.options)) {
            this.optionsText = q.options.join('\n');
        } else {
            this.optionsText = '';
        }
        this.dialog = true;
    }

    cleanQuestionBullets() {
        if (this.question.question) {
            this.question.question = this.cleanBulletListHtml(this.question.question);
        }
    }

    private cleanBulletListHtml(html: string): string {
        if (!html) return html;
        // Remove manually typed leading numbers (1:, 1., 1)) from bullet list items
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

    hideDialog() {
        this.dialog = false;
    }

    saveQuestion() {
        const q = this.question;
        // Validation: all fields required for MCQ, Short, Long
        if (!q.question?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Question text is required.', life: 3000 });
            return;
        }
        if (!q.question_type) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Question type is required.', life: 3000 });
            return;
        }
        if (q.marks === null || q.marks === undefined || q.marks === '') {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Marks is required.', life: 3000 });
            return;
        }
        if (q.question_type === 'mcq') {
            if (!this.optionsText?.trim()) {
                this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Options are required for MCQ.', life: 3000 });
                return;
            }
            if (!q.correct_answer?.trim()) {
                this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Correct answer is required for MCQ.', life: 3000 });
                return;
            }
        }

        this.saving = true;

        const data = { ...this.question };
        if (data.question_type === 'mcq' && this.optionsText) {
            data.options = this.optionsText.split('\n').map((o: string) => o.trim()).filter(Boolean);
        } else {
            data.options = null;
        }

        // Strip HTML whitespace for empty rich-text values
        if (data.question_type === 'long_answer' && data.question) {
            data.question = data.question.replace(/<p><br\s*\/?><\/p>/g, '<br>').trim();
            data.question = this.cleanBulletListHtml(data.question);
        }

        const request = data.id
            ? this.api.updateAssessmentQuestion(this.positionId(), data.id, data)
            : this.api.createAssessmentQuestion(this.positionId(), data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Question saved successfully', life: 3000 });
                this.loadQuestions();
                this.dialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save question' });
            }
        });
    }

    deleteQuestion(q: any) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this question?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!q.id) return;
                this.api.deleteAssessmentQuestion(this.positionId(), q.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Question deleted', life: 3000 });
                        this.loadQuestions();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete question' });
                    }
                });
            }
        });
    }

    stripHtml(html?: string): string {
        return stripHtml(html);
    }
}
