export class Plugin {
  public formatNumber(number: any) {
    return Number(number) ? Number(number).toLocaleString("vi-VN") : 0;
  }
}
