import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, OfficeLocation } from '@/app/services/malik-api.service';
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-locations-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        ToggleSwitchModule, TagModule, ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New Location" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="locations()" [rows]="10" [paginator]="true"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>City</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>HQ</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{item.id}}</td>
                        <td>{{item.name}}</td>
                        <td>{{item.address | slice:0:40}}...</td>
                        <td>{{item.city}}</td>
                        <td>{{item.phone}}</td>
                        <td>{{item.email}}</td>
                        <td>
                            <p-tag [value]="item.is_headquarters ? 'Yes' : 'No'" 
                                [severity]="item.is_headquarters ? 'success' : 'secondary'" />
                        </td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" 
                                (onClick)="editLocation(item)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteLocation(item)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialog" [style]="{ width: '500px' }" header="Office Location" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Name</label>
                        <input type="text" pInputText [(ngModel)]="location.name" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Address</label>
                        <textarea pTextarea [(ngModel)]="location.address" rows="2" fluid></textarea>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">City</label>
                        <input type="text" pInputText [(ngModel)]="location.city" fluid />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">Phone</label>
                            <input type="text" pInputText [(ngModel)]="location.phone" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Email</label>
                            <input type="text" pInputText [(ngModel)]="location.email" fluid />
                        </div>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Headquarters</label>
                        <p-toggleSwitch [(ngModel)]="location.is_headquarters" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveLocation()" [loading]="saving" />
            </ng-template>
        </p-dialog>
    `
})
export class LocationsPage implements OnInit {
    locations = signal<OfficeLocation[]>([]);
    dialog = false;
    location: OfficeLocation = { name: '', address: '', city: '' };
    saving = false;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadLocations();
    }

    loadLocations() {
        this.api.getLocations().subscribe({
            next: (data) => this.locations.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load locations' })
        });
    }

    openNew() {
        this.location = { name: '', address: '', city: '', is_headquarters: false };
        this.dialog = true;
    }

    editLocation(l: OfficeLocation) {
        this.location = { ...l };
        this.dialog = true;
    }

    hideDialog() {
        this.dialog = false;
    }

    saveLocation() {
        if (!this.location.name?.trim() || !this.location.address?.trim() || !this.location.city?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.', life: 3000 });
            return;
        }
        this.saving = true;
        const data = { ...this.location };
        const request = data.id
            ? this.api.adminUpdate('office-location', data.id, data)
            : this.api.adminCreate('office-location', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Location saved successfully', life: 3000 });
                this.loadLocations();
                this.dialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save location' });
            }
        });
    }

    deleteLocation(l: OfficeLocation) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${l.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!l.id) return;
                this.api.adminDelete('office-location', l.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Location deleted', life: 3000 });
                        this.loadLocations();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete location' });
                    }
                });
            }
        });
    }
}
