import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

function capitalizeWords(str?: string): string {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function toSlug(str: string): string {
    return str.toLowerCase().trim().replace(/\s+/g, '_');
}

@Component({
    selector: 'app-editable-select',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
    template: `
        <div class="relative">
            <div class="flex gap-1">
                <input
                    type="text"
                    pInputText
                    [(ngModel)]="displayValue"
                    (ngModelChange)="onInputChange($event)"
                    [placeholder]="_placeholderText"
                    class="w-full"
                    (focus)="showDropdown = true"
                    (blur)="onBlur()" />
                <p-button
                    icon="pi pi-chevron-down"
                    severity="secondary"
                    [text]="true"
                    (onClick)="toggleDropdown()" />
            </div>
            <div *ngIf="showDropdown" class="absolute z-50 w-full mt-1 bg-surface-0 border border-surface-200 rounded shadow-lg max-h-48 overflow-y-auto">
                <div
                    *ngFor="let opt of filteredOptions()"
                    class="px-3 py-2 cursor-pointer hover:bg-surface-100 text-sm"
                    (mousedown)="selectOption(opt)">
                    {{opt}}
                </div>
                <div *ngIf="displayValue && !filteredOptions().includes(displayValue)"
                    class="px-3 py-2 cursor-pointer hover:bg-primary-50 text-sm text-primary font-semibold border-t border-surface-200"
                    (mousedown)="addNewOption(displayValue)">
                    <i class="pi pi-plus mr-1"></i> Add "{{displayValue}}"
                </div>
                <div *ngIf="filteredOptions().length === 0 && !displayValue" class="px-3 py-2 text-sm text-muted-color">
                    No options
                </div>
            </div>
        </div>
    `
})
export class EditableSelectComponent {
    _options = signal<string[]>([]);
    displayValue = '';
    showDropdown = false;
    _placeholderText = 'Select or type...';
    private _value = '';

    filteredOptions = signal<string[]>([]);

    ngOnInit() {
        this.filteredOptions.set(this._options());
    }

    @Input() set options(val: string[]) {
        this._options.set(val || []);
        this.filteredOptions.set(val || []);
    }

    @Input() set ngModel(val: string) {
        this._value = val || '';
        this.displayValue = capitalizeWords(val);
    }

    @Input() set placeholder(val: string) {
        this._placeholderText = val || 'Select or type...';
    }

    @Output() ngModelChange = new EventEmitter<string>();

    onInputChange(value: string) {
        this.displayValue = value;
        this._value = toSlug(value);
        this.ngModelChange.emit(this._value);
        this.filterOptions(value);
        this.showDropdown = true;
    }

    filterOptions(search: string) {
        if (!search) {
            this.filteredOptions.set(this._options());
            return;
        }
        const lower = search.toLowerCase();
        this.filteredOptions.set(this._options().filter(o => o.toLowerCase().includes(lower)));
    }

    selectOption(option: string) {
        this.displayValue = option;
        this._value = toSlug(option);
        this.ngModelChange.emit(this._value);
        this.showDropdown = false;
    }

    addNewOption(value: string) {
        const newOption = value.trim();
        if (newOption && !this._options().includes(newOption)) {
            this._options.set([...this._options(), newOption]);
        }
        this.selectOption(newOption);
    }

    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
        if (this.showDropdown) {
            this.filteredOptions.set(this._options());
        }
    }

    onBlur() {
        setTimeout(() => {
            this.showDropdown = false;
        }, 200);
    }
}
