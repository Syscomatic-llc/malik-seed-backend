import { Component } from '@angular/core';
import { StatsWidget } from '@/app/pages/dashboard/components/statswidget';
import { UniqueVisitorWidget } from '@/app/pages/dashboard/components/uniquevisitorwidget';
import { TransactionHistoryWidget } from '@/app/pages/dashboard/components/transactionhistorywidget';
import { CountryDistributionsWidget } from '@/app/pages/dashboard/components/countrydistributionswidget';
import { MonthlyRevenueWidget } from '@/app/pages/dashboard/components/monthlyrevenuewidget';
import { YearlyWinWidget } from '@/app/pages/dashboard/components/yearlywinwidget';
import { WeeklyNewCustomersWidget } from '@/app/pages/dashboard/components/weeklynewcustomerswidget';
import { WeeklyTargetWidget } from '@/app/pages/dashboard/components/weeklytargetwidget';
import { TopCustomersWidget } from '@/app/pages/dashboard/components/topcustomerswidget';
import { CustomerService } from '@/app/pages/service/customer.service';

@Component({
    selector: 'app-ecommerce-dashboard',
    standalone: true,
    imports: [StatsWidget, UniqueVisitorWidget, TransactionHistoryWidget, CountryDistributionsWidget, MonthlyRevenueWidget, YearlyWinWidget, WeeklyNewCustomersWidget, WeeklyTargetWidget, TopCustomersWidget],
    providers: [CustomerService],
    template: `<div class="grid grid-cols-12 gap-8">
        <stats-widget />

        <div class="col-span-12 xl:col-span-8">
            <unique-visitor-widget />
        </div>

        <div class="col-span-12 xl:col-span-4">
            <transaction-history-widget />
        </div>

        <div class="col-span-12 xl:col-span-4">
            <country-distributions-widget />
        </div>

        <div class="col-span-12 xl:col-span-8">
            <monthly-revenue-widget />
        </div>

        <div class="col-span-12">
            <yearly-win-widget />
        </div>

        <div class="col-span-12 xl:col-span-8">
            <weekly-new-customers-widget />
        </div>

        <div class="col-span-12 xl:col-span-4">
            <weekly-target-widget />
        </div>

        <div class="col-span-12 widget-customer-carousel">
            <top-customers-widget />
        </div>
    </div>`
})
export class EcommerceDashboard {}
