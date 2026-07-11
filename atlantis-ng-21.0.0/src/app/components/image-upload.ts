import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputNumberModule } from 'primeng/inputnumber';
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
    imports: [CommonModule, FormsModule, FileUploadModule, ButtonModule, ProgressSpinnerModule, InputNumberModule],
    providers: [MessageService],
    template: `
        <div class="flex flex-col gap-2">
            <label *ngIf="label" class="block font-bold">{{label}}</label>

            <div *ngIf="showResizeControls" class="p-3 border border-surface-200 rounded-lg bg-surface-50 dark:bg-surface-900 flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="resize_{{uniqueId}}" [(ngModel)]="resizeEnabled" />
                    <label [for]="'resize_' + uniqueId" class="font-medium cursor-pointer">Resize image before upload</label>
                </div>
                <div *ngIf="resizeEnabled" class="grid grid-cols-3 gap-3">
                    <div>
                        <label class="block text-sm mb-1">Max Width (px)</label>
                        <p-inputnumber [(ngModel)]="maxWidth" [min]="1" [showButtons]="false" fluid />
                    </div>
                    <div>
                        <label class="block text-sm mb-1">Max Height (px)</label>
                        <p-inputnumber [(ngModel)]="maxHeight" [min]="1" [showButtons]="false" fluid />
                    </div>
                    <div>
                        <label class="block text-sm mb-1">Quality (%)</label>
                        <p-inputnumber [(ngModel)]="quality" [min]="1" [max]="100" [showButtons]="false" fluid />
                    </div>
                </div>
            </div>

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
                [auto]="true" accept="image/*" [maxFileSize]="MAX_FILE_SIZE"
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
    @Input() showResizeControls: boolean = false;
    @Output() currentImageChange = new EventEmitter<string | undefined>();
    @Output() uploaded = new EventEmitter<UploadResult>();

    MAX_FILE_SIZE = 10 * 1024 * 1024;
    uniqueId = Math.random().toString(36).substring(2, 9);

    uploading = false;
    resizeEnabled = false;
    maxWidth: number = 1920;
    maxHeight: number = 1920;
    quality: number = 85;

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

        if (file.size > this.MAX_FILE_SIZE) {
            this.messageService.add({
                severity: 'error',
                summary: 'File too large',
                detail: 'Maximum image size is 10MB.',
                life: 5000
            });
            return;
        }

        this.uploading = true;
        const resizeOptions = this.resizeEnabled ? { resize: true, maxWidth: this.maxWidth, maxHeight: this.maxHeight, quality: this.quality } : undefined;

        this.api.uploadImage(file, this.folder, resizeOptions).subscribe({
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
