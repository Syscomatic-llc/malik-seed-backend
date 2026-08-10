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
        <p-toast />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="Back to Positions" icon="pi pi-arrow-left" class="mr-2" routerLink="/cms/hiring/positions" />
                    <p-button label="New Question" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
                <ng-template #end>
                    <p-select [options]="typeFilterOptions()" [ngModel]="selectedTypeFilter()"
                        (ngModelChange)="selectedTypeFilter.set($event)"
                        optionLabel="label" optionValue="value" placeholder="Filter by Type"
                        styleClass="w-64" appendTo="body" />
                </ng-template>
            </p-toolbar>

            <p-card [header]="'Assessment Questions: ' + positionTitle()">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-bold m-0">Exam Durations (minutes)</h3>
                    <p-button label="Save Durations" icon="pi pi-check" severity="success"
                        (onClick)="saveDurations()" [loading]="savingDurations" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div class="p-3 bg-primary/5 rounded flex flex-col gap-2">
                        <label class="text-sm font-bold">MCQ Duration</label>
                        <input type="number" pInputText [(ngModel)]="mcqDuration" placeholder="0" fluid />
                        <span class="text-xs text-muted-color">Default: 0 min</span>
                    </div>
                    <div class="p-3 bg-primary/5 rounded flex flex-col gap-2">
                        <label class="text-sm font-bold">Short Answer Duration</label>
                        <input type="number" pInputText [(ngModel)]="shortAnswerDuration" placeholder="0" fluid />
                        <span class="text-xs text-muted-color">Default: 0 min</span>
                    </div>
                    <div *ngIf="hasLongAnswerQuestions()" class="p-3 bg-primary/5 rounded flex flex-col gap-2">
                        <label class="text-sm font-bold">Long Answer Duration</label>
                        <input type="number" pInputText [(ngModel)]="longAnswerDuration" placeholder="0" fluid />
                        <span class="text-xs text-muted-color">Default: 0 min</span>
                    </div>
                </div>

                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-bold m-0">Passing Score</h3>
                    <p-button label="Save Passing Score" icon="pi pi-check" severity="success"
                        (onClick)="savePassingScore()" [loading]="savingPassingScore" />
                </div>
                <div class="p-3 bg-primary/5 rounded flex flex-col gap-2 mb-4">
                    <input type="number" pInputText [(ngModel)]="passingScore" placeholder="e.g. 70" fluid />
                    <span class="text-xs text-muted-color">Minimum score (percentage) required to pass the exam</span>
                </div>

                <p-table [value]="filteredQuestions()" [rows]="10" [paginator]="true"
                    [tableStyle]="{ 'min-width': '75rem' }">
                    <ng-template #header>
                        <tr>
                            <th>Order</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Question</th>
                            <th>Correct Answer</th>
                            <th>Marks</th>
                            <th>Char Limit</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-q>
                        <tr>
                            <td>{{q.sort_order}}</td>
                            <td><p-tag [value]="q.question_type" [severity]="getTypeSeverity(q.question_type)" /></td>
                            <td>{{q.category || '-'}}</td>
                            <td>{{q.question | slice:0:60}}...</td>
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
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">Question Type</label>
                            <p-select [options]="questionTypes" [(ngModel)]="question.question_type"
                                optionLabel="label" optionValue="value" placeholder="Select Type" fluid appendTo="body" />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Category</label>
                            <input type="text" pInputText [(ngModel)]="question.category" placeholder="e.g. Technical" fluid />
                        </div>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Question</label>
                        <ng-container *ngIf="question.question_type === 'long_answer'; else plainQuestion">
                            <p-editor [(ngModel)]="question.question" [style]="{ height: '160px' }"
                                [modules]="editorModules" placeholder="Enter long-answer question">
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
                        <label class="block font-bold mb-2">Options (one per line)</label>
                        <textarea pTextarea [(ngModel)]="optionsText" rows="4" placeholder="A. Option 1&#10;B. Option 2" fluid></textarea>
                    </div>
                    <div *ngIf="question.question_type === 'mcq'">
                        <label class="block font-bold mb-2">Correct Answer</label>
                        <input type="text" pInputText [(ngModel)]="question.correct_answer" placeholder="A or option text" fluid />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">Marks</label>
                            <input type="number" pInputText [(ngModel)]="question.marks" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Sort Order</label>
                            <input type="number" pInputText [(ngModel)]="question.sort_order" fluid />
                        </div>
                    </div>
                    <div *ngIf="question.question_type === 'short_answer' || question.question_type === 'long_answer'">
                        <label class="block font-bold mb-2">Character Limit</label>
                        <input type="number" pInputText [(ngModel)]="question.char_limit" placeholder="e.g. 300" fluid />
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
    selectedTypeFilter = signal<string>('');
    mcqDuration: number | null = 0;
    shortAnswerDuration: number | null = 0;
    longAnswerDuration: number | null = 0;
    passingScore: number | null = 70;
    dialog = false;
    question: any = {};
    optionsText = '';
    saving = false;
    savingDurations = false;
    savingPassingScore = false;
    questionTypes = QUESTION_TYPES;

    editorModules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }]
        ]
    };

    typeFilterOptions = computed(() => [
        { label: 'All Types', value: '' },
        ...QUESTION_TYPES
    ]);

    filteredQuestions = computed(() => {
        const type = this.selectedTypeFilter();
        if (!type) return this.questions();
        return this.questions().filter(q => q.question_type === type);
    });

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
                this.questions.set(res.questions || []);
                this.mcqDuration = res.mcq_duration ?? 0;
                this.shortAnswerDuration = res.short_answer_duration ?? 0;
                this.longAnswerDuration = res.long_answer_duration ?? 0;
                this.passingScore = res.passing_score ?? 70;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load assessment questions' });
            }
        });
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
        this.api.adminUpdate('job-position', this.positionId(), { passing_score: this.passingScore }).subscribe({
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
        if (Array.isArray(q.options)) {
            this.optionsText = q.options.join('\n');
        } else {
            this.optionsText = '';
        }
        this.dialog = true;
    }

    hideDialog() {
        this.dialog = false;
    }

    saveQuestion() {
        if (!this.question.question?.trim()) return;
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
}
