import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, GalleryItem } from '@/app/services/malik-api.service';
import { ImageGalleryUpload } from '@/app/components/image-gallery-upload';
import { ImageCropperDialog } from '@/app/components/image-cropper-dialog';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-gallery-items-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, ToastModule, ToolbarModule,
        ConfirmDialogModule, ImageGalleryUpload, ImageCropperDialog, DragDropModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <span class="font-bold text-lg">Gallery</span>
                </ng-template>
            </p-toolbar>

            <div class="mb-6">
                <app-image-gallery-upload label="Upload Multiple Images" folder="gallery"
                    [images]="pendingImages" (imagesChange)="onPendingImagesChange($event)"
                    [showResizeControls]="true" />
            </div>

            <p-card header="Arrange Images (drag & drop)">
                <div *ngIf="!items().length" class="text-center text-muted-color py-6">
                    No images yet. Upload some images above.
                </div>

                <div cdkDropList class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                    (cdkDropListDropped)="drop($event)">
                    <div *ngFor="let item of items(); let i = index" cdkDrag
                        class="relative group rounded-lg border border-surface-200 overflow-hidden cursor-move">
                        <img [src]="mediaBaseUrl + item.image_url" [alt]="item.title || 'Gallery image ' + (i + 1)"
                            class="w-full h-40 object-cover" />

                        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <i class="pi pi-arrows-alt text-white text-xl"></i>
                            <div class="flex gap-2">
                                <p-button icon="pi pi-pencil" severity="info" [rounded]="true" [text]="true"
                                    (onClick)="editItem(item, $event)" />
                                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [text]="true"
                                    (onClick)="deleteItem(item, $event)" />
                            </div>
                        </div>

                        <div *ngIf="item.title" class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                            {{ item.title }}
                        </div>
                    </div>
                </div>
            </p-card>

            <app-image-cropper-dialog
                [imageUrlInput]="cropImageUrl"
                [(visible)]="cropVisible"
                (cropped)="onCropped($event)"
                (cancel)="onCropCancel()" />
        </div>
    `,
    styles: [`
        .cdk-drag-preview {
            opacity: 0.9;
            transform: scale(1.05);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            border-radius: 0.5rem;
        }
        .cdk-drag-placeholder {
            opacity: 0.3;
        }
        .cdk-drag-animating {
            transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
        }
    `]
})
export class GalleryItemsPage implements OnInit {
    items = signal<GalleryItem[]>([]);
    pendingImages: string[] = [];
    mediaBaseUrl = environment.mediaBaseUrl;

    cropVisible = false;
    cropImageUrl?: string;
    cropItem?: GalleryItem;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadItems();
    }

    loadItems() {
        this.api.getGalleryItems().subscribe({
            next: (data) => this.items.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load gallery items' })
        });
    }

    onPendingImagesChange(images: string[]) {
        const previous = new Set(this.pendingImages);
        const added = images.filter(img => !previous.has(img));
        this.pendingImages = images;
        if (!added.length) return;

        const maxOrder = this.items().reduce((max, it) => Math.max(max, it.sort_order || 0), 0);
        let processed = 0;
        const errors: string[] = [];

        added.forEach((url, idx) => {
            const data = {
                title: 'Gallery Image',
                image_url: url,
                sort_order: maxOrder + idx + 1,
                is_active: true
            };
            this.api.adminCreate('gallery-item', data).subscribe({
                next: () => {
                    processed++;
                    if (processed === added.length) {
                        this.pendingImages = [];
                        this.loadItems();
                        if (!errors.length) {
                            this.messageService.add({ severity: 'success', summary: 'Added', detail: `${added.length} image(s) added to gallery`, life: 3000 });
                        }
                    }
                },
                error: (err) => {
                    processed++;
                    errors.push(err.error?.detail || 'Failed to add image');
                    if (processed === added.length) {
                        this.pendingImages = [];
                        this.loadItems();
                    }
                }
            });
        });
    }

    drop(event: CdkDragDrop<GalleryItem[]>) {
        const reordered = [...this.items()];
        moveItemInArray(reordered, event.previousIndex, event.currentIndex);
        this.items.set(reordered);

        const order = reordered.map(it => it.id).filter((id): id is number => !!id);
        this.api.reorderGalleryItems(order).subscribe({
            next: () => this.messageService.add({ severity: 'success', summary: 'Reordered', detail: 'Gallery order saved', life: 2000 }),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save gallery order' })
        });
    }

    editItem(item: GalleryItem, event: MouseEvent) {
        event.stopPropagation();
        this.cropItem = item;
        this.cropImageUrl = item.image_url?.startsWith('http')
            ? item.image_url
            : `${this.mediaBaseUrl}${item.image_url}`;
        this.cropVisible = true;
    }

    onCropped(file: File) {
        if (!this.cropItem) return;
        this.cropVisible = false;
        this.cropImageUrl = undefined;
        const item = this.cropItem;
        this.cropItem = undefined;

        this.api.uploadImage(file, 'gallery').subscribe({
            next: (res) => {
                if (!item.id) return;
                this.api.adminUpdate('gallery-item', item.id, { image_url: res.url }).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Image updated successfully', life: 3000 });
                        this.loadItems();
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to update image' })
                });
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Upload Failed', detail: err.error?.detail || 'Failed to upload cropped image' })
        });
    }

    onCropCancel() {
        this.cropVisible = false;
        this.cropImageUrl = undefined;
        this.cropItem = undefined;
    }

    deleteItem(item: GalleryItem, event: MouseEvent) {
        event.stopPropagation();
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this image?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!item.id) return;
                this.api.adminDelete('gallery-item', item.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Image deleted', life: 3000 });
                        this.loadItems();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete image' });
                    }
                });
            }
        });
    }
}
