import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MalikApiService } from '@/app/services/malik-api.service';
import { MessageService } from 'primeng/api';
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-image-gallery-upload',
    standalone: true,
    imports: [CommonModule, FileUploadModule, ButtonModule, ProgressSpinnerModule],
    providers: [MessageService],
    template: `
        <div class="flex flex-col gap-2">
            <label *ngIf="label" class="block font-bold">{{label}}</label>

            <div *ngIf="images.length" class="flex flex-wrap gap-3">
                <div *ngFor="let img of images; let i = index" class="relative group w-fit">
                    <img [src]="getSrc(img)" [alt]="label || 'Gallery image ' + (i + 1)"
                        class="h-24 w-24 rounded-lg border border-surface-200 object-cover" />
                    <button pButton type="button" icon="pi pi-times"
                        class="absolute -top-2 -right-2 w-6 h-6 p-0"
                        severity="danger" [rounded]="true" [text]="true"
                        (click)="removeImage(i)"></button>
                </div>
            </div>

            <p-fileupload mode="basic" [chooseLabel]="placeholder"
                chooseIcon="pi pi-upload" name="file" [customUpload]="true"
                [auto]="true" accept="image/*" [maxFileSize]="10000000"
                [multiple]="multiple" (uploadHandler)="onUpload($event)" />

            <div *ngIf="uploading" class="flex items-center gap-2 text-sm text-muted-color">
                <p-progress-spinner [style]="{ width: '20px', height: '20px' }" />
                Uploading...
            </div>
        </div>
    `
})
export class ImageGalleryUpload {
    @Input() label?: string;
    @Input() folder: string = 'general';
    @Input() placeholder: string = 'Upload Images';
    @Input() images: string[] = [];
    @Input() multiple: boolean = true;
    @Output() imagesChange = new EventEmitter<string[]>();

    uploading = false;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService
    ) {}

    getSrc(path: string): string {
        return path.startsWith('http') ? path : `${environment.mediaBaseUrl}${path}`;
    }

    onUpload(event: any) {
        const files: File[] = event.files || [];
        if (!files.length) return;

        this.uploading = true;
        let completed = 0;
        const newImages = [...(this.images || [])];

        files.forEach((file: File) => {
            this.api.uploadImage(file, this.folder).subscribe({
                next: (res) => {
                    newImages.push(res.url);
                    completed++;
                    if (completed === files.length) {
                        this.images = newImages;
                        this.imagesChange.emit(this.images);
                        this.uploading = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Uploaded',
                            detail: `${files.length} image(s) uploaded`,
                            life: 3000
                        });
                    }
                },
                error: (err) => {
                    completed++;
                    if (completed === files.length) {
                        this.uploading = false;
                        this.images = newImages;
                        this.imagesChange.emit(this.images);
                    }
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Upload Failed',
                        detail: err.error?.detail || `Failed to upload ${file.name}`,
                        life: 5000
                    });
                }
            });
        });
    }

    removeImage(index: number) {
        const updated = [...(this.images || [])];
        updated.splice(index, 1);
        this.images = updated;
        this.imagesChange.emit(this.images);
    }
}
