import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'features-widget',
    template: `
        <div id="features" class="pr-20 features" style="padding-left: 14rem">
            <h2 class="font-medium text-3xl text-center text-gray-800 mb-4">Features</h2>
            <div class="grid grid-cols-12 gap-4 feature-boxes feature-boxes-1" style="margin-bottom: 170px">
                <div class="col-span-12 md:col-span-6">
                    <h3 class="font-medium text-3xl mb-4">Curabitur ullamcorper molesti</h3>
                    <p class="text-xl" style="max-width: 420px">
                        Ut eget ante id libero scelerisque sagittis. Aliquam porta quam at eros ornare, nec volutpat purus ornare. Curabitur vestibulum pharetra dui, feugiat venenatis augue accumsan in. Fusce ullamcorper efficitur dui vestibulum
                        imperdiet. Morbi rhoncus commodo est, vel molestie sapien dapibus et. Nam a blandit urna. Maecenas porttitor et neque eu vehicula. Nunc dictum posuere elementum.
                    </p>
                </div>
                <div class="col-span-12 md:col-span-6 flex flex-col">
                    <div class="widget-overview-box bg-white mb-8 rounded-xl p-4 relative" style="box-shadow: 0px 8px 30px rgba(59, 56, 109, 0.07); max-width: 350px">
                        <span class="overview-title"> CONVERSATION RATE </span>
                        <div class="flex justify-between">
                            <div class="flex justify-between items-center">
                                <div class="flex justify-center items-center h-8 w-20 rounded p-2 mr-4" style="background-color: #fc6161; box-shadow: 0px 6px 20px rgba(252, 97, 97, 0.3)">
                                    <i class="pi pi-arrow-down w-8"></i>
                                    <span class="leading-tight">0.6%</span>
                                </div>
                                <div class="leading-loose text-4xl">0.81%</div>
                            </div>
                        </div>
                        <img class="absolute" style="bottom: 14px; right: 12px" src="/demo/images/ecommerce-dashboard/rate.svg" />
                    </div>

                    <div class="widget-overview-box bg-white mb-8 rounded-xl p-4 relative" style="box-shadow: 0px 8px 30px rgba(59, 56, 109, 0.07); max-width: 350px">
                        <span class="overview-title"> AVG. ORDER VALUE </span>
                        <div class="flex justify-between">
                            <div class="flex justify-between items-center">
                                <div class="flex justify-center items-center h-8 w-20 rounded p-2 mr-4" style="margin-right: 12px; background-color: #0bd18a; box-shadow: 0px 6px 20px rgba(11, 209, 138, 0.3)">
                                    <i class="pi pi-arrow-up w-8"></i>
                                    <span class="leading-tight">4,2%</span>
                                </div>
                                <div class="leading-loose text-4xl">$306.2</div>
                            </div>
                        </div>
                        <img class="absolute" style="bottom: 14px; right: 12px" src="/demo/images/ecommerce-dashboard/value.svg" />
                    </div>

                    <div class="widget-overview-box bg-white mb-8 rounded-xl p-4 relative" style="box-shadow: 0px 8px 30px rgba(59, 56, 109, 0.07); max-width: 350px">
                        <span class="overview-title"> ORDER QUANTITY </span>
                        <div class="flex justify-between">
                            <div class="flex justify-between items-center">
                                <div class="flex justify-center items-center h-8 w-20 rounded p-2 mr-4" style="background-color: #00d0de; box-shadow: 0px 6px 20px rgba(0, 208, 222, 0.3)">
                                    <i class="pi pi-minus w-8"></i>
                                    <span class="leading-tight">2,1%</span>
                                </div>
                                <div class="leading-loose text-4xl">1,620</div>
                            </div>
                        </div>
                        <img class="absolute" style="bottom: 14px; right: 12px" src="/demo/images/ecommerce-dashboard/quantity.svg" />
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-4 flex justify-between feature-boxes feature-boxes-2" style="margin-bottom: 140px; margin-left: -100px">
                <div class="col-span-12 md:col-span-6 flex flex-row-reverse">
                    <div class="card mr-4 customer-box text-center rounded bg-white" style="box-shadow: 0px 8px 30px rgba(68, 72, 109, 0.07); max-width: 180px; max-height: 210px">
                        <div class="customer-item-content">
                            <div class="mb-4">
                                <img src="/demo/images/ecommerce-dashboard/beats.png" alt="beats" width="97px" />
                            </div>
                            <div>
                                <h4 class="p-m-1 font-medium text-xl whitespace-nowrap">9,395 Users</h4>
                                <h5 class="mt-0 font-medium text-xl text-gray-400">$7,927,105</h5>
                            </div>
                        </div>
                    </div>
                    <div class="card mr-4 customer-box text-center rounded bg-white" style="box-shadow: 0px 8px 30px rgba(68, 72, 109, 0.07); max-width: 180px; max-height: 210px">
                        <div class="customer-item-content">
                            <div class="mb-4">
                                <img src="/demo/images/ecommerce-dashboard/nasa.png" alt="nasa" width="97" />
                            </div>
                            <div>
                                <h4 class="font-medium text-xl whitespace-nowrap">9,673 Users</h4>
                                <h5 class="mt-0 font-medium text-xl text-gray-400">$8,362,478</h5>
                            </div>
                        </div>
                    </div>
                    <div class="card mr-4 customer-box text-center rounded bg-white" style="box-shadow: 0px 8px 30px rgba(68, 72, 109, 0.07); max-width: 180px; max-height: 210px; opacity: 0.5">
                        <div class="customer-item-content">
                            <div class="mb-4">
                                <img src="/demo/images/ecommerce-dashboard/north.png" alt="north-face" width="97" />
                            </div>
                            <div>
                                <h4 class="font-medium text-xl whitespace-nowrap">7,613 Users</h4>
                                <h5 class="mt-0 font-medium text-xl text-gray-400">$5,697,883</h5>
                            </div>
                        </div>
                    </div>
                    <div class="card mr-4 customer-box text-center rounded bg-white" style="box-shadow: 0px 8px 30px rgba(68, 72, 109, 0.07); max-width: 180px; max-height: 210px; opacity: 0.3">
                        <div class="customer-item-content">
                            <div class="mb-4">
                                <img src="/demo/images/ecommerce-dashboard/gopro.png" alt="go-pro" width="97px" height="97px" />
                            </div>
                            <div>
                                <h4 class="font-medium text-xl whitespace-nowrap">7,813 Users</h4>
                                <h5 class="mt-0 font-medium text-xl text-gray-400">$6,471,594</h5>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-span-12 md:col-span-6">
                    <h3 class="font-medium text-3xl text-gray-900 mb-4">Curabitur ullamcorper molesti</h3>
                    <p>
                        Proin maximus sem non congue ultricies. Aenean porttitor nulla suscipit, laoreet nunc eget, pharetra felis. Etiam ac velit sit amet metus tristique ultrices. Interdum et malesuada fames ac ante ipsum primis in faucibus.
                        Vestibulum placerat nunc vitae ipsum bibendum pulvinar.
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-4 feature-boxes feature-boxes-3" style="margin-bottom: 120px">
                <div class="col-span-12 md:col-span-6">
                    <span class="text-gray-900 font-semibold text-2xl">Curabitur ullamcorper molesti</span>
                    <ul class="list-disc pl-6 mt-4">
                        <li class="text-xl">Donec ac justo vitae lorem vehicula lobortis.</li>
                        <li class="text-xl">Aenean nibh ante, auctor in faucibus id</li>
                        <li class="text-xl">Orci varius natoque penatibus et magnis</li>
                        <li class="text-xl">Ut et dapibus mauris.</li>
                        <li class="text-xl">Fusce aliquet eget nisl sed imperdiet.</li>
                    </ul>
                </div>
                <div class="col-span-12 md:col-span-6 feature-widgets relative">
                    <img src="/demo/images/landing/chart-widget.png" alt="atlantis" class="chart-widget" style="max-height: 260px; opacity: 0.6" />
                    <img src="/demo/images/landing/progressbar-widget.png" alt="atlantis" class="progressbar-widget absolute right-0" style="top: -45px; max-width: 350px" />
                </div>
            </div>
        </div>
    `
})
export class FeaturesWidget {}
