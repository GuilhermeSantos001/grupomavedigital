export class UpdateThrowErrorController {
  async handle<ReturnType>(handle: Promise<ReturnType>, msgError: string) {
    try {
      return {
        success: true,
        data: await handle
      }
    } catch (error) {
      return { success: false, message: msgError, error };
    }
  }
}