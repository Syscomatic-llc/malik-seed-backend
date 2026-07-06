import { afterNextRender, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { LayoutService } from '@/app/layout/service/layout.service';

@Component({
    selector: 'weekly-new-customers-widget',
    standalone: true,
    imports: [FormsModule, SelectModule, ChartModule],
    template: `<div class="card widget-customer-graph">
        <div class="header">
            <div class="flex justify-between leading-loose">
                <span>Weekly New Customers</span>
                <p-select [options]="customerYear" [(ngModel)]="selectedCustomerYear" optionLabel="name" (onChange)="changeCustomerChart($event); customer.refresh()" />
            </div>
            <p class="text-sm text-surface-500 dark:text-surface-400">Number of new customer are listed by weekly</p>
        </div>

        <div class="content grid grid-cols-12 gap-4 p-nogutter mt-4">
            <div class="col-span-12 md:col-span-6 grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-4 flex items-center">
                    <h2 class="mb-0">{{ customerMax() }}</h2>
                    <p class="ml-2 text-surface-500 dark:text-surface-400 text-sm leading-none">MAX</p>
                </div>
                <div class="col-span-12 md:col-span-4 flex items-center">
                    <h2 class="mb-0">{{ customerMin() }}</h2>
                    <p class="ml-2 text-surface-500 dark:text-surface-400 text-sm leading-none">MIN</p>
                </div>
                <div class="col-span-12 md:col-span-4 flex items-center">
                    <h2 class="mb-0" style="color: #fc6161">
                        {{ customerAvg() }}
                    </h2>
                    <p class="ml-2 text-surface-500 dark:text-surface-400 text-sm leading-none">AVARAGE</p>
                </div>
            </div>
        </div>

        <p-chart #customer height="426" type="bar" [data]="customerChart()" [options]="customerChartOptions()" id="customer-chart"></p-chart>
    </div>`
})
export class WeeklyNewCustomersWidget {
    layoutService = inject(LayoutService);

    selectedCustomerYear: any;

    customerChart = signal<any>(null);

    customerChartOptions = signal<any>(null);

    customerYear = [
        { name: '2025', code: '0' },
        { name: '2024', code: '1' }
    ];

    customerMax = signal('1232');

    customerMin = signal('284');

    customerAvg = signal('875');

    constructor() {
        afterNextRender(() => {
            setTimeout(() => {
                this.initChart();
            }, 150);
        });

        effect(() => {
            this.layoutService.layoutConfig().darkTheme;
            setTimeout(() => {
                this.initChart();
            }, 150);
        });
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.customerChart.set({
            labels: ['January', 'March', 'May', 'Agust', 'October', 'December'],
            datasets: [
                {
                    data: [10, 25, 48, 35, 54, 70],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [18, 35, 23, 30, 59, 65],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [20, 47, 46, 46, 61, 70],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [17, 34, 18, 48, 67, 68],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-600'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [9, 37, 47, 50, 60, 62],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [8, 48, 40, 52, 72, 75],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [10, 18, 50, 47, 63, 80],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [20, 36, 39, 58, 59, 85],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [30, 45, 35, 50, 54, 81],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [28, 35, 52, 56, 60, 77],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [40, 40, 38, 45, 68, 86],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-600'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [50, 23, 27, 34, 65, 90],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [29, 27, 29, 42, 55, 84],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [10, 37, 47, 29, 59, 80],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [10, 54, 42, 38, 63, 83],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [25, 44, 50, 56, 65, 92],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [30, 43, 48, 45, 73, 78],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [29, 47, 54, 60, 77, 86],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                }
            ]
        });

        this.customerChartOptions.set({
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: textColor
                    },
                    display: false
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        display: false
                    }
                }
            }
        });

        this.selectedCustomerYear = this.customerYear[0];
    }

    changeCustomerChart(event: any) {
        const dataSet1 = [
            [10, 25, 48, 35, 54, 70],
            [18, 35, 23, 30, 59, 65],
            [20, 47, 46, 46, 61, 70],
            [17, 34, 18, 48, 67, 68],
            [9, 37, 47, 50, 60, 62],
            [8, 48, 40, 52, 72, 75],
            [10, 18, 50, 47, 63, 80],
            [20, 36, 39, 58, 59, 85],
            [30, 45, 35, 50, 54, 81],
            [28, 35, 52, 56, 60, 77],
            [40, 40, 38, 45, 68, 86],
            [50, 23, 27, 34, 65, 90],
            [29, 27, 29, 42, 55, 84],
            [10, 37, 47, 29, 59, 80],
            [10, 54, 42, 38, 63, 83],
            [25, 44, 50, 56, 65, 92],
            [30, 43, 48, 45, 73, 78],
            [29, 47, 54, 60, 77, 86]
        ];
        const dataSet2 = [
            [10, 25, 48, 35, 54, 70],
            [20, 47, 46, 46, 61, 70],
            [17, 34, 18, 48, 67, 68],
            [50, 23, 27, 34, 65, 90],
            [8, 48, 40, 52, 72, 75],
            [9, 37, 47, 50, 60, 62],
            [10, 18, 50, 47, 63, 80],
            [30, 45, 35, 50, 54, 81],
            [10, 37, 47, 29, 59, 80],
            [28, 35, 52, 56, 60, 77],
            [25, 44, 50, 56, 65, 92],
            [18, 35, 23, 30, 59, 65],
            [20, 36, 39, 58, 59, 85],
            [29, 27, 29, 42, 55, 84],
            [40, 40, 38, 45, 68, 86],
            [30, 43, 48, 45, 73, 78],
            [10, 54, 42, 38, 63, 83],
            [29, 47, 54, 60, 77, 86]
        ];

        if (event.value.code === '1') {
            this.customerAvg.set('621');
            this.customerMin.set('198');
            this.customerMax.set('957');
            this.customerChart.update((chart) => ({
                ...chart,
                datasets: chart.datasets.map((ds: any, i: number) => ({
                    ...ds,
                    data: dataSet2[i]
                }))
            }));
        } else {
            this.customerAvg.set('875');
            this.customerMin.set('284');
            this.customerMax.set('1232');
            this.customerChart.update((chart) => ({
                ...chart,
                datasets: chart.datasets.map((ds: any, i: number) => ({
                    ...ds,
                    data: dataSet1[i]
                }))
            }));
        }
    }
}
