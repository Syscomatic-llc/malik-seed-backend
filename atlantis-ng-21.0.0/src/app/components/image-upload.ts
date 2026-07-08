import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MalikApiService } from '@/app/services/malik-api.service';
import { MessageService } from 'primeng/api';
import { environment } from '@/environments/environment';

export interface UploadResult {
    url: string;
    filename: string;
}

@Component({
    selector: 'app-image-upload',
    standalone: true,
    imports: [CommonModule, FileUploadModule, ButtonModule, ProgressSpinnerModule],
    providers: [MessageService],
    template: `
        <div class="flex flex-col gap-2">
            <label *ngIf="label" class="block font-bold">{{label}}</label>
            
            <div *ngIf="currentImage" class="relative group w-fit">
                <img [src]="imageSrc" [alt]="label || 'Preview'" 
                    class="max-h-32 rounded-lg border border-surface-200 object-contain" />
                <button pButton type="button" icon="pi pi-times" 
                    class="absolute -top-2 -right-2 w-6 h-6 p-0" 
                    severity="danger" [rounded]="true" [text]="true"
                    (click)="removeImage()"></button>
            </div>

            <p-fileupload *ngIf="!currentImage" mode="basic" [chooseLabel]="placeholder" 
                chooseIcon="pi pi-upload" name="file" [customUpload]="true" 
                [auto]="true" accept="image/*" [maxFileSize]="10000000"
                (uploadHandler)="onUpload($event)" />
            
            <div *ngIf="uploading" class="flex items-center gap-2 text-sm text-muted-color">
                <p-progress-spinner [style]="{ width: '20px', height: '20px' }" />
                Uploading...
            </div>
        </div>
    `
})
export class ImageUpload {
    @Input() label?: string;
    @Input() folder: string = 'general';
    @Input() placeholder: string = 'Upload Image';
    @Input() currentImage?: string;
    @Output() currentImageChange = new EventEmitter<string | undefined>();
    @Output() uploaded = new EventEmitter<UploadResult>();

    uploading = false;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService
    ) {}

    get imageSrc(): string {
        if (!this.currentImage) return '';
        return this.currentImage.startsWith('http')
            ? this.currentImage
            : `${environment.mediaBaseUrl}${this.currentImage}`;
    }

    onUpload(event: any) {
        const file = event.files?.[0];
        if (!file) return;

        this.uploading = true;
        this.api.uploadImage(file, this.folder).subscribe({
            next: (res) => {
                this.currentImage = res.url;
                this.currentImageChange.emit(res.url);
                this.uploaded.emit({ url: res.url, filename: res.filename });
                this.uploading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Uploaded',
                    detail: 'Image uploaded successfully',
                    life: 3000
                });
            },
            error: (err) => {
                this.uploading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Upload Failed',
                    detail: err.error?.detail || 'Failed to upload image',
                    life: 5000
                });
            }
        });
    }

    removeImage() {
        this.currentImage = undefined;
        this.currentImageChange.emit(undefined);
    }
}
