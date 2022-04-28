export class ResponseThrowErrorController {
  async handle(error: Error, msgError: string) {
    return { success: false, message: msgError, error: error.message };
  }
}