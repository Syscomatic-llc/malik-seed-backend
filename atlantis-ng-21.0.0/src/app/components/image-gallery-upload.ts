import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputNumberModule } from 'primeng/inputnumber';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MalikApiService } from '@/app/services/malik-api.service';
import { MessageService } from 'primeng/api';
import { environment } from '@/environments/environment';
import { ImageCropperDialog } from './image-cropper-dialog';

@Component({
    selector: 'app-image-gallery-upload',
    standalone: true,
    imports: [CommonModule, FormsModule, FileUploadModule, ButtonModule, ProgressSpinnerModule, ProgressBarModule, InputNumberModule, DragDropModule, ImageCropperDialog],
    providers: [MessageService],
    template: `
        <div class="flex flex-col gap-2">
            <label *ngIf="label" class="block font-bold">{{label}}</label>

            <div *ngIf="showResizeControls" class="p-3 border border-surface-200 rounded-lg bg-surface-50 dark:bg-surface-900 flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="resize_{{uniqueId}}" [(ngModel)]="resizeEnabled" />
                    <label [for]="'resize_' + uniqueId" class="font-medium cursor-pointer">Resize images before upload</label>
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

            <div *ngIf="images.length" cdkDropList class="flex flex-wrap gap-3" (cdkDropListDropped)="drop($event)">
                <div *ngFor="let img of images; let i = index" cdkDrag class="relative group w-fit cursor-move">
                    <img [src]="getSrc(img)" [alt]="label || 'Gallery image ' + (i + 1)"
                        class="h-24 w-24 rounded-lg border border-surface-200 object-cover" />
                    <div class="absolute top-0 left-0 w-full h-full flex items-start justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i class="pi pi-arrows-alt text-white drop-shadow-md"></i>
                        <button pButton type="button" icon="pi pi-times"
                            class="w-6 h-6 p-0"
                            severity="danger" [rounded]="true" [text]="true"
                            (click)="removeImage(i)"></button>
                    </div>
                </div>
            </div>

            <p-fileupload mode="basic" [chooseLabel]="placeholder"
                chooseIcon="pi pi-upload" name="file" [customUpload]="true"
                [auto]="true" accept="image/*" [maxFileSize]="MAX_FILE_SIZE"
                [multiple]="multiple" (uploadHandler)="onUpload($event)" />

            <div *ngIf="uploadingFiles.length" class="flex flex-col gap-2 mt-2">
                <div *ngFor="let fileName of uploadingFiles" class="flex flex-col gap-1">
                    <div class="flex items-center justify-between text-xs">
                        <span class="truncate max-w-[250px]">{{ fileName }}</span>
                        <span>{{ progress[fileName] || 0 }}%</span>
                    </div>
                    <p-progressBar [value]="progress[fileName] || 0" [showValue]="false" styleClass="h-2" />
                </div>
            </div>

            <div *ngIf="uploading" class="flex items-center gap-2 text-sm text-muted-color">
                <p-progress-spinner [style]="{ width: '20px', height: '20px' }" />
                Uploading...
            </div>

            <app-image-cropper-dialog
                [imageFile]="fileToCrop"
                [(visible)]="cropVisible"
                (cropped)="onCropped($event)"
                (cancel)="onCropCancel()" />
        </div>
    `
})
export class ImageGalleryUpload {
    @Input() label?: string;
    @Input() folder: string = 'general';
    @Input() placeholder: string = 'Upload Images';
    @Input() images: string[] = [];
    @Input() multiple: boolean = true;
    @Input() showResizeControls: boolean = true;
    @Output() imagesChange = new EventEmitter<string[]>();

    MAX_FILE_SIZE = 50 * 1024 * 1024;
    uniqueId = Math.random().toString(36).substring(2, 9);

    uploading = false;
    uploadingFiles: string[] = [];
    progress: { [fileName: string]: number } = {};
    resizeEnabled = false;
    maxWidth: number = 1920;
    maxHeight: number = 1920;
    quality: number = 85;

    cropVisible = false;
    fileToCrop?: File;
    pendingFiles: File[] = [];
    private totalFilesToProcess = 0;
    private processedFiles = 0;
    private newImagesAfterCrop: string[] = [];

