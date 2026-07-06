import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, NewsArticle, NewsCategory } from '@/app/services/malik-api.service';
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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-articles-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        ToggleSwitchModule, TagModule, SelectModule, ConfirmDialogModule, ImageUpload
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New Article" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="articles()" [rows]="10" [paginator]="true"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Author</th>
                        <th>Published</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{item.id}}</td>
                        <td>
                            <img *ngIf="item.featured_image" [src]="'http://localhost:8000/' + item.featured_image" 
                                alt="{{item.title}}" class="w-16 h-12 object-cover rounded" />
                            <span *ngIf="!item.featured_image" class="text-muted-color">No image</span>
                        </td>
                        <td>{{item.title}}</td>
                        <td><p-tag [value]="item.category" severity="info" /></td>
                        <td>{{item.author_name}}</td>
                        <td>
                            <p-tag [value]="item.is_published ? 'Yes' : 'No'" 
                                [severity]="item.is_published ? 'success' : 'danger'" />
                        </td>
                        <td>{{item.published_at | date:'mediumDate'}}</td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" 
                                (onClick)="editArticle(item)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteArticle(item)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialog" [style]="{ width: '650px' }" header="Article Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Title</label>
                        <input type="text" pInputText [(ngModel)]="article.title" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Slug</label>
                        <input type="text" pInputText [(ngModel)]="article.slug" placeholder="article-title" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Excerpt</label>
                        <textarea pTextarea [(ngModel)]="article.excerpt" rows="2" fluid></textarea>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Content</label>
                        <textarea pTextarea [(ngModel)]="article.content" rows="5" fluid></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">Category</label>
                            <p-select [options]="categories()" [(ngModel)]="article.category" 
                                optionLabel="name" optionValue="name" placeholder="Select Category" fluid appendTo="body" />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Author</label>
                            <input type="text" pInputText [(ngModel)]="article.author_name" fluid />
                        </div>
                    </div>
                    <div>
                        <app-image-upload label="Featured Image" folder="news"
                            [(currentImage)]="article.featured_image" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Published</label>
                        <p-toggleSwitch [(ngModel)]="article.is_published" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveArticle()" [loading]="saving" />
            </ng-template>
        </p-dialog>
    `
})
export class ArticlesPage implements OnInit {
    articles = signal<NewsArticle[]>([]);
    categories = signal<NewsCategory[]>([]);
    dialog = false;
    article: NewsArticle = { title: '', slug: '', content: '', category: '' };
    saving = false;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadArticles();
        this.loadCategories();
    }

    loadArticles() {
        this.api.getArticles().subscribe({
            next: (data) => this.articles.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load articles' })
        });
    }

    loadCategories() {
        this.api.getNewsCategories().subscribe({
            next: (data) => this.categories.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' })
        });
    }

    openNew() {
        this.article = { title: '', slug: '', content: '', category: '', is_published: false };
        this.dialog = true;
    }

    editArticle(a: NewsArticle) {
        this.article = { ...a };
        this.dialog = true;
    }

    hideDialog() {
        this.dialog = false;
    }

    saveArticle() {
        if (!this.article.title?.trim() || !this.article.slug?.trim()) return;
        this.saving = true;
        const data = { ...this.article };
        const request = data.id
            ? this.api.adminUpdate('news-article', data.id, data)
            : this.api.adminCreate('news-article', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Article saved successfully', life: 3000 });
                this.loadArticles();
                this.dialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save article' });
            }
        });
    }

    deleteArticle(a: NewsArticle) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${a.title}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!a.id) return;
                this.api.adminDelete('news-article', a.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Article deleted', life: 3000 });
                        this.loadArticles();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete article' });
                    }
                });
            }
        });
    }
}
