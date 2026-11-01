// error yang boleh dikirim apa adanya ke browser (pesan + status HTTP)
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
