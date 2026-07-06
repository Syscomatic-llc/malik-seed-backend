import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Customer } from '@/app/types/customer';
import { CustomerService } from '@/app/pages/service/customer.service';

@Component({
    selector: 'yearly-win-widget',
    standalone: true,
    imports: [CommonModule, SelectModule, TableModule, ButtonModule, FormsModule],
    template: `<div class="card widget-table">
        <div class="card-header">
            <span>Customers</span>
            <p-select [options]="orderYear" [(ngModel)]="selectedOrderYear" optionLabel="name" (onChange)="recentSales($event)"></p-select>
        </div>
        <p-table #dt [value]="customersTable()" [(selection)]="selectedCustomers1" dataKey="id" styleClass="p-datatable-customers" [rowHover]="true" [rows]="10" [paginator]="true">
            <ng-template #header>
                <tr>
                    <th pSortableColumn="representative.name">
                        <div class="flex items-center gap-2">
                            Agent
                            <p-sortIcon field="representative.name"></p-sortIcon>
                        </div>
                    </th>
                    <th pSortableColumn="country.name">
                        <div class="flex items-center gap-2">
                            Country
                            <p-sortIcon field="country.name"></p-sortIcon>
                        </div>
                    </th>
                    <th pSortableColumn="date">
                        <div class="flex items-center gap-2">
                            Date
                            <p-sortIcon field="date"></p-sortIcon>
                        </div>
                    </th>
                    <th pSortableColumn="balance">
                        <div class="flex items-center gap-2">
                            Balance
                            <p-sortIcon field="balance"></p-sortIcon>
                        </div>
                    </th>
                    <th></th>
                </tr>
            </ng-template>
            <ng-template #body let-customer>
                <tr>
                    <td style="min-width: 20rem">
                        <span class="flex gap-2">
                            <img [alt]="customer.representative.name" src="/demo/images/avatar/{{ customer.representative.image }}" width="24" style="vertical-align: middle" />
                            <span
                                class="image-text"
                                style="
                                    margin-left: 0.5em;
                                    vertical-align: middle;
                                "
                                >{{ customer.representative.name }}</span
                            >
                        </span>
                    </td>
                    <td style="min-width: 14rem">
                        <span
                            class="image-text"
                            style="
                                    margin-left: 0.5em;
                                    vertical-align: middle;
                                "
                            >{{ customer.country.name }}</span
                        >
                    </td>
                    <td style="min-width: 14rem">
                        {{ customer.date | date: 'MM/dd/yyyy' }}
                    </td>
                    <td style="min-width: 14rem">
                        {{ customer.balance | currency: 'USD' : 'symbol' }}
                    </td>
                    <td style="width: 9rem">
                        <button pButton text icon="pi pi-copy" class="w-6! h-6! mr-2"></button>
                        <button pButton text icon="pi pi-pencil" class="w-6! h-6! mr-2"></button>
                        <button pButton text icon="pi pi-ellipsis-h" class="w-6! h-6!"></button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>`
})
export class YearlyWinWidget {
    customerService = inject(CustomerService);

    orderYear: any = [
        { name: '2021', code: '0' },
        { name: '2025', code: '1' }
    ];

    selectedOrderYear: any = { name: '2021', code: '0' };

    selectedCustomers1: Customer[] = [];

    customersTable = signal<any[]>([]);

    customersTable1: any[] = [];

    customersTable2: any[] = [];

    constructor() {
        this.customerService.getCustomersLarge().then((customers) => {
            this.customersTable1 = customers.map((customer) => ({
                ...customer,
                date: new Date(customer.date)
            }));
            this.customersTable.set(this.customersTable1);
        });
        this.customerService.getCustomersMedium().then((customers) => {
            this.customersTable2 = customers.map((customer) => ({
                ...customer,
                date: new Date(customer.date)
            }));
        });
    }

    recentSales(event: any) {
        if (event.value.code === '0') {
            this.customersTable.set(this.customersTable1);
        } else {
            this.customersTable.set(this.customersTable2);
        }
    }
}
