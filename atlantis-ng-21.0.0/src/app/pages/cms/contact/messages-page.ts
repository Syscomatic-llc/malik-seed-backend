import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, ContactMessage } from '@/app/services/malik-api.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-contact-messages-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        DialogModule, TagModule, SelectModule, ToggleSwitchModule, ToastModule, DividerModule,
        ToolbarModule, ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <h5 class="m-0">Contact Messages</h5>
                </ng-template>
                <ng-template #end>
                    <p-select [options]="subjectOptions()" [(ngModel)]="selectedSubject"
                        placeholder="Filter by Subject" [showClear]="true"
                        (onChange)="applyFilter()" class="mr-2" />
                    <p-button label="Refresh" icon="pi pi-refresh" (onClick)="loadMessages()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="filteredMessages()" [rows]="10" [paginator]="true"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>Order No</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Read</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item let-i="rowIndex">
                    <tr [ngClass]="{'bg-primary-50': !item.is_read}">
                        <td><span class="font-bold text-primary">{{i + 1}}</span></td>
                        <td>{{item.name}}</td>
                        <td>{{item.email}}</td>
                        <td><p-tag [value]="item.subject || 'N/A'" severity="info" /></td>
                        <td>{{item.message | slice:0:60}}...</td>
                        <td>
                            <p-toggleSwitch [(ngModel)]="item.is_read" (onChange)="toggleRead(item)" />
                        </td>
                        <td>{{item.created_at | date:'mediumDate'}}</td>
                        <td>
                            <p-button icon="pi pi-eye" class="mr-2" [rounded]="true" [outlined]="true"
                                (onClick)="viewMessage(item)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteMessage(item)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialog" [style]="{ width: '600px' }" header="Message Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-3" *ngIf="selectedMessage">
                    <div><strong>From:</strong> {{selectedMessage.name}} &lt;{{selectedMessage.email}}&gt;</div>
                    <div><strong>Phone:</strong> {{selectedMessage.phone || 'N/A'}}</div>
                    <div><strong>Subject:</strong> {{selectedMessage.subject || 'N/A'}}</div>
                    <div><strong>Date:</strong> {{selectedMessage.created_at | date:'medium'}}</div>
                    <p-divider />
                    <p class="whitespace-pre-wrap">{{selectedMessage.message}}</p>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Close" icon="pi pi-times" text (onClick)="dialog = false" />
            </ng-template>
        </p-dialog>
    `
})
export class ContactMessagesPage implements OnInit {
    messages = signal<ContactMessage[]>([]);
    filteredMessages = signal<ContactMessage[]>([]);
    subjectOptions = signal<string[]>([]);
    selectedSubject: string | null = null;
    dialog = false;
    selectedMessage: ContactMessage | null = null;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadMessages();
        this.loadContactInfo();
    }

    loadMessages() {
        this.api.adminList('contact-message').subscribe({
            next: (data) => {
                this.messages.set(data);
                this.applyFilter();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load messages' })
        });
    }

    loadContactInfo() {
        this.api.adminList('contact-info').subscribe({
            next: (data: any[]) => {
                const info = data[0] || {};
                this.subjectOptions.set(info.subject_options || []);
            },
            error: () => {}
        });
    }

    applyFilter() {
        if (!this.selectedSubject) {
            this.filteredMessages.set(this.messages());
        } else {
            this.filteredMessages.set(this.messages().filter(m => m.subject === this.selectedSubject));
        }
    }

    toggleRead(item: ContactMessage) {
        this.api.adminUpdate('contact-message', item.id!, { is_read: item.is_read }).subscribe({
            next: () => this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Read status updated' }),
            error: () => {
                item.is_read = !item.is_read;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' });
            }
        });
    }

    viewMessage(item: ContactMessage) {
        this.selectedMessage = item;
        this.dialog = true;
        if (!item.is_read) {
            item.is_read = true;
            this.toggleRead(item);
        }
    }

    deleteMessage(item: ContactMessage) {
        this.confirmationService.confirm({
            message: `Delete message from ${item.name}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.api.adminDelete('contact-message', item.id!).subscribe({
                    next: () => {
                        this.messages.set(this.messages().filter(m => m.id !== item.id));
                        this.applyFilter();
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Message deleted' });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete message' })
                });
            }
        });
    }
}
