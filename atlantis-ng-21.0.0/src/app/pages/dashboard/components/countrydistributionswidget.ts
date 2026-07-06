import { afterNextRender, Component, effect, inject, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { LayoutService } from '@/app/layout/service/layout.service';

@Component({
    selector: 'country-distributions-widget',
    standalone: true,
    imports: [ChartModule],
    template: `<div class="card">
        <div class="font-medium leading-loose">Country Distributions</div>
        <div class="flex justify-center mb-8">
            <p-chart type="doughnut" height="225" [data]="countryChart()" [options]="countryChartOptions()" class="w-9/12" id="country-chart"></p-chart>
        </div>
        <ul class="m-0 p-0 border-0 outline-0 list-none">
            <li class="flex justify-between items-center py-2 border-b border-surface-200 dark:border-surface-700">
                <div class="flex justify-between items-center">
                    <div class="w-8 h-8 rounded mr-2" style="background-color: var(--p-cyan-400); box-shadow: 0px 0px 10px rgba(0, 208, 222, 0.3)"></div>
                    <span>United States of America</span>
                </div>
                <span>25%</span>
            </li>
            <li class="flex justify-between items-center py-2 border-b border-surface-200 dark:border-surface-700">
                <div class="flex justify-between items-center">
                    <div class="w-8 h-8 rounded mr-2" style="background-color: var(--p-red-400); box-shadow: 0px 0px 10px rgba(252, 97, 97, 0.3)"></div>
                    <span>Japan</span>
                </div>
                <span>17%</span>
            </li>
            <li class="flex justify-between items-center py-2 border-b border-surface-200 dark:border-surface-700">
                <div class="flex justify-between items-center">
                    <div class="w-8 h-8 rounded mr-2" style="background-color: var(--p-yellow-400); box-shadow: 0px 0px 10px rgba(238, 229, 0, 0.3)"></div>
                    <span>Australia</span>
                </div>
                <span>15%</span>
            </li>
            <li class="flex justify-between items-center py-2 border-b border-surface-200 dark:border-surface-700">
                <div class="flex justify-between items-center">
                    <div class="w-8 h-8 rounded mr-2" style="background-color: var(--p-blue-400); box-shadow: 0px 0px 10px rgba(15, 139, 253, 0.3)"></div>
                    <span>China</span>
                </div>
                <span>8%</span>
            </li>
            <li class="flex justify-between items-center py-2 border-b border-surface-200 dark:border-surface-700">
                <div class="flex justify-between items-center">
                    <div class="w-8 h-8 rounded mr-2" style="background-color: var(--p-gray-400)"></div>
                    <span>Others</span>
                </div>
                <span>5%</span>
            </li>
        </ul>
    </div>`
})
export class CountryDistributionsWidget {
    layoutService = inject(LayoutService);

    countryChart = signal<any>(null);

    countryChartOptions = signal<any>(null);

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

        this.countryChart.set({
            datasets: [
                {
                    data: [30, 18, 36, 54, 61, 90, 72],
                    backgroundColor: ['#0F8BFD', '#545C6B', '#EC4DBC', '#EEE500', '#FC6161'],
                    hoverBackgroundColor: ['#0F8BFD', '#545C6B', '#EC4DBC', '#EEE500', '#FC6161'],
                    borderColor: 'transparent',
                    fill: true
                }
            ]
        });

        this.countryChartOptions.set({
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            }
        });
    }
}