    constructor(
        private api: MalikApiService,
        private messageService: MessageService
    ) {}

    getSrc(path: string): string {
        return path.startsWith('http') ? path : `${environment.mediaBaseUrl}${path}`;
    }

    drop(event: CdkDragDrop<string[]>) {
        const updated = [...(this.images || [])];
        moveItemInArray(updated, event.previousIndex, event.currentIndex);
        this.images = updated;
        this.imagesChange.emit(this.images);
    }

    onUpload(event: any) {
        const files: File[] = event.files || [];
        if (!files.length) return;

        const oversized = files.filter(f => f.size > this.MAX_FILE_SIZE);
        if (oversized.length) {
            this.messageService.add({
                severity: 'error',
                summary: 'File too large',
                detail: `Each image must be under 50MB. ${oversized.length} file(s) exceeded the limit.`,
                life: 5000
            });
            return;
        }

        this.uploading = true;
        this.uploadingFiles = files.map(f => f.name);
        this.progress = {};
        this.totalFilesToProcess = files.length;
        this.processedFiles = 0;
        this.newImagesAfterCrop = [...(this.images || [])];
        this.pendingFiles = [...files];

        this.processNextFile();
    }

    private processNextFile() {
        if (this.pendingFiles.length === 0) {
            this.finishUpload(this.newImagesAfterCrop, this.totalFilesToProcess);
            return;
        }
        const file = this.pendingFiles.shift();
        if (!file) return;
        this.fileToCrop = file;
        this.cropVisible = true;
    }

    onCropped(file: File) {
        this.fileToCrop = undefined;
        this.cropVisible = false;
        this.uploadCroppedFile(file);
    }

    onCropCancel() {
        this.fileToCrop = undefined;
        this.cropVisible = false;
        this.processedFiles++;
        if (this.processedFiles === this.totalFilesToProcess) {
            this.finishUpload(this.newImagesAfterCrop, this.totalFilesToProcess);
        } else {
            this.processNextFile();
        }
    }

    private uploadCroppedFile(file: File) {
        const originalName = file.name;
        const resizeOptions = this.resizeEnabled ? { resize: true, maxWidth: this.maxWidth, maxHeight: this.maxHeight, quality: this.quality } : undefined;

        this.api.uploadImageWithProgress(file, this.folder, resizeOptions).subscribe({
            next: (event) => {
                if (event.type === 1) { // HttpEventType.UploadProgress
                    const total = event.total || file.size;
                    this.progress[originalName] = Math.round((event.loaded / total) * 100);
                } else if ((event as any).body) {
                    const res = (event as any).body;
                    this.newImagesAfterCrop.push(res.url);
                }
            },
            error: (err) => {
                this.processedFiles++;
                this.progress[originalName] = 0;
                if (this.processedFiles === this.totalFilesToProcess) {
                    this.finishUpload(this.newImagesAfterCrop, this.totalFilesToProcess);
                } else {
                    this.processNextFile();
                }
                this.messageService.add({
                    severity: 'error',
                    summary: 'Upload Failed',
                    detail: err.error?.detail || `Failed to upload ${originalName}`,
                    life: 5000
                });
            },
            complete: () => {
                this.processedFiles++;
                this.progress[originalName] = 100;
                if (this.processedFiles === this.totalFilesToProcess) {
                    this.finishUpload(this.newImagesAfterCrop, this.totalFilesToProcess);
                } else {
                    this.processNextFile();
                }
            }
        });
    }

    private finishUpload(newImages: string[], count: number) {
        this.images = newImages;
        this.imagesChange.emit(this.images);
        this.uploading = false;
        this.uploadingFiles = [];
        this.progress = {};
        this.messageService.add({
            severity: 'success',
            summary: 'Uploaded',
            detail: `${count} image(s) uploaded`,
            life: 3000
        });
    }

    removeImage(index: number) {
        const updated = [...(this.images || [])];
        updated.splice(index, 1);
        this.images = updated;
        this.imagesChange.emit(this.images);
    }
}
