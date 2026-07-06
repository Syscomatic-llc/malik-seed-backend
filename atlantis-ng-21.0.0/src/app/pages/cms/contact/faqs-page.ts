import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, FAQ } from '@/app/services/malik-api.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-faqs-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        TagModule, ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New FAQ" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="faqs()" [rows]="10" [paginator]="true"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>ID</th>
                        <th>Question</th>
                        <th>Answer</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{item.id}}</td>
                        <td>{{item.question}}</td>
                        <td>{{item.answer | slice:0:80}}...</td>
                        <td><p-tag [value]="item.category || 'General'" severity="info" /></td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" 
                                (onClick)="editFAQ(item)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteFAQ(item)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialog" [style]="{ width: '500px' }" header="FAQ Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Question</label>
                        <input type="text" pInputText [(ngModel)]="faq.question" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Answer</label>
                        <textarea pTextarea [(ngModel)]="faq.answer" rows="4" fluid></textarea>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Category</label>
                        <input type="text" pInputText [(ngModel)]="faq.category" placeholder="e.g. General, Products" fluid />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveFAQ()" [loading]="saving" />
            </ng-template>
        </p-dialog>
    `
})
export class FAQsPage implements OnInit {
    faqs = signal<FAQ[]>([]);
    dialog = false;
    faq: FAQ = { question: '', answer: '' };
    saving = false;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadFAQs();
    }

    loadFAQs() {
        this.api.getFAQs().subscribe({
            next: (data) => this.faqs.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load FAQs' })
        });
    }

    openNew() {
        this.faq = { question: '', answer: '' };
        this.dialog = true;
    }

    editFAQ(f: FAQ) {
        this.faq = { ...f };
        this.dialog = true;
    }

    hideDialog() {
        this.dialog = false;
    }

    saveFAQ() {
        if (!this.faq.question?.trim() || !this.faq.answer?.trim()) return;
        this.saving = true;
        const data = { ...this.faq };
        const request = data.id
            ? this.api.adminUpdate('faq', data.id, data)
            : this.api.adminCreate('faq', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'FAQ saved successfully', life: 3000 });
                this.loadFAQs();
                this.dialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save FAQ' });
            }
        });
    }

    deleteFAQ(f: FAQ) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete this FAQ?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!f.id) return;
                this.api.adminDelete('faq', f.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'FAQ deleted', life: 3000 });
                        this.loadFAQs();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete FAQ' });
                    }
                });
            }
        });
    }
}
