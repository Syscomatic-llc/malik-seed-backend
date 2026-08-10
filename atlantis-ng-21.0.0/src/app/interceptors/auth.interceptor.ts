import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@/app/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const token = auth.getToken();

    const headers: Record<string, string> = {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache'
    };
    if (token && !req.headers.has('Authorization')) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    req = req.clone({ setHeaders: headers });

    return next(req);
};
