import { afterNextRender, Component, effect, inject, signal } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { LayoutService } from '@/app/layout/service/layout.service';

@Component({
    selector: 'monthly-revenue-widget',
    standalone: true,
    imports: [SelectModule, FormsModule, ChartModule],
    template: `<div class="card">
        <div class="card-header leading-loose">
            <span>Monthly Revenue</span>
            <p-select [options]="revenueMonth" [(ngModel)]="selectedRevenueMonth" optionLabel="name" (onChange)="changeRevenueChart($event); chart.refresh()"></p-select>
        </div>

        <div class="graph">
            <p-chart #chart type="line" height="426" [data]="revenueChart()" [options]="revenueChartOptions()" id="revenue-chart"></p-chart>
        </div>
    </div>`
})
export class MonthlyRevenueWidget {
    layoutService = inject(LayoutService);

    revenueChart = signal<any>(null);

    revenueChartOptions = signal<any>(null);

    selectedRevenueMonth: any = { name: 'January - July 2021', code: '0' };

    revenueMonth: any = [
        { name: 'January - July 2021', code: '0' },
        { name: 'August - December 2020', code: '1' }
    ];

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

        this.revenueChart.set({
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'Sales',
                    data: [37, 34, 21, 27, 10, 18, 15],
                    borderColor: '#EEE500',
                    pointBackgroundColor: '#EEE500',
                    backgroundColor: 'rgba(238, 229, 0, 0.05)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Revenue',
                    data: [31, 27, 30, 37, 23, 29, 20],
                    borderColor: '#00D0DE',
                    pointBackgroundColor: '#00D0DE',
                    backgroundColor: 'rgba(0, 208, 222, 0.05)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: [21, 7, 13, 3, 19, 11, 6],
                    borderColor: '#FC6161',
                    pointBackgroundColor: '#FC6161',
                    backgroundColor: 'rgba(253, 72, 74, 0.05)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Customer',
                    data: [47, 31, 35, 20, 46, 39, 25],
                    borderColor: '#0F8BFD',
                    pointBackgroundColor: '#0F8BFD',
                    backgroundColor: 'rgba(15, 139, 253, 0.05)',
                    fill: true,
                    tension: 0.4
                }
            ]
        });

        this.revenueChartOptions.set({
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            responsive: true,
            hover: {
                mode: 'index'
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    ticks: {
                        color: textColor,
                        min: 0,
                        max: 60,
                        stepSize: 5
                    }
                }
            }
        });
    }

    changeRevenueChart(event: any) {
        const dataSet1 = [
            [37, 34, 21, 27, 10, 18, 15],
            [31, 27, 30, 37, 23, 29, 20],
            [21, 7, 13, 3, 19, 11, 6],
            [47, 31, 35, 20, 46, 39, 25]
        ];
        const dataSet2 = [
            [31, 27, 30, 37, 23, 29, 20],
            [47, 31, 35, 20, 46, 39, 25],
            [37, 34, 21, 27, 10, 18, 15],
            [21, 7, 13, 3, 19, 11, 6]
        ];

        if (event.value.code === '1') {
            this.revenueChart.update((chart) => ({
                ...chart,
                datasets: chart.datasets.map((ds: any, i: number) => ({
                    ...ds,
                    data: dataSet2[i]
                }))
            }));
        } else {
            this.revenueChart.update((chart) => ({
                ...chart,
                datasets: chart.datasets.map((ds: any, i: number) => ({
                    ...ds,
                    data: dataSet1[i]
                }))
            }));
        }
    }
}
