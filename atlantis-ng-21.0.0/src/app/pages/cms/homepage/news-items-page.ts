import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, HomepageNewsItem, NewsCategory } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-news-items-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        TagModule, SelectModule, ConfirmDialogModule, ImageUpload
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New News Item" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="newsItems()" [rows]="10" [paginator]="true"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Excerpt</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{item.id}}</td>
                        <td>
                            <img *ngIf="item.image_url" [src]="mediaBaseUrl + item.image_url"
                                alt="{{item.title}}" class="w-16 h-12 object-cover rounded" />
                            <span *ngIf="!item.image_url" class="text-muted-color">No image</span>
                        </td>
                        <td>{{item.title}}</td>
                        <td><p-tag [value]="item.category" severity="info" /></td>
                        <td>{{item.excerpt | slice:0:60}}...</td>
                        <td>{{item.display_date}}</td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" 
                                (onClick)="editItem(item)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteItem(item)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialog" [style]="{ width: '550px' }" header="News Item" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Title</label>
                        <input type="text" pInputText [(ngModel)]="item.title" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Excerpt</label>
                        <textarea pTextarea [(ngModel)]="item.excerpt" rows="2" fluid></textarea>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Category</label>
                        <p-select [options]="categories()" [(ngModel)]="item.category" 
                            optionLabel="name" optionValue="name" placeholder="Select Category" fluid appendTo="body" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Display Date</label>
                        <input type="text" pInputText [(ngModel)]="item.display_date" placeholder="e.g. January 2024" fluid />
                    </div>
                    <div>
                        <app-image-upload label="News Image" folder="homepage"
                            [(currentImage)]="item.image_url" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveItem()" [loading]="saving" />
            </ng-template>
        </p-dialog>
    `
})
export class NewsItemsPage implements OnInit {
    newsItems = signal<HomepageNewsItem[]>([]);
    categories = signal<NewsCategory[]>([]);
    dialog = false;
    item: HomepageNewsItem = { title: '' };
    saving = false;
    mediaBaseUrl = environment.mediaBaseUrl;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadNewsItems();
        this.loadCategories();
    }

    loadNewsItems() {
        this.api.getNewsItems().subscribe({
            next: (data) => this.newsItems.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load news items' })
        });
    }

    loadCategories() {
        this.api.getNewsCategories().subscribe({
            next: (data) => this.categories.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' })
        });
    }

    openNew() {
        this.item = { title: '', sort_order: 0 };
        this.dialog = true;
    }

    editItem(t: HomepageNewsItem) {
        this.item = { ...t };
        this.dialog = true;
    }

    hideDialog() {
        this.dialog = false;
    }

    saveItem() {
        if (!this.item.title?.trim()) return;
        this.saving = true;
        const data = { ...this.item };
        const request = data.id
            ? this.api.adminUpdate('homepage-news', data.id, data)
            : this.api.adminCreate('homepage-news', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'News item saved successfully', life: 3000 });
                this.loadNewsItems();
                this.dialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save news item' });
            }
        });
    }

    deleteItem(item: HomepageNewsItem) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${item.title}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!item.id) return;
                this.api.adminDelete('homepage-news', item.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'News item deleted', life: 3000 });
                        this.loadNewsItems();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete news item' });
                    }
                });
            }
        });
    }
}
