import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'meet-widget',
    template: `<div id="meet" class="flex justify-center w-full bg-gray-900 relative" style="min-height: 620px; padding-top: 65px">
        <div class="ellipsis-1 absolute right-0" style="z-index: 11">
            <img src="/demo/images/landing/ellipse-1.png" alt="atlantis" width="410" />
        </div>
        <div class="ellipsis-2 absolute left-0" style="z-index: 11; bottom: -100px">
            <img src="/demo/images/landing/ellipse-2.png" alt="atlantis" width="420" />
        </div>
        <div class="ellipsis-3 absolute" style="z-index: 11; filter: blur(20px); left: 130px; top: 40px">
            <img src="/demo/images/landing/ellipse-3.png" alt="atlantis" width="300" />
        </div>
        <div class="ellipsis-4 absolute bottom-0" style="z-index: 9; right: 310px">
            <img src="/demo/images/landing/ellipse-4.png" alt="atlantis" width="125" />
        </div>

        <div class="atlantis-modes w-auto px-8" style="z-index: 10">
            <img src="/demo/images/landing/atlantis-dark.png" alt="atlantis" class="w-full" style="max-width: 800px; border-radius: 8px" />
        </div>
    </div>`
})
export class MeetWidget {}
