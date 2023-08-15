export class CheckBoxUtil {
  private checkList: any[] = [];

  public addToCheckList(entity: any): any[] {
    if (this.checkList.findIndex(element => element.id === entity.id) === -1) {
      this.checkList.push(entity);
    }
    return this.getCheckListEntity();
  }

  public removeFromCheckList(entity: any): any[] {
    const index = this.checkList.findIndex(element => element.id === entity.id);
    if (index !== -1) {
      this.checkList.splice(index, 1);
    }
    return this.getCheckListEntity();
  }

  private getCheckListEntity(): any[] {
    return this.checkList;
  }

  /**
   *
   * @param pageEntities : danh sách các entity trong trang hiện tại
   * @returns : mảng boolean tương ứng với giá trị các checkbox true/false
   */

  public getPageCheckArray(pageEntities: any[]): boolean[] {
    const pageCheckArray = Array(pageEntities.length).fill(false);
    pageEntities.forEach((element, i) => {
      const tempoIndex = this.checkList.findIndex(e => e.id === element.id);
      if (tempoIndex !== -1) pageCheckArray[i] = true;
    });
    return pageCheckArray;
  }
}
