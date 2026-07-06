import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderWidget } from './components/headerwidget';
import { FeaturesWidget } from './components/featureswidget';
import { PricingWidget } from './components/pricingwidget';
import { FooterWidget } from './components/footerwidget';
import { MeetWidget } from '@/app/pages/landing/components/meetwidget';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, HeaderWidget, HeaderWidget, FeaturesWidget, PricingWidget, FooterWidget, MeetWidget],
    template: `
        <div id="home" class="landing-container" style="background: #100e23">
            <header-widget />
            <meet-widget />

            <div class="clip-background bg-gray-900 relative">
                <div class="landing-wrapper clip-path px-12! pb-20! absolute w-full!" style="color: #44486d; background: linear-gradient(180deg, #f4f8fb 17.13%, #eeeefa 65.89%)">
                    <features-widget />
                    <pricing-widget />
                    <footer-widget />
                </div>
            </div>
        </div>
    `,
    styles: `
        :host ::ng-deep {
            .landing-container {
                #header {
                    #menu {
                        display: flex;
                        align-items: center;
                        flex-direction: row;
                        list-style-type: none;
                    }
                    .header-features {
                        .header-feature-box {
                            background: rgba(0, 0, 0, 0.5);
                            border: 1px solid rgba(0, 0, 0, 0.15);
                            box-sizing: border-box;
                            backdrop-filter: blur(40px);
                            border-radius: 20px;
                            padding: 30px 33px 36px 33px;
                            max-width: 370px;

                            .title {
                                display: block;
                                font-size: 20px;
                                line-height: 23px;
                            }

                            .content {
                                font-size: 14px;
                                line-height: 16px;
                            }
                        }
                    }
                }
                .landing-wrapper-back {
                    margin-top: calc(((100vw * 0.09719) * -1) - 300px);
                    padding: calc((100vw * 0.09719) * 4) - ((100vw * 0.09719) - (100vw * 0.09719)) 0 4em;
                }

                .landing-wrapper {
                    #footer {
                        .newsletter {
                            input {
                                background: #efeffb;
                                mix-blend-mode: multiply;
                                opacity: 0.8;
                                color: #44486d;
                                border-radius: 8px 0 0 8px;
                                border-color: transparent;
                                padding: 0.714rem 1rem;
                                min-width: 400px;

                                &::placeholder {
                                    font-weight: 500;
                                    font-size: 14px;
                                    line-height: 17px;
                                    color: #44486d;
                                    mix-blend-mode: multiply;
                                    opacity: 0.25;
                                }
                            }
                        }
                    }
                }
            }

            @media screen and (max-width: 991px) {
                .landing-container {
                    #header {
                        .header-features,
                        .header-text {
                            padding: 100px 0 !important;
                            padding-left: 0 !important;
                            padding-right: 0 !important;
                        }
                    }

                    #atlantis {
                        min-height: 430px !important;

                        .ellipsis-1,
                        .ellipsis-2,
                        .ellipsis-3,
                        .ellipsis-4 {
                            display: none;
                        }
                    }

                    .landing-wrapper-back {
                        display: none;
                    }

                    .landing-wrapper {
                        padding: 2.5rem 3rem !important;

                        &.clip-path {
                            clip-path: none;
                            margin-top: 0;
                        }

                        #features {
                            padding-left: 0 !important;
                            padding-right: 0 !important;

                            .feature-boxes {
                                &.feature-boxes-1,
                                &.feature-boxes-2,
                                &.feature-boxes-3 {
                                    margin-bottom: 50px !important;
                                    margin-left: 0px !important;
                                }

                                &.feature-boxes-3 {
                                    .feature-widgets {
                                        overflow: hidden !important;

                                        .progressbar-widget {
                                            max-width: 350px !important;
                                            position: absolute;
                                            right: -150px;
                                            top: -15px;
                                        }
                                    }
                                }
                            }
                        }

                        #pricing {
                            padding-left: 0 !important;
                            padding-right: 0 !important;

                            .pricing-content {
                                .card {
                                    margin-right: 0 !important;
                                }
                            }
                        }

                        #footer {
                            .newsletter {
                                p,
                                input {
                                    min-width: auto;
                                    max-width: 300px;
                                }
                            }
                        }
                    }
                }
            }

            .clip-path {
                position: relative;
                margin-top: calc(((100vw * 0.09719) * -1) - 300px);
                padding: calc((100vw * 0.09719) * 4) - ((100vw * 0.09719) - (100vw * 0.09719)) 0 4em;
                clip-path: polygon(0% 18%, 100% 0%, 100% 100%, 0% 100%);
                -webkit-clip-path: polygon(0% 18%, 100% 0%, 100% 100%, 0% 100%);
            }

            @media screen and (min-width: 1960px) {
                .landing-container {
                    .header-menu-container,
                    .header-text,
                    .header-features,
                    .landing-back,
                    .features,
                    .pricing,
                    .footer {
                        width: 1504px !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                    }
                }
            }
        }
    `
})
export class Landing {}
