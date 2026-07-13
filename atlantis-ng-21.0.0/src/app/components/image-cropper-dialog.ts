import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import Cropper from 'cropperjs';

@Component({
    selector: 'app-image-cropper-dialog',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule, TooltipModule],
    template: `
        <p-dialog [(visible)]="visible" [modal]="true" [draggable]="false" [resizable]="false"
            [closable]="false" header="Crop Image"
            [style]="{ width: '90vw', maxWidth: '960px' }">
            <div class="flex flex-col gap-4">
                <div class="w-full bg-surface-100 dark:bg-surface-800 rounded-lg overflow-hidden"
                    style="max-height: 55vh;">
                    <img #image [src]="imageUrl" class="block max-w-full"
                        (load)="onImageLoad()" alt="Image to crop" />
                </div>

                <div class="flex flex-wrap justify-center gap-2">
                    <p-button icon="pi pi-clone" label="Free" size="small" [text]="true"
                        (onClick)="setAspectRatio(NaN)" />
                    <p-button icon="pi pi-stop" label="1:1" size="small" [text]="true"
                        (onClick)="setAspectRatio(1)" />
                    <p-button icon="pi pi-tablet" label="16:9" size="small" [text]="true"
                        (onClick)="setAspectRatio(16 / 9)" />
                    <p-button icon="pi pi-image" label="4:3" size="small" [text]="true"
                        (onClick)="setAspectRatio(4 / 3)" />
                </div>

                <div class="flex flex-wrap justify-center gap-2">
                    <p-button icon="pi pi-undo" size="small" [text]="true"
                        (onClick)="rotate(-90)" pTooltip="Rotate left" tooltipPosition="bottom" />
                    <p-button icon="pi pi-refresh" size="small" [text]="true"
                        (onClick)="rotate(90)" pTooltip="Rotate right" tooltipPosition="bottom" />
                    <p-button icon="pi pi-arrows-h" size="small" [text]="true"
                        (onClick)="flipHorizontal()" pTooltip="Flip horizontal" tooltipPosition="bottom" />
                    <p-button icon="pi pi-arrows-v" size="small" [text]="true"
                        (onClick)="flipVertical()" pTooltip="Flip vertical" tooltipPosition="bottom" />
                    <p-button icon="pi pi-search-plus" size="small" [text]="true"
                        (onClick)="zoom(0.1)" pTooltip="Zoom in" tooltipPosition="bottom" />
                    <p-button icon="pi pi-search-minus" size="small" [text]="true"
                        (onClick)="zoom(-0.1)" pTooltip="Zoom out" tooltipPosition="bottom" />
                    <p-button icon="pi pi-replay" size="small" [text]="true"
                        (onClick)="reset()" pTooltip="Reset" tooltipPosition="bottom" />
                </div>

                <div class="flex justify-end gap-2 pt-2 border-t border-surface-200 dark:border-surface-700">
                    <p-button label="Cancel" severity="secondary" (onClick)="onCancel()" />
                    <p-button label="Crop & Use" icon="pi pi-check" severity="success" (onClick)="onCrop()" />
                </div>
            </div>
        </p-dialog>
    `
})
export class ImageCropperDialog implements OnChanges, OnDestroy {
    @ViewChild('image') imageElement?: ElementRef<HTMLImageElement>;

    @Input() imageFile?: File;
    @Input() imageUrlInput?: string;
    @Input() visible: boolean = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() cropped = new EventEmitter<File>();
    @Output() cancel = new EventEmitter<void>();

    readonly NaN = NaN;

    imageUrl?: string;
    private cropper?: Cropper;
    private scaleX = 1;
    private scaleY = 1;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['imageFile']?.currentValue && this.visible) {
            this.loadImageFile();
        }
        if (changes['imageUrlInput']?.currentValue && this.visible) {
            this.loadImageUrl();
        }
    }

    ngOnDestroy() {
        this.destroyCropper();
        this.revokeImageUrl();
    }

    onImageLoad() {
        if (this.visible) {
            this.initCropper();
        }
    }

    private loadImageFile() {
        this.revokeImageUrl();
        this.destroyCropper();
        if (this.imageFile) {
            this.imageUrl = URL.createObjectURL(this.imageFile);
        }
    }

    private loadImageUrl() {
        this.revokeImageUrl();
        this.destroyCropper();
        if (!this.imageUrlInput) return;

        // Fetch the image as a blob and create an object URL so Cropper.js can
        // read it without CORS / canvas-taint issues.
        fetch(this.imageUrlInput)
            .then((res) => res.blob())
            .then((blob) => {
                this.imageUrl = URL.createObjectURL(blob);
            })
            .catch(() => {
                // Fallback to the original URL if fetching fails.
                this.imageUrl = this.imageUrlInput;
            });
    }

    private initCropper() {
        if (!this.imageElement?.nativeElement) return;

        this.destroyCropper();
        this.scaleX = 1;
        this.scaleY = 1;

        this.cropper = new Cropper(this.imageElement.nativeElement, {
            viewMode: 1,
            dragMode: 'crop',
            autoCropArea: 0.8,
            responsive: true,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            aspectRatio: NaN,
            background: false
        });
    }

    setAspectRatio(ratio: number) {
        this.cropper?.setAspectRatio(ratio);
    }

    rotate(deg: number) {
        this.cropper?.rotate(deg);
    }

    flipHorizontal() {
        this.scaleX = -this.scaleX;
        this.cropper?.scaleX(this.scaleX);
    }

    flipVertical() {
        this.scaleY = -this.scaleY;
        this.cropper?.scaleY(this.scaleY);
    }

    zoom(ratio: number) {
        this.cropper?.zoom(ratio);
    }

    reset() {
        this.cropper?.reset();
        this.scaleX = 1;
        this.scaleY = 1;
    }

    onCrop() {
        if (!this.cropper) return;

        const canvas = this.cropper.getCroppedCanvas({
            fillColor: '#fff',
            maxWidth: 4096,
            maxHeight: 4096
        });

        let originalType = 'image/png';
        let originalName = 'cropped-image';

        if (this.imageFile) {
            originalType = this.imageFile.type || originalType;
            originalName = this.imageFile.name || originalName;
        } else if (this.imageUrlInput) {
            const url = this.imageUrlInput;
            const pathname = url.split('?')[0];
            const ext = pathname.split('.').pop()?.toLowerCase();
            const matchedType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : ext === 'png' ? 'image/png' : 'image/png';
            originalType = matchedType;
            const nameFromPath = pathname.substring(pathname.lastIndexOf('/') + 1) || 'cropped-image';
            originalName = nameFromPath;
        } else {
            return;
        }

        canvas.toBlob((blob) => {
            if (!blob) return;

            let fileName = originalName;
            const hasExtension = /\.[^/.]+$/.test(originalName);
            if (!hasExtension) {
                const ext = originalType === 'image/png' ? 'png' : 'jpg';
                fileName = `${originalName}.${ext}`;
            }

            const croppedFile = new File([blob], fileName, { type: blob.type || originalType });
            this.cropped.emit(croppedFile);
            this.close();
        }, originalType, 0.92);
    }

    onCancel() {
        this.cancel.emit();
        this.close();
    }

    private close() {
        this.visible = false;
        this.visibleChange.emit(false);
        this.destroyCropper();
        this.revokeImageUrl();
    }

    private destroyCropper() {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = undefined;
        }
    }

    private revokeImageUrl() {
        if (this.imageUrl) {
            URL.revokeObjectURL(this.imageUrl);
            this.imageUrl = undefined;
        }
    }
}
