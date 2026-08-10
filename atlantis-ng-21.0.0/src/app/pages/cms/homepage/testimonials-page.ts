import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, HomepageTestimonial } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { Rating } from 'primeng/rating';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-testimonials-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, InputNumberModule,
        ToastModule, ToolbarModule, Rating, ConfirmDialogModule, ImageUpload
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New Testimonial" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="testimonials()" (onRowReorder)="onRowReorder($event)"
                [rows]="100" [tableStyle]="{ 'min-width': '60rem' }">
                <ng-template #header>
                    <tr>
                        <th style="width: 3rem"></th>
                        <th>Order</th>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Content</th>
                        <th>Rating</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item let-i="rowIndex">
                    <tr [pReorderableRow]="i">
                        <td>
                            <span class="pi pi-bars" pReorderableRowHandle style="cursor: move"></span>
                        </td>
                        <td><span class="font-bold text-primary">{{item.sort_order}}</span></td>
                        <td>
                            <img *ngIf="item.avatar_url" [src]="mediaBaseUrl + item.avatar_url"
                                alt="{{item.name}}" class="w-10 h-10 rounded-full object-cover" />
                            <span *ngIf="!item.avatar_url" class="text-muted-color">No avatar</span>
                        </td>
                        <td>{{item.name}}</td>
                        <td>{{item.designation}} <span *ngIf="item.company">@ {{item.company}}</span></td>
                        <td>{{item.content | slice:0:80}}...</td>
                        <td>
                            <p-rating [ngModel]="item.rating" [readonly]="true" />
                        </td>
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
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">Name</label>
                            <input type="text" pInputText [(ngModel)]="testimonial.name" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Sort Order</label>
                            <p-inputnumber [(ngModel)]="testimonial.sort_order" [min]="0" fluid />
                        </div>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Designation</label>
                        <input type="text" pInputText [(ngModel)]="testimonial.designation" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Company</label>
                        <input type="text" pInputText [(ngModel)]="testimonial.company" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Content</label>
                        <textarea pTextarea [(ngModel)]="testimonial.content" rows="4" fluid></textarea>
                    </div>
                    <div>
                        <app-image-upload label="Avatar" folder="homepage"
                            [(currentImage)]="testimonial.avatar_url" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Rating</label>
                        <p-rating [(ngModel)]="testimonial.rating" />
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
export class TestimonialsPage implements OnInit {
    testimonials = signal<HomepageTestimonial[]>([]);
    dialog = false;
    testimonial: HomepageTestimonial = { name: '', content: '' };
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
        this.api.getTestimonials().subscribe({
            next: (data) => this.testimonials.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load testimonials' })
        });
    }

    openNew() {
        this.testimonial = { name: '', content: '', rating: 5, sort_order: 0 };
        this.dialog = true;
    }

    editTestimonial(t: HomepageTestimonial) {
        this.testimonial = { ...t };
        this.dialog = true;
    }

    hideDialog() {
        this.dialog = false;
    }

    saveTestimonial() {
        if (!this.testimonial.name?.trim() || !this.testimonial.content?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.', life: 3000 });
            return;
        }
        this.saving = true;
        const data = { ...this.testimonial };
        const request = data.id
            ? this.api.adminUpdate('homepage-testimonial', data.id, data)
            : this.api.adminCreate('homepage-testimonial', data);

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

    deleteTestimonial(t: HomepageTestimonial) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${t.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!t.id) return;
                this.api.adminDelete('homepage-testimonial', t.id).subscribe({
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

    onRowReorder(event: any) {
        const order = this.testimonials().map(t => t.id!).filter(id => id !== undefined);
        if (!order.length) return;
        this.api.reorderHomepageTestimonials(order).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Reordered', detail: 'Testimonial order saved', life: 2000 });
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to reorder testimonials' });
                this.loadTestimonials();
            }
        });
    }
}
