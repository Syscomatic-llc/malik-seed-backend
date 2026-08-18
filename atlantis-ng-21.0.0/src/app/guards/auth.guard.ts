import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@/app/services/auth.service';
import { MalikApiService } from '@/app/services/malik-api.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const api = inject(MalikApiService);
    const router = inject(Router);
    const messageService = inject(MessageService, { optional: true });

    if (!auth.isAuthenticated()) {
        return router.createUrlTree(['/auth/login']);
    }

    // Verify the stored token is still valid with the backend. This prevents
    // users from staying in a broken CMS state if the token was revoked or expired.
    return api.getMe().pipe(
        map(() => true),
        catchError(() => {
            messageService?.add({
                severity: 'error',
                summary: 'Session Expired',
                detail: 'Your session is no longer valid. Please log in again.',
                life: 5000
            });
            auth.logout();
            return of(router.createUrlTree(['/auth/login']));
        })
    );
};
