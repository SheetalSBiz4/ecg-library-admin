import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter'
})
export class SearchFilterPipe implements PipeTransform {
  transform(items: any[], filter: any, currentPage,itemsPerPage): any {
    // console.log('filter', filter);
    // console.log('currentPage', currentPage);

    if (!items) {
      return items;
    }
    if (!filter) {
      let startIndex = (currentPage - 1) * itemsPerPage;
      let lastIndex = ((currentPage -1) * itemsPerPage) + itemsPerPage;
      // console.log(startIndex );
      // console.log(lastIndex );

      return items.map((item, index) => {
        item.show = false;
        if(index >= startIndex && index < lastIndex ){
          item.show = true;
        }
        return item;
      });
    }
    filter = filter.toLowerCase();
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    // return items.filter((item) => (
    //   item.details.toLowerCase().indexOf(filter) !== -1
    //   || item.nextStep.toLowerCase().indexOf(filter) !== -1
    //   || item.result.toLowerCase().indexOf(filter) !== -1));
    return items.map((item, index) => {
      item.show = false;
      const indexNumber = index + 1;
      const indexname = "case " + indexNumber;
      if ((indexname.indexOf(filter) !== -1
        // || item.nextStep.toLowerCase().indexOf(filter) !== -1
        || item.details.toLowerCase().indexOf(filter) !== -1
        || item.caseCode.toLowerCase().indexOf(filter) !== -1
        || item.result.toLowerCase().indexOf(filter) !== -1)) {
        item.show = true;
      }
      return item;
    })
  }



}
