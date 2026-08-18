import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@/app/services/auth.service';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const messageService = inject(MessageService, { optional: true });
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
            // don't get stuck in a broken authenticated state. Show a clear message
            // so the admin knows the token was rejected rather than a network error.
            if (err.status === 401) {
                messageService?.add({
                    severity: 'error',
                    summary: 'Session Expired',
                    detail: 'Your session is no longer valid. Please log in again.',
                    life: 5000
                });
                auth.logout();
            }
            return throwError(() => err);
        })
    );
};
