import { Pipe, PipeTransform } from '@angular/core';

export interface GroupedItems<T> {
    key: string;
    value: T[];
}

/**
 * Groups an array of objects by a specified property.
 * This is a pure pipe - it only re-runs when input reference changes.
 *
 * @example
 * ```html
 * <div *ngFor="let group of users | groupBy: 'department'">
 *   <h3>{{ group.key }}</h3>
 *   <div *ngFor="let user of group.value">{{ user.name }}</div>
 * </div>
 * ```
 *
 * @note For the pipe to detect changes, ensure array is replaced (not mutated):
 * - Instead of: `this.items.push(newItem);`
 * - Use: `this.items = [...this.items, newItem];`
 */
@Pipe({
    name: 'groupBy',
    standalone: true
})
export class GroupByPipe implements PipeTransform {
    transform<T>(items: T[], property: keyof T): GroupedItems<T>[] {
        if (!items || items.length === 0) {
            return [];
        }

        const grouped = new Map<string, T[]>();

        items.forEach((item) => {
            const key = String(item[property] ?? 'undefined');
            const group = grouped.get(key) ?? [];
            group.push(item);
            grouped.set(key, group);
        });

        return Array.from(grouped.entries()).map(([key, value]) => ({
            key,
            value
        }));
    }
}
