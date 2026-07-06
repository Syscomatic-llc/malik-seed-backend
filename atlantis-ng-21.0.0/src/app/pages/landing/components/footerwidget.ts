import { Component, inject } from '@angular/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';

@Component({
    standalone: true,
    selector: 'footer-widget',
    imports: [InputGroup, InputText, RouterModule, ButtonModule, RippleModule],
    template: ` <div id="footer" class="footer">
        <div class="flex items-center justify-between py-6" style="mix-blend-mode: multiply">
            <div class="flex items-center justify-between">
                <div class="flex items-center cursor-pointer" (click)="router.navigate(['/'])">
                    <img src="/demo/images/logo-dark.png" alt="atlantis-layout" class="logo" style="height: 32px" />
                    <img src="/demo/images/appname-dark.png" alt="atlantis-layout" class="appname ml-2" style="height: 12px" />
                    <span class="text-gray-700 opacity-70" style="margin-left: 2.5rem">Copyright - PrimeTek</span>
                </div>
            </div>
            <div class="footer-right-elements flex items-center justify-between">
                <a class="contact-icons cursor-pointer">
                    <i class="pi pi-github text-gray-700 hover:text-gray-900 mr-4 text-xl!"></i>
                </a>

                <a class="contact-icons cursor-pointer">
                    <i class="pi pi-twitter text-gray-700 hover:text-gray-900 mr-4 text-xl!"></i>
                </a>
            </div>
        </div>

        <div class="flex items-center pt-8">
            <div class="newsletter">
                <span class="header font-medium text-xl opacity-60">Newsletter</span>
                <p class="font-medium opacity-60 mb-4">Join our newsletter to get notification about the new features</p>
                <p-inputgroup>
                    <input pInputText type="text" placeholder="Enter your email address" />
                    <button pButton pRipple class="join-button bg-slate-500!" severity="secondary" text outlined style="border-radius: 0 8px 8px 0">
                        <span pButtonLabel class="text-slate-100">Join</span>
                    </button>
                </p-inputgroup>
            </div>
        </div>
    </div>`
})
export class FooterWidget {
    router = inject(Router);
}
