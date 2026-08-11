import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MalikApiService, HeroSlide, SiteSettings } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-hero-slides',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, 
        TableModule, DragDropModule, TagModule, DialogModule, InputTextModule, TextareaModule,
        ToggleSwitchModule, ToastModule, ToolbarModule, ConfirmDialogModule, ImageUpload
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New Slide" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="heroSlides()" (onRowReorder)="onRowReorder($event)" [rows]="100"
                [tableStyle]="{ 'min-width': '50rem' }">
                <ng-template #header>
                    <tr>
                        <th style="width: 3rem"></th>
                        <th>Order</th>
                        <th style="min-width: 16rem">Title</th>
                        <th>Background Image</th>
                        <th style="min-width: 8rem">Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-slide let-i="rowIndex">
                    <tr [pReorderableRow]="i">
                        <td><span class="pi pi-bars" pReorderableRowHandle style="cursor: move"></span></td>
                        <td><span class="font-bold text-primary">{{i + 1}}</span></td>
                        <td>{{slide.title}}</td>
                        <td>
                            <img *ngIf="slide.background_image" [src]="mediaBaseUrl + slide.background_image"
                                [alt]="slide.title" style="width: 64px" class="rounded shadow-sm" />
                            <span *ngIf="!slide.background_image" class="text-muted-color">No image</span>
                        </td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true"
                                (onClick)="editSlide(slide)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteSlide(slide)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="slideDialog" [style]="{ width: '500px' }" header="Hero Slide Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label for="title" class="block font-bold mb-2">Title</label>
                        <input type="text" pInputText id="title" [(ngModel)]="slide.title" required fluid />
                    </div>
                    <div>
                        <app-image-upload label="Background Image" folder="homepage"
                            [(currentImage)]="slide.background_image" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveSlide()" [loading]="saving" />
            </ng-template>
        </p-dialog>

        <p-card header="Hero CTA Buttons" styleClass="mt-4">
            <div class="flex flex-col gap-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-bold mb-2">Primary CTA Text</label>
                        <input type="text" pInputText [(ngModel)]="ctaSettings.hero_primary_cta_text" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Primary CTA Link</label>
                        <input type="text" pInputText [(ngModel)]="ctaSettings.hero_primary_cta_link" fluid />
                    </div>
                </div>
                <div>
                    <p-button label="Save CTA Buttons" icon="pi pi-check" severity="success" (onClick)="saveCTASettings()" [loading]="savingCTA" />
                </div>
            </div>
        </p-card>
    `
})
export class HeroSlidesPage implements OnInit {
    heroSlides = signal<HeroSlide[]>([]);
    resourceName = 'homepage-hero';
    slideDialog = false;
    slide: HeroSlide = { title: '' };
    submitted = false;
    saving = false;
    savingCTA = false;
    mediaBaseUrl = environment.mediaBaseUrl;
    ctaSettings: SiteSettings = {};

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadSlides();
        this.loadCTASettings();
    }

    loadSlides() {
        this.api.getHeroSlides().subscribe({
            next: (data) => this.heroSlides.set(data.slides),
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load hero slides'
                });
            }
        });
    }

    openNew() {
        this.slide = { title: '', is_active: true, sort_order: 0 };
        this.submitted = false;
        this.slideDialog = true;
    }


    editSlide(slide: HeroSlide) {
        this.slide = { ...slide };
        this.slideDialog = true;
    }

    hideDialog() {
        this.slideDialog = false;
        this.submitted = false;
    }

    loadCTASettings() {
        this.api.adminList('site-settings').subscribe({
            next: (data: any[]) => {
                this.ctaSettings = data[0] || {};
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load CTA settings' })
        });
    }

    saveCTASettings() {
        this.savingCTA = true;
        const data = { ...this.ctaSettings };
        const id = this.ctaSettings.id;
        const request = id
            ? this.api.adminUpdate('site-settings', id, data)
            : this.api.adminCreate('site-settings', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'CTA buttons saved successfully', life: 3000 });
                this.loadCTASettings();
                this.savingCTA = false;
            },
            error: (err) => {
                this.savingCTA = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save CTA buttons' });
            }
        });
    }

    saveSlide() {
        this.submitted = true;
        if (!this.slide.title?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.', life: 3000 });
            return;
        }

        this.saving = true;
        const data = { ...this.slide };
        const request = data.id 
            ? this.api.adminUpdate('homepage-hero', data.id, data)
            : this.api.adminCreate('homepage-hero', data);

        request.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: `Slide ${data.id ? 'updated' : 'created'} successfully`,
                    life: 3000
                });
                this.loadSlides();
                this.slideDialog = false;
                this.slide = { title: '' };
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.detail || 'Failed to save slide'
                });
            }
        });
    }

    deleteSlide(slide: HeroSlide) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${slide.title}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!slide.id) return;
                this.api.adminDelete('homepage-hero', slide.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Deleted',
                            detail: 'Slide deleted successfully',
                            life: 3000
                        });
                        this.loadSlides();
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: err.error?.detail || 'Failed to delete slide'
                        });
                    }
                });
            }
        });
    }

    onRowReorder(event: any) {
        const order = this.heroSlides().map(t => t.id!).filter(id => id !== undefined);
        if (!order.length) return;
        this.api.reorder(this.resourceName, order).subscribe({
            next: () => this.messageService.add({ severity: 'success', summary: 'Reordered', detail: 'Order saved', life: 2000 }),
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to reorder', life: 3000 });
                this.loadSlides();
            }
        });
    }
}
