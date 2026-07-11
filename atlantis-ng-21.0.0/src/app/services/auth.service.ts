import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { MalikApiService, LoginRequest, AuthResponse } from './malik-api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'cms_token';
    private readonly USER_KEY = 'cms_user';

    user = signal<any>(this.loadUser());

    constructor(
        private api: MalikApiService,
        private router: Router
    ) {}

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.api.login(credentials).pipe(
            tap((res) => {
                if (res.data?.token) {
                    localStorage.setItem(this.TOKEN_KEY, res.data.token);
                    localStorage.setItem(this.USER_KEY, JSON.stringify(res.data.user ?? null));
                    this.user.set(res.data.user ?? null);
                }
            })
        );
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.user.set(null);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    private loadUser(): any {
        const raw = localStorage.getItem(this.USER_KEY);
        if (!raw || raw === 'null') return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }
}
