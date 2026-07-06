import { Routes } from '@angular/router';
import { AppLayout } from '@/app/layout/components/app.layout';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'cms' },
            {
                path: 'cms',
                data: { breadcrumb: 'CMS' },
                loadChildren: () => import('@/app/pages/cms/cms.routes')
            }
        ]
    },
    { path: 'auth', loadChildren: () => import('@/app/pages/auth/auth.routes') },
    {
        path: 'notfound',
        loadComponent: () => import('@/app/pages/notfound/notfound').then((c) => c.Notfound)
    },
    { path: '**', redirectTo: '/notfound' }
];
