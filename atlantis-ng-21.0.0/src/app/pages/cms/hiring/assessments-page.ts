import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MalikApiService, JobPosition } from '@/app/services/malik-api.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface PositionWithCount extends JobPosition {
    questionCount?: number;
}

@Component({
    selector: 'app-assessments-page',
    standalone: true,
    imports: [
        CommonModule, RouterModule, CardModule, ButtonModule, TableModule,
        ToastModule, ToolbarModule, TagModule, ProgressSpinnerModule
    ],
    providers: [MessageService],
    template: `
        <p-toast />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="Back to Positions" icon="pi pi-arrow-left" class="mr-2" routerLink="/cms/hiring/positions" />
                </ng-template>
            </p-toolbar>

            <p-card header="Exam / Assessment System">
                <p class="text-muted-color mb-4">
                    Manage MCQ, Short Answer, and Long Answer questions for each job position.
                    Select a position to add or edit its assessment questions.
                </p>

                <p-table [value]="positions()" [rows]="10" [paginator]="true"
                    [tableStyle]="{ 'min-width': '75rem' }" [loading]="loading()">
                    <ng-template #header>
                        <tr>
                            <th>ID</th>
                            <th>Position</th>
                            <th>Department</th>
                            <th>Type</th>
                            <th>Questions</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-item>
                        <tr>
                            <td>{{item.id}}</td>
                            <td>{{item.title}}</td>
                            <td>{{item.department}}</td>
                            <td><p-tag [value]="item.job_type" severity="info" /></td>
                            <td>
                                <p-tag [value]="item.questionCount ?? 0"
                                    [severity]="(item.questionCount ?? 0) > 0 ? 'success' : 'secondary'" />
                            </td>
                            <td>
                                <p-button label="Manage Questions" icon="pi pi-question-circle"
                                    severity="primary" class="mr-2"
                                    [routerLink]="['/cms/hiring/assessment', item.id]" />
                            </td>
                        </tr>
                    </ng-template>
                </p-table>

                <div *ngIf="positions().length === 0 && !loading()" class="text-center p-8 text-muted-color">
                    No job positions found. Create a position first to build an assessment.
                </div>
            </p-card>
        </div>
    `
})
export class AssessmentsPage implements OnInit {
    positions = signal<PositionWithCount[]>([]);
    loading = signal<boolean>(true);

    constructor(
        private api: MalikApiService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadPositions();
    }

    loadPositions() {
        this.loading.set(true);
        this.api.getJobPositions().subscribe({
            next: (data) => {
                if (data.length === 0) {
                    this.positions.set([]);
                    this.loading.set(false);
                    return;
                }

                const countRequests = data.map(p =>
                    this.api.getAssessmentQuestions(p.id!).pipe(
                        map((res: any) => ({ id: p.id, count: (res.questions || []).length })),
                        catchError(() => of({ id: p.id, count: 0 }))
                    )
                );

                forkJoin(countRequests).subscribe({
                    next: (counts) => {
                        const countMap = new Map(counts.map(c => [c.id, c.count]));
                        this.positions.set(data.map(p => ({
                            ...p,
                            questionCount: countMap.get(p.id) ?? 0
                        })));
                        this.loading.set(false);
                    },
                    error: () => {
                        this.positions.set(data);
                        this.loading.set(false);
                    }
                });
            },
            error: () => {
                this.loading.set(false);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load positions' });
            }
        });
    }
}
