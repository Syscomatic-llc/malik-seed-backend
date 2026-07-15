import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, HiringTestimonial } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
import { environment } from '@/environments/environment';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-team-stories-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        ConfirmDialogModule, ImageUpload
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New Testimonial" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="testimonials()" [rows]="10" [paginator]="true"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>ID</th>
                        <th>Profile</th>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Department</th>
                        <th>Content</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{item.id}}</td>
                        <td>
                            <img *ngIf="item.avatar_url" [src]="mediaBaseUrl + item.avatar_url"
                                alt="" class="w-10 h-10 rounded-full object-cover" />
                            <span *ngIf="!item.avatar_url" class="text-muted-color">No image</span>
                        </td>
                        <td>{{item.name}}</td>
                        <td>{{item.designation}}</td>
                        <td>{{item.department}}</td>
                        <td>{{item.content | slice:0:80}}...</td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" 
                                (onClick)="editTestimonial(item)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteTestimonial(item)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialog" [style]="{ width: '500px' }" header="Testimonial Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Name</label>
                        <input type="text" pInputText [(ngModel)]="testimonial.name" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Designation</label>
                        <input type="text" pInputText [(ngModel)]="testimonial.designation" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Department</label>
                        <input type="text" pInputText [(ngModel)]="testimonial.department" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Content</label>
                        <textarea pTextarea [(ngModel)]="testimonial.content" rows="4" fluid></textarea>
                    </div>
                    <div>
                        <app-image-upload label="Profile Picture" folder="hiring"
                            [(currentImage)]="testimonial.avatar_url" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveTestimonial()" [loading]="saving" />
            </ng-template>
        </p-dialog>
    `
})
export class TeamStoriesPage implements OnInit {
    testimonials = signal<HiringTestimonial[]>([]);
    dialog = false;
    testimonial: HiringTestimonial = { name: '', content: '' };
    saving = false;
    mediaBaseUrl = environment.mediaBaseUrl;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadTestimonials();
    }

    loadTestimonials() {
        this.api.getHiringTestimonials().subscribe({
            next: (data) => this.testimonials.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load testimonials' })
        });
    }

    openNew() {
        this.testimonial = { name: '', content: '' };
        this.dialog = true;
    }

    editTestimonial(t: HiringTestimonial) {
        this.testimonial = { ...t };
        this.dialog = true;
    }

    hideDialog() {
        this.dialog = false;
    }

    saveTestimonial() {
        if (!this.testimonial.name?.trim() || !this.testimonial.content?.trim()) return;
        this.saving = true;
        const data = { ...this.testimonial };
        const request = data.id
            ? this.api.adminUpdate('hiring-testimonial', data.id, data)
            : this.api.adminCreate('hiring-testimonial', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Testimonial saved successfully', life: 3000 });
                this.loadTestimonials();
                this.dialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save testimonial' });
            }
        });
    }

    deleteTestimonial(t: HiringTestimonial) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${t.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!t.id) return;
                this.api.adminDelete('hiring-testimonial', t.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Testimonial deleted', life: 3000 });
                        this.loadTestimonials();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete testimonial' });
                    }
                });
            }
        });
    }
}
