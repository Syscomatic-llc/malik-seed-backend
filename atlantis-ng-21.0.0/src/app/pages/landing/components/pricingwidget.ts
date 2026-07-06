import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    standalone: true,
    selector: 'pricing-widget',
    imports: [ButtonModule, RippleModule],
    template: `<div id="pricing" class="flex pricing flex-col pr-20" style="padding-left: 14rem; margin-bottom: 8.5rem">
        <h2 class="text-gray-900 font-medium text-3xl">Pricing</h2>
        <p class="text-2xl mt-6" style="max-width: 650px; margin-bottom: 4.5rem">
            Proin maximus sem non congue ultricies. Aenean porttitor nulla suscipit, laoreet nunc eget, pharetra felis. Etiam ac velit sit amet metus tristique ultrices. Interdum et malesuada fames ac ante ipsum primis in faucibus.
        </p>

        <div class="grid grid-cols-12 gap-4 pricing-content w-full">
            <div class="col-span-12 lg:col-span-4">
                <div class="card p-0 mr-12 h-full bg-white! w-full" style="border-radius: 20px; box-shadow: 0px 10px 50px rgba(29, 15, 57, 0.13)">
                    <div class="flex flex-col items-center p-8">
                        <span class="type font-medium text-3xl">Basic</span>
                        <h1 class="font-medium" style="font-size: 50px">$5</h1>
                    </div>
                    <ul class="options py-0 px-8 mt-0">
                        <li class="flex items-center justify-center text-xl p-2 text-center">Responsive Layout</li>
                        <li class="flex items-center justify-center text-xl p-2 text-center">Unlimited Push Messages</li>
                        <li class="flex items-center justify-center text-xl p-2 text-center">50 Support Ticket</li>
                        <li class="flex items-center justify-center text-xl p-2 text-center">Free Shipping</li>
                        <li class="flex items-center justify-center text-xl p-2 text-center">10GB Storage</li>
                    </ul>
                    <div class="flex items-center justify-center">
                        <button pButton pRipple class="buy-button bg-gray-200! text-gray-700! font-semibold! py-2!" severity="secondary" text outlined label="Buy now"></button>
                    </div>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-4">
                <div class="card p-0 mr-12 h-full bg-white! w-full" style="border-radius: 20px; box-shadow: 0px 10px 50px rgba(29, 15, 57, 0.13)">
                    <div class="flex flex-col items-center p-8">
                        <span class="type font-medium text-3xl">Standart</span>
                        <h1 class="font-medium" style="font-size: 50px">$25</h1>
                    </div>
                    <ul class="options py-0 px-8 mt-0">
                        <li class="flex items-center justify-center text-xl p-2 text-center">Responsive Layout</li>
                        <li class="flex items-center justify-center text-xl p-2 text-center">Unlimited Push Messages</li>
                        <li class="flex items-center justify-center text-xl p-2 text-center">50 Support Ticket</li>
                        <li class="flex items-center justify-center text-xl p-2 text-center">Free Shipping</li>
                        <li class="flex items-center justify-center text-xl p-2 text-center">10GB Storage</li>
                    </ul>
                    <div class="flex items-center justify-center">
                        <button pButton pRipple class="active-buy-button bg-cyan-500! text-white! py-2! font-semibold!" severity="secondary" text outlined label="Buy now"></button>
                    </div>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-4 pricing-box pricing-professional">
                <div class="card p-0 mr-12 h-full bg-white! w-full" style="border-radius: 20px; box-shadow: 0px 10px 50px rgba(29, 15, 57, 0.13)">
                    <div class="flex flex-col items-center p-8">
                        <span class="type font-medium text-3xl">Professional</span>
                        <h1 class="font-medium" style="font-size: 50px">$50</h1>
                    </div>
                    <ul class="options py-0 px-8 mt-0 text-center">
                        <li class="flex items-center justify-center text-xl p-2 text-center">Responsive Layout</li>
                        <li class="flex items-center justify-center text-xl p-2 text-center">Unlimited Push Messages</li>
                        <li class="flex items-center justify-center text-xl p-2 text-center">50 Support Ticket</li>
                        <li class="flex items-center justify-center text-xl p-2 text-center">Free Shipping</li>
                        <li class="flex items-center justify-center text-xl p-2 text-center">10GB Storage</li>
                    </ul>
                    <div class="flex items-center justify-center">
                        <button pButton pRipple class="buy-button bg-gray-200! text-gray-700! font-semibold! py-2!" severity="secondary" text outlined label="Buy now"></button>
                    </div>
                </div>
            </div>
        </div>
    </div> `
})
export class PricingWidget {}
