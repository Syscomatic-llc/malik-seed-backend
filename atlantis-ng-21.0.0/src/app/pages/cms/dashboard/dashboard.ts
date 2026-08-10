import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MalikApiService, ActivityLog } from '@/app/services/malik-api.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-cms-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, CardModule, ButtonModule, TableModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
                <p-card styleClass="h-full bg-primary/5">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-muted-color text-sm font-medium">Users</div>
                            <div class="text-3xl font-bold text-primary mt-1">{{stats.users}}</div>
                        </div>
                        <i class="pi pi-users text-primary text-3xl"></i>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
                <p-card styleClass="h-full bg-green-500/5">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-muted-color text-sm font-medium">Articles</div>
                            <div class="text-3xl font-bold text-green-600 mt-1">{{stats.articles}}</div>
                        </div>
                        <i class="pi pi-file-edit text-green-600 text-3xl"></i>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
                <p-card styleClass="h-full bg-orange-500/5">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-muted-color text-sm font-medium">Categories</div>
                            <div class="text-3xl font-bold text-orange-600 mt-1">{{stats.categories}}</div>
                        </div>
                        <i class="pi pi-folder text-orange-600 text-3xl"></i>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
                <p-card styleClass="h-full bg-blue-500/5">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-muted-color text-sm font-medium">Gallery Images</div>
                            <div class="text-3xl font-bold text-blue-600 mt-1">{{stats.gallery}}</div>
                        </div>
                        <i class="pi pi-images text-blue-600 text-3xl"></i>
                    </div>
                </p-card>
            </div>

            <div class="col-span-12 lg:col-span-8">
                <p-card header="Recent Activity">
                    <p-table [value]="logs" [rows]="10" [paginator]="true"
                        [tableStyle]="{ 'min-width': '50rem' }">
                        <ng-template #header>
                            <tr>
                                <th>Time</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Resource</th>
                                <th>Name</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-log>
                            <tr>
                                <td>{{log.created_at | date:'medium'}}</td>
                                <td>{{log.user_email || 'System'}}</td>
                                <td>
                                    <span class="px-2 py-1 rounded text-xs font-medium"
                                        [ngClass]="actionClass(log.action)">
                                        {{log.action | titlecase}}
                                    </span>
                                </td>
                                <td>{{log.resource_type}}</td>
                                <td>{{log.resource_name}}</td>
                            </tr>
                        </ng-template>
                        <ng-template #emptymessage>
                            <tr>
                                <td colspan="5" class="text-center text-muted-color py-4">No recent activity</td>
                            </tr>
                        </ng-template>
                    </p-table>
                </p-card>
            </div>

            <div class="col-span-12 lg:col-span-4">
                <p-card header="Quick Links" styleClass="h-full">
                    <div class="flex flex-col gap-2">
                        <a [routerLink]="['/cms/homepage/hero']" class="p-2 rounded hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center gap-2">
                            <i class="pi pi-image text-primary"></i> Hero Slides
                        </a>
                        <a [routerLink]="['/cms/news/articles']" class="p-2 rounded hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center gap-2">
                            <i class="pi pi-file-edit text-green-600"></i> Articles
                        </a>
                        <a [routerLink]="['/cms/gallery/items']" class="p-2 rounded hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center gap-2">
                            <i class="pi pi-images text-blue-600"></i> Gallery
                        </a>
                        <a [routerLink]="['/cms/settings']" class="p-2 rounded hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center gap-2">
                            <i class="pi pi-cog text-orange-600"></i> Settings
                        </a>
                    </div>
                </p-card>
            </div>
        </div>
    `
})
export class CmsDashboardPage implements OnInit {
    logs: ActivityLog[] = [];
    stats = { users: 0, articles: 0, categories: 0, gallery: 0 };

    constructor(
        private api: MalikApiService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        // Defer log loading to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => this.loadActivityLogs(), 0);
        this.loadStats();
    }

    loadActivityLogs() {
        this.api.getActivityLogs().subscribe({
            next: (data) => this.logs = data,
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load activity logs' })
        });
    }

    loadStats() {
        this.api.getUsers().subscribe({
            next: (users) => this.stats.users = users.length,
            error: () => {}
        });
        this.api.adminList('news-article').subscribe({
            next: (items: any[]) => this.stats.articles = items.length,
            error: () => {}
        });
        this.api.adminList('news-category').subscribe({
            next: (items: any[]) => this.stats.categories = items.length,
            error: () => {}
        });
        this.api.adminList('gallery-item').subscribe({
            next: (items: any[]) => this.stats.gallery = items.length,
            error: () => {}
        });
    }

    actionClass(action: string): string {
        switch (action) {
            case 'create': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
            case 'update': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
            case 'delete': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
            case 'login': return 'bg-primary/10 text-primary';
            default: return 'bg-surface-100 text-surface-700';
        }
    }
}
