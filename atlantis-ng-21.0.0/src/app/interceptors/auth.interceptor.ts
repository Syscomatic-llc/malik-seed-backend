import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@/app/services/auth.service';
import { catchError, throwError } from 'rxjs';

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

    return next(req).pipe(
        catchError((err) => {
            // If the API rejects the token, log the user out immediately so they
            // don't get stuck in a broken authenticated state.
            if (err.status === 401) {
                auth.logout();
            }
            return throwError(() => err);
        })
    );
};
