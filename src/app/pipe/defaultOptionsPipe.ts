import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'defaultOptionsFilter'
})

export class DefaultOptionsFilter implements PipeTransform {
  transform(items: any[]): any[] {
    if (!items) return [];
    return items.filter(it => it.default == true);
  }
}
