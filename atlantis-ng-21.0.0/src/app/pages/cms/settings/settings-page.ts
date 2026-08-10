import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, SiteSettings, PageSEO, Sitemap, CMSUser } from '@/app/services/malik-api.service';
import { AuthService } from '@/app/services/auth.service';
import { ImageUpload } from '@/app/components/image-upload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-settings-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule,
        TextareaModule, ToastModule, ToggleSwitchModule, DividerModule, TabsModule,
        TableModule, DialogModule, SelectModule, ConfirmDialogModule, ImageUpload
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <p-card header="Settings">
            <p-tabs value="0">
                <p-tablist>
                    <p-tab value="0">Site Settings</p-tab>
                    <p-tab value="1">SEO Pages</p-tab>
                    <p-tab value="2">Sitemap</p-tab>
                    <p-tab value="3">Users</p-tab>
                </p-tablist>
                <p-tabpanels>
                    <!-- SITE SETTINGS -->
                    <p-tabpanel value="0">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 lg:col-span-8">
                            <p-card header="General">
                                <div class="flex flex-col gap-4">
                                    <div>
                                        <label class="block font-bold mb-2">Site Name</label>
                                        <input type="text" pInputText [(ngModel)]="settings.site_name" fluid />
                                    </div>
                                    <div>
                                        <label class="block font-bold mb-2">Site Tagline</label>
                                        <input type="text" pInputText [(ngModel)]="settings.site_tagline" fluid />
                                    </div>
                                    <div>
                                        <label class="block font-bold mb-2">Site Description</label>
                                        <textarea pTextarea [(ngModel)]="settings.site_description" rows="3" fluid></textarea>
                                    </div>
                                    <div>
                                        <app-image-upload label="Logo" folder="site" [(currentImage)]="settings.logo_url" />
                                    </div>
                                </div>
                            </p-card>
                        </div>
                        <div class="col-span-12 lg:col-span-4 flex flex-col gap-4">
                            <p-card header="SEO & Tools">
                                <div class="flex flex-col gap-4">
                                    <div>
                                        <label class="block font-bold mb-2">Google Analytics ID</label>
                                        <input type="text" pInputText [(ngModel)]="settings.google_analytics_id" placeholder="G-XXXXXXXXXX" fluid />
                                    </div>
                                    <div>
                                        <label class="block font-bold mb-2">Google Search Console Verification</label>
                                        <textarea pTextarea [(ngModel)]="settings.google_search_console_verification" rows="3" placeholder="Paste meta tag or verification code here" fluid></textarea>
                                    </div>
                                    <div>
                                        <label class="block font-bold mb-2">Maintenance Mode</label>
                                        <p-toggleSwitch [(ngModel)]="settings.maintenance_mode" />
                                    </div>
                                </div>
                            </p-card>
                            <p-card header="Preview">
                                <div class="flex flex-col gap-3">
                                    <div *ngIf="settings.logo_url" class="flex justify-center">
                                        <img [src]="mediaBaseUrl + settings.logo_url" alt="Logo" class="h-16 object-contain" />
                                    </div>
                                    <h3 class="text-xl font-bold">{{settings.site_name}}</h3>
                                    <p class="text-muted-color">{{settings.site_tagline}}</p>
                                </div>
                            </p-card>
                        </div>
                    </div>
                    <div class="mt-4">
                        <p-button label="Save Site Settings" icon="pi pi-check" severity="success" (onClick)="saveSettings()" [loading]="saving" />
                    </div>
                </p-tabpanel>

                <!-- SEO PAGES -->
                <p-tabpanel value="1">
                    <p-button label="New SEO Entry" icon="pi pi-plus" severity="success" class="mb-4" (onClick)="openSEODialog()" />
                    <p-table [value]="seoList" [rows]="10" [paginator]="true" [tableStyle]="{'min-width': '60rem'}">
                        <ng-template #header>
                            <tr>
                                <th>Page Path</th>
                                <th>Meta Title</th>
                                <th>Meta Description</th>
                                <th>Active</th>
                                <th style="min-width: 8rem">Actions</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-item>
                            <tr>
                                <td>{{item.page_path}}</td>
                                <td>{{item.meta_title}}</td>
                                <td>{{item.meta_description | slice:0:60}}{{item.meta_description?.length > 60 ? '...' : ''}}</td>
                                <td>{{item.is_active ? 'Yes' : 'No'}}</td>
                                <td>
                                    <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (onClick)="editSEO(item)" />
                                    <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (onClick)="deleteSEO(item)" />
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </p-tabpanel>

                <!-- SITEMAP -->
                <p-tabpanel value="2">
                    <div class="flex items-center justify-between mb-4">
                        <p-button label="New Sitemap URL" icon="pi pi-plus" severity="success" (onClick)="openSitemapDialog()" />
                        <a [href]="apiUrl + '/sitemap.xml'" target="_blank" class="text-primary hover:underline">View sitemap.xml</a>
                    </div>
                    <p-table [value]="sitemapList" [rows]="10" [paginator]="true" [tableStyle]="{'min-width': '60rem'}"
                        [loading]="loadingSitemap" loadingIcon="pi pi-spin pi-spinner">
                        <ng-template #header>
                            <tr>
                                <th>URL Path</th>
                                <th>Last Modified</th>
                                <th>Change Freq</th>
                                <th>Priority</th>
                                <th>Active</th>
                                <th style="min-width: 8rem">Actions</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-item>
                            <tr>
                                <td>{{item.url_path}}</td>
                                <td>{{item.last_modified | date:'mediumDate'}}</td>
                                <td>{{item.changefreq}}</td>
                                <td>{{item.priority}}</td>
                                <td>{{item.is_active ? 'Yes' : 'No'}}</td>
                                <td>
                                    <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (onClick)="editSitemap(item)" />
                                    <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (onClick)="deleteSitemap(item)" [loading]="savingSitemap && selectedSitemap?.id === item.id" />
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </p-tabpanel>

                <!-- USERS -->
                <p-tabpanel value="3">
                    <p-button label="New User" icon="pi pi-plus" severity="success" class="mb-4" (onClick)="openUserDialog()" />
                    <p-table [value]="userList" [rows]="10" [paginator]="true" [tableStyle]="{'min-width': '60rem'}">
                        <ng-template #header>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th style="min-width: 10rem">Actions</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-item>
                            <tr>
                                <td>{{item.first_name}} {{item.last_name}}</td>
                                <td>{{item.email}}</td>
                                <td>{{item.role}}</td>
                                <td>{{item.status}}</td>
                                <td>
                                    <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (onClick)="editUser(item)" />
                                    <p-button icon="pi pi-lock" severity="secondary" class="mr-2" [rounded]="true" [outlined]="true" (onClick)="openPasswordDialog(item)" />
                                    <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (onClick)="deleteUser(item)" />
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </p-tabpanel>
            </p-tabpanels>
        </p-tabs>
        </p-card>

        <!-- SEO Dialog -->
        <p-dialog [(visible)]="seoDialog" [style]="{width: '600px'}" header="SEO Page Details" [modal]="true">
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block font-bold mb-2">Page Path</label>
                    <input type="text" pInputText [(ngModel)]="seo.page_path" placeholder="e.g. /our-story" fluid />
                </div>
                <div>
                    <label class="block font-bold mb-2">Title</label>
                    <input type="text" pInputText [(ngModel)]="seo.title" fluid />
                </div>
                <div>
                    <label class="block font-bold mb-2">Meta Title</label>
                    <input type="text" pInputText [(ngModel)]="seo.meta_title" fluid />
                </div>
                <div>
                    <label class="block font-bold mb-2">Meta Description</label>
                    <textarea pTextarea [(ngModel)]="seo.meta_description" rows="3" fluid></textarea>
                </div>
                <div>
                    <label class="block font-bold mb-2">Meta Keywords</label>
                    <input type="text" pInputText [(ngModel)]="seo.meta_keywords" fluid />
                </div>
                <div>
                    <app-image-upload label="OG Image" folder="site" [(currentImage)]="seo.og_image" />
                </div>
                <div>
                    <label class="block font-bold mb-2">OG Title</label>
                    <input type="text" pInputText [(ngModel)]="seo.og_title" fluid />
                </div>
                <div>
                    <label class="block font-bold mb-2">OG Description</label>
                    <textarea pTextarea [(ngModel)]="seo.og_description" rows="2" fluid></textarea>
                </div>
                <div>
                    <label class="block font-bold mb-2">Active</label>
                    <p-toggleSwitch [(ngModel)]="seo.is_active" />
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="seoDialog = false" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveSEO()" />
            </ng-template>
        </p-dialog>

        <!-- Sitemap Dialog -->
        <p-dialog [(visible)]="sitemapDialog" [style]="{width: '500px'}" header="Sitemap Entry" [modal]="true">
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block font-bold mb-2">URL Path</label>
                    <input type="text" pInputText [(ngModel)]="sitemap.url_path" placeholder="e.g. /our-story or https://..." fluid />
                </div>
                <div>
                    <label class="block font-bold mb-2">Last Modified</label>
                    <input type="date" pInputText [(ngModel)]="sitemap.last_modified" fluid />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-bold mb-2">Change Frequency</label>
                        <p-select [options]="freqOptions" [(ngModel)]="sitemap.changefreq" placeholder="Select" styleClass="w-full" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Priority</label>
                        <p-select [options]="priorityOptions" [(ngModel)]="sitemap.priority" placeholder="Select" styleClass="w-full" />
                    </div>
                </div>
                <div>
                    <label class="block font-bold mb-2">Active</label>
                    <p-toggleSwitch [(ngModel)]="sitemap.is_active" />
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="sitemapDialog = false" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveSitemap()" [loading]="savingSitemap" />
            </ng-template>
        </p-dialog>

        <!-- User Dialog -->
        <p-dialog [(visible)]="userDialog" [style]="{width: '500px'}" header="User Details" [modal]="true">
            <div class="flex flex-col gap-4">
                <div>
                    <app-image-upload label="Avatar" folder="team" [(currentImage)]="user.avatar_url" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-bold mb-2">First Name</label>
                        <input type="text" pInputText [(ngModel)]="user.first_name" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Last Name</label>
                        <input type="text" pInputText [(ngModel)]="user.last_name" fluid />
                    </div>
                </div>
                <div>
                    <label class="block font-bold mb-2">Email</label>
                    <input type="email" pInputText [(ngModel)]="user.email" fluid />
                </div>
                <div>
                    <label class="block font-bold mb-2">Phone</label>
                    <input type="text" pInputText [(ngModel)]="user.phone" fluid />
                </div>
                <div *ngIf="!user.id" class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-bold mb-2">Password</label>
                        <input type="password" pInputText [(ngModel)]="userPassword" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Confirm Password</label>
                        <input type="password" pInputText [(ngModel)]="userPasswordConfirm" fluid />
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-bold mb-2">Role</label>
                        <p-select [options]="roleOptions" [(ngModel)]="user.role" placeholder="Select" styleClass="w-full" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Status</label>
                        <p-select [options]="statusOptions" [(ngModel)]="user.status" placeholder="Select" styleClass="w-full" />
                    </div>
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="userDialog = false" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveUser()" />
            </ng-template>
        </p-dialog>

        <!-- Password Dialog -->
        <p-dialog [(visible)]="passwordDialog" [style]="{width: '400px'}" header="Reset Password" [modal]="true">
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block font-bold mb-2">New Password</label>
                    <input type="password" pInputText [(ngModel)]="resetPassword" fluid />
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="passwordDialog = false" />
                <p-button label="Reset" icon="pi pi-check" severity="warn" (onClick)="savePassword()" />
            </ng-template>
        </p-dialog>
    `
})
export class SettingsPage implements OnInit {
    settings: SiteSettings = {};
    saving = false;
    mediaBaseUrl = environment.mediaBaseUrl;
    apiUrl = environment.apiBaseUrl;

    // SEO
    seoList: PageSEO[] = [];
    seoDialog = false;
    seo: PageSEO = { page_path: '', is_active: true };

    // Sitemap
    sitemapList: Sitemap[] = [];
    sitemapDialog = false;
    sitemap: Sitemap = { url_path: '', changefreq: 'monthly', priority: '0.5', is_active: true };
    loadingSitemap = false;
    savingSitemap = false;
    selectedSitemap: Sitemap | null = null;
    freqOptions = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
    priorityOptions = ['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1', '0.0'];

    // Users
    userList: CMSUser[] = [];
    userDialog = false;
    passwordDialog = false;
    user: any = { role: 'editor', status: 'active' };
    selectedUser: CMSUser | null = null;
    userPassword = '';
    userPasswordConfirm = '';
    resetPassword = '';
    roleOptions = ['admin', 'editor', 'applicant', 'user'];
    statusOptions = ['active', 'inactive', 'pending', 'suspended'];

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.loadSettings();
        this.loadSEO();
        this.loadSitemap();
        this.loadUsers();
    }

    // ---- Site Settings ----
    loadSettings() {
        this.api.adminList('site-settings').subscribe({
            next: (data: any[]) => {
                this.settings = data[0] || {};
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load settings' })
        });
    }

    saveSettings() {
        this.saving = true;
        const data = { ...this.settings };
        const id = this.settings.id;
        const request = id
            ? this.api.adminUpdate('site-settings', id, data)
            : this.api.adminCreate('site-settings', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Settings saved successfully', life: 3000 });
                this.loadSettings();
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save settings' });
            }
        });
    }

    // ---- SEO ----
    loadSEO() {
        this.api.getPageSEOList().subscribe({
            next: (data) => this.seoList = data,
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load SEO entries' })
        });
    }

    openSEODialog() {
        this.seo = { page_path: '', is_active: true };
        this.seoDialog = true;
    }

    editSEO(item: PageSEO) {
        this.seo = { ...item };
        this.seoDialog = true;
    }

    saveSEO() {
        if (!this.seo.page_path?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Page path is required' });
            return;
        }
        const request = this.seo.id
            ? this.api.updatePageSEO(this.seo.id, this.seo)
            : this.api.createPageSEO(this.seo);
        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'SEO entry saved', life: 3000 });
                this.seoDialog = false;
                this.loadSEO();
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save SEO' })
        });
    }

    deleteSEO(item: PageSEO) {
        if (!item.id) return;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this SEO entry?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.api.deletePageSEO(item.id!).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'SEO entry deleted', life: 3000 });
                        this.loadSEO();
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete SEO entry' })
                });
            }
        });
    }

    // ---- Sitemap ----
    loadSitemap() {
        this.loadingSitemap = true;
        this.api.getSitemapList().subscribe({
            next: (data) => {
                this.sitemapList = data;
                this.loadingSitemap = false;
            },
            error: () => {
                this.loadingSitemap = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load sitemap entries' })
            }
        });
    }

    openSitemapDialog() {
        this.sitemap = { url_path: '', changefreq: 'monthly', priority: '0.5', is_active: true };
        this.sitemapDialog = true;
    }

    editSitemap(item: Sitemap) {
        this.sitemap = { ...item };
        // Ensure date input receives YYYY-MM-DD string
        if (this.sitemap.last_modified) {
            this.sitemap.last_modified = (this.sitemap.last_modified as any).split('T')[0];
        }
        this.sitemapDialog = true;
    }

    saveSitemap() {
        if (!this.sitemap.url_path?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'URL path is required' });
            return;
        }
        this.savingSitemap = true;
        const request = this.sitemap.id
            ? this.api.updateSitemap(this.sitemap.id, this.sitemap)
            : this.api.createSitemap(this.sitemap);
        request.subscribe({
            next: () => {
                this.savingSitemap = false;
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Sitemap entry saved', life: 3000 });
                this.sitemapDialog = false;
                this.loadSitemap();
            },
            error: (err) => {
                this.savingSitemap = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save sitemap entry' })
            }
        });
    }

    deleteSitemap(item: Sitemap) {
        if (!item.id) return;
        this.selectedSitemap = item;
        this.savingSitemap = true;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this sitemap entry?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.api.deleteSitemap(item.id!).subscribe({
                    next: () => {
                        this.savingSitemap = false;
                        this.selectedSitemap = null;
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Sitemap entry deleted', life: 3000 });
                        this.loadSitemap();
                    },
                    error: () => {
                        this.savingSitemap = false;
                        this.selectedSitemap = null;
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete sitemap entry' })
                    }
                });
            },
            reject: () => {
                this.savingSitemap = false;
                this.selectedSitemap = null;
            }
        });
    }

    // ---- Users ----
    loadUsers() {
        this.api.getUsers().subscribe({
            next: (data) => this.userList = data,
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' })
        });
    }

    openUserDialog() {
        this.user = { role: 'editor', status: 'active' };
        this.userPassword = '';
        this.userPasswordConfirm = '';
        this.userDialog = true;
    }

    editUser(item: CMSUser) {
        this.user = { ...item };
        this.userPassword = '';
        this.userPasswordConfirm = '';
        this.userDialog = true;
    }

    saveUser() {
        if (!this.user.first_name?.trim() || !this.user.last_name?.trim() || !this.user.email?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Name and email are required' });
            return;
        }
        if (!this.user.id) {
            if (!this.userPassword || this.userPassword.length < 6) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Password must be at least 6 characters' });
                return;
            }
            if (this.userPassword !== this.userPasswordConfirm) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match' });
                return;
            }
        }
        const payload = { ...this.user, password: this.userPassword || undefined };
        const request = this.user.id
            ? this.api.updateUser(this.user.id, payload)
            : this.api.createUser(payload);
        request.subscribe({
            next: (saved: CMSUser) => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'User saved', life: 3000 });
                this.userDialog = false;
                this.loadUsers();

                // If the admin updated their own profile, refresh the topbar avatar.
                const current = this.authService.user();
                if (current && saved.id === current.id) {
                    const updated = { ...current, ...saved };
                    this.authService.user.set(updated);
                    localStorage.setItem('cms_user', JSON.stringify(updated));
                }
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save user' })
        });
    }

    openPasswordDialog(item: CMSUser) {
        this.selectedUser = item;
        this.resetPassword = '';
        this.passwordDialog = true;
    }

    savePassword() {
        if (!this.resetPassword || this.resetPassword.length < 6) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Password must be at least 6 characters' });
            return;
        }
        if (!this.selectedUser?.id) return;
        this.api.updateUserPassword(this.selectedUser.id, this.resetPassword).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Password updated', life: 3000 });
                this.passwordDialog = false;
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to update password' })
        });
    }

    deleteUser(item: CMSUser) {
        if (!item.id) return;
        this.confirmationService.confirm({
            message: `Are you sure you want to delete user "${item.email}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.api.deleteUser(item.id!).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'User deleted', life: 3000 });
                        this.loadUsers();
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user' })
                });
            }
        });
    }
}
