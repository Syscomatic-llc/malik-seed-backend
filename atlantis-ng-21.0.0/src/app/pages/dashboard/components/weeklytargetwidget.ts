import { Component } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'weekly-target-widget',
    standalone: true,
    imports: [CommonModule, ProgressBarModule],
    template: `<div class="card widget-target">
        <div class="card-header">
            <span>Weekly Target</span>
        </div>
        <div class="content flex flex-col gap-1 mt-4">
            <span class="text-2xl">1232 Users</span>
            <span class="text-sm leading-none text-green-500">%3.5 <i class="pi pi-arrow-up text-sm"></i><span class="text-surface-500 dark:text-surface-400"> than last week</span></span>
        </div>
        <div class="mt-6 relative text-red-500 flex flex-col justify-between" style="min-height: 235px">
            <div class="item mb-4">
                <span class="block mb-1">51%</span>
                <p-progressBar [value]="51" [showValue]="false" color="#FC6161"></p-progressBar>
                <span class="day bottom-0 text-green-500 dark:text-surface-400 block mt-1">Thu</span>
            </div>
            <div class="item mb-4">
                <span class="block mb-1">68%</span>
                <p-progressBar color="#FC6161" [value]="68" [showValue]="false"></p-progressBar>
                <span class="day bottom-0 text-surface-500 dark:text-surface-400 block mt-1">Fri</span>
            </div>
            <div class="item mb-4">
                <span class="block mb-1">74%</span>
                <p-progressBar color="#FC6161" [value]="74" [showValue]="false"></p-progressBar>
                <span class="day bottom-0 text-surface-500 dark:text-surface-400 block mt-1">Sat</span>
            </div>
            <div class="item mb-4">
                <span class="block mb-1">61%</span>
                <p-progressBar color="#FC6161" [value]="61" [showValue]="false"></p-progressBar>
                <span class="day bottom-0 text-surface-500 dark:text-surface-400 block mt-1">Sun</span>
            </div>
            <div class="item success mb-4">
                <span class="block mb-1 text-green-500">100%</span>
                <p-progressBar
                    color="#0BD18A"
                    [value]="100"
                    [showValue]="false"
                    [ngStyle]="{
                        boxShadow: '0px 0px 10px rgb(11 209 138 / 30%)'
                    }"
                ></p-progressBar>
                <span class="day bottom-0 text-surface-500 dark:text-surface-400 block mt-1">Mon</span>
            </div>
        </div>
    </div>`
})
export class WeeklyTargetWidget {}
