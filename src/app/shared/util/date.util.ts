export default class DateUtil {
  // yyyy-MM-dd
  static formatDate(date: any): string {
    const listDate = date.toString().split('');
    return  listDate.length > 13? listDate[8]+listDate[9]+':'+listDate[10]+listDate[11]+':'+listDate[12]+listDate[13]+' '+listDate[6]+listDate[7]+'/'+listDate[4]+listDate[5]+'/'+listDate[0]+listDate[1]+listDate[2]+listDate[3]:'';
  }
}
