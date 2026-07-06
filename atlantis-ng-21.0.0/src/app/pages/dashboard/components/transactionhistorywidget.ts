import { Component } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';

@Component({
    selector: 'transaction-history-widget',
    standalone: true,
    imports: [TimelineModule],
    template: `<div class="card p-0!">
        <div class="timeline-header p-4 flex justify-between items-center">
            <p class="m-0">Transaction History</p>
            <div class="header-icons">
                <i class="pi pi-refresh ml-2"></i>
                <i class="pi pi-filter ml-2"></i>
            </div>
        </div>
        <div class="timeline-content pb-4">
            <p-timeline [value]="timelineEvents" styleClass="customized-timeline py-0 px-4">
                <ng-template #marker let-event>
                    <span class="rounded-full p-1 w-8 h-8 flex justify-center items-center text-white" [style]="{ backgroundColor: event.iconColor }">
                        <i [class]="event.icon"></i>
                    </span>
                </ng-template>
                <ng-template #content let-event>
                    <div class="flex items-center justify-between">
                        <p class="m-0">{{ event.transaction }}</p>
                        <h6 class="m-0" [style]="{ color: event.amountColor }">
                            {{ event.amount }}
                        </h6>
                    </div>
                    <span class="text-sm text-surface-500 dark:text-surface-400">{{ event.date }}</span>
                </ng-template>
            </p-timeline>
        </div>
        <div class="timeline-footer border-t border-surface-200 dark:border-surface-700 p-4 flex items-center justify-center">
            <a href="#" class="text-primary hover:text-primary-400 duration-200">View all transactions</a>
        </div>
    </div>`,
    styles: `
        :host ::ng-deep .customized-timeline {
            .p-timeline-event:nth-child(even) {
                flex-direction: row !important;

                .p-timeline-event-content {
                    text-align: left !important;
                }
            }

            .p-timeline-event-opposite {
                flex: 0;
                padding: 0;
            }
        }

        .p-card {
            margin-top: 1rem;
        }
    `
})
export class TransactionHistoryWidget {
    timelineEvents = [
        {
            transaction: 'Payment from #28492',
            amount: '+$250.00',
            date: 'June 13, 2025 11:09 AM',
            icon: 'pi pi-check',
            iconColor: '#0F8BFD',
            amountColor: '#00D0DE'
        },
        {
            transaction: 'Process refund to #94830',
            amount: '-$570.00',
            date: 'June 13, 2025 08:22 AM',
            icon: 'pi pi-refresh',
            iconColor: '#FC6161',
            amountColor: '#FC6161'
        },
        {
            transaction: 'New 8 user to #5849',
            amount: '+$50.00',
            date: 'June 12, 2025 02:56 PM',
            icon: 'pi pi-plus',
            iconColor: '#0BD18A',
            amountColor: '#0BD18A'
        },
        {
            transaction: 'Payment from #3382',
            amount: '+$3830.00',
            date: 'June 11, 2025 06:11 AM',
            icon: 'pi pi-check',
            iconColor: '#0F8BFD',
            amountColor: '#00D0DE'
        },
        {
            transaction: 'Payment from #4738',
            amount: '+$845.00',
            date: 'June 11, 2025 03:50 AM',
            icon: 'pi pi-check',
            iconColor: '#0F8BFD',
            amountColor: '#00D0DE'
        },
        {
            transaction: 'Payment failed form #60958',
            amount: '$1450.00',
            date: 'June 10, 2025 07:54 PM',
            icon: 'pi pi-exclamation-triangle',
            iconColor: '#EC4DBC',
            amountColor: '#EC4DBC'
        },
        {
            transaction: 'Payment from #5748',
            amount: '+$50.00',
            date: 'June 09, 2025 11:37 PM',
            icon: 'pi pi-check',
            iconColor: '#0F8BFD',
            amountColor: '#00D0DE'
        },
        {
            transaction: 'Removed 32 users from #5849',
            amount: '-$240.00',
            date: 'June 09, 2025 08:40 PM',
            icon: 'pi pi-minus',
            iconColor: '#FC6161',
            amountColor: '#FC6161'
        }
    ];
}
