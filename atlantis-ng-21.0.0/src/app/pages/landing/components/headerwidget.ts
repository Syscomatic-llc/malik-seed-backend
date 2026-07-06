import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { Router, RouterModule } from '@angular/router';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
    standalone: true,
    selector: 'header-widget',
    imports: [CommonModule, ButtonModule, RippleModule, RouterModule, StyleClassModule],
    template: ` <div id="header" class="landing-header flex flex-col w-full p-12" style="min-height: 1000px; background: url('/demo/images/landing/landing-header-2x.jpg') top left no-repeat; background-size: cover">
        <div class="header-menu-container flex items-center justify-between">
            <div class="header-left-elements flex items-center justify-between">
                <div class="layout-topbar-logo flex items-center cursor-pointer" (click)="router.navigate(['/'])">
                    <img src="/demo/images/logo-dark.png" alt="layout" style="height: 32px" />
                    <img src="/demo/images/appname-dark.png" alt="layout" class="ml-2" style="height: 12px" />
                </div>

                <ul
                    #menu
                    id="menu"
                    style="top: 0px; right: 0%"
                    class="list-none hidden! lg:flex! lg:flex-row! flex-col! items-start! absolute lg:relative h-screen lg:h-auto m-0 z-50 w-full sm:w-6/12 lg:w-full lg:py-0 pl-8 bg-surface-50 md:bg-transparent"
                >
                    <a
                        class="cursor-pointer block! lg:hidden! text-gray-800 font-medium leading-normal hover:text-gray-800 absolute"
                        style="top: 3rem; right: 2rem"
                        pStyleClass="@parent"
                        enterFromClass="hidden!"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden!"
                        leaveActiveClass="animate-fadeout"
                    >
                        <i class="pi pi-times text-4xl!"></i>
                    </a>

                    <li class="mt-8 lg:mt-0">
                        <a (click)="scrollToElement('home')" class="flex m-0 lg:ml-8 lg:px-0 px-4 py-4 text-gray-800 font-medium leading-normal hover:text-gray-800 cursor-pointer">
                            <span>Home</span>
                        </a>
                    </li>
                    <li>
                        <a (click)="scrollToElement('meet')" class="flex m-0 lg:ml-8 lg:px-0 px-4 py-4 text-gray-800 font-medium leading-normal hover:text-gray-800 cursor-pointer">
                            <span>Meet Atlantis</span>
                        </a>
                    </li>
                    <li>
                        <a (click)="scrollToElement('features')" class="flex m-0 lg:ml-8 lg:px-0 px-4 py-4 text-gray-800 font-medium leading-normal hover:text-gray-800 cursor-pointer">
                            <span>Features</span>
                        </a>
                    </li>
                    <li>
                        <a (click)="scrollToElement('pricing')" class="flex m-0 md:ml-8 md:px-0 px-4 py-4 text-gray-800 font-medium leading-normal hover:text-gray-800 cursor-pointer">
                            <span>Pricing</span>
                        </a>
                    </li>
                    <li>
                        <a class="flex m-0 md:ml-8 md:px-0 px-4 py-4 text-gray-800 font-medium leading-normal hover:text-gray-800 cursor-pointer">
                            <span>Buy Now</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div class="header-right-elements flex items-center justify-between">
                <a class="contact-icons font-medium text-gray-700 cursor-pointer">
                    <i class="pi pi-github text-gray-700 hover:text-gray-900 mr-4 text-xl"></i>
                </a>

                <a class="contact-icons font-medium text-gray-700 cursor-pointer">
                    <i class="pi pi-twitter text-gray-700 hover:text-gray-900 mr-4 text-xl"></i>
                </a>

                <button pButton pRipple class="contact-button mr-4" severity="secondary" outlined text style="background: rgba(68, 72, 109, 0.05)">
                    <span class="p-button-label text-gray-700! font-semibold!">Contact</span>
                </button>

                <a class="lg:hidden font-medium text-gray-700 cursor-pointer" pStyleClass="#menu" enterFromClass="hidden!" enterActiveClass="animate-fadein" leaveToClass="hidden!" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                    <i class="pi pi-bars fs-xlarge"></i>
                </a>
            </div>
        </div>

        <div class="header-text" style="padding: 100px 60px">
            <h1 class="mb-0 text-gray-800 font-semibold" style="font-size: 80px; line-height: 95px">This is Atlantis</h1>
            <h2 class="mt-0 font-medium text-4xl text-gray-700 mb-4">Modern, fresh and groovy</h2>
            <a href="/" class="p-button bg-cyan-500! border-cyan-500! font-bold rounded" style="mix-blend-mode: multiply; padding: 0.858rem 1.142rem">
                <span class="p-button-text text-gray-700!">Live Demo</span>
            </a>
        </div>

        <div id="features" class="header-features" style="padding: 100px 60px">
            <div class="grid grid-cols-12 gap-4 flex">
                <div class="col-span-12 md:col-span-6 lg:col-span-4 flex justify-center">
                    <div class="header-feature-box mr-4 mb-6 rounded-3xl p-8 text-white">
                        <span class="title mb-4 block text-2xl">Responsive Layout</span>
                        <span class="content">View it on the web and mobile device. Prime premium themes are aready for the all devices.</span>
                    </div>
                </div>
                <div class="col-span-12 md:col-span-6 lg:col-span-4 flex justify-center">
                    <div class="header-feature-box mr-4 mb-6 rounded-3xl p-8 text-white">
                        <span class="title mb-4 block text-2xl">Fresh</span>
                        <span class="content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</span>
                    </div>
                </div>
                <div class="col-span-12 md:col-span-6 lg:col-span-4 flex justify-center">
                    <div class="header-feature-box mr-4 mb-6 rounded-3xl p-8 text-white">
                        <span class="title mb-4 block text-2xl">Modern Design</span>
                        <span class="content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</span>
                    </div>
                </div>
                <div class="col-span-12 md:col-span-6 lg:col-span-4 flex justify-center">
                    <div class="header-feature-box mr-4 mb-6 rounded-3xl p-8 text-white">
                        <span class="title mb-4 block text-2xl">Clean code</span>
                        <span class="content">Our frontend is so easy to understand. If you want to modify the code it's an easy job for you. Our code is clean and easy to read.</span>
                    </div>
                </div>
                <div class="col-span-12 md:col-span-6 lg:col-span-4 flex justify-center">
                    <div class="header-feature-box mr-4 mb-6 rounded-3xl p-8 text-white">
                        <span class="title mb-4 block text-2xl">Ready!</span>
                        <span class="content">We work hard to write down all aspects of prime themes to make sure that there is no unanswered questions left.</span>
                    </div>
                </div>
                <div class="col-span-12 md:col-span-6 lg:col-span-4 flex justify-center">
                    <div class="header-feature-box mr-4 mb-6 rounded-3xl p-8 text-white">
                        <span class="title mb-4 block text-2xl">Well documented</span>
                        <span class="content">We work hard to write down all aspects of prime themes to make sure that there is no unanswered questions left.</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`
})
export class HeaderWidget {
    @ViewChild('menu') menu!: ElementRef<HTMLUListElement>;

    router = inject(Router);

    scrollToElement(id: string) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        this.menu.nativeElement.classList.add('hidden!');
    }
}
