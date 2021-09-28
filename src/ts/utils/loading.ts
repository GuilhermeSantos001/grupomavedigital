/**
 * @description Gerenciador de loading
 * @author @GuilhermeSantos001
 * @update 13/09/2021
 * @version 1.0.0
 */

class Loading {
  private window: any = null;
  private loading: boolean = false;

  constructor() {
    this.window = window;
    this.loading = false;
  };

  /**
   * @description Verifica se o loading está ativado
   */
  isLoading(): boolean {
    return this.loading;
  };

  /**
   * @description Inicia a execução do loading
   */
  start(): void {
    if (!this.isLoading()) {
      this.window.loading_screen = this.window.pleaseWait({
        logo: '',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        loadingHtml: ` \
                  <div class="d-flex flex-column"> \
                      <div class="sk-cube-grid align-self-center"> \
                          <div class="sk-cube sk-cube1"></div> \
                          <div class="sk-cube sk-cube2"></div> \
                          <div class="sk-cube sk-cube3"></div> \
                          <div class="sk-cube sk-cube4"></div> \
                          <div class="sk-cube sk-cube5"></div> \
                          <div class="sk-cube sk-cube6"></div> \
                          <div class="sk-cube sk-cube7"></div> \
                          <div class="sk-cube sk-cube8"></div> \
                          <div class="sk-cube sk-cube9"></div> \
                      </div> \
                  </div> \
                  `
      });

      this.loading = true;
    };
  };

  /**
   * @description Para a execução do loading
   */
  stop(): void {
    if (this.isLoading()) {
      this.window.loading_screen.finish();
      this.loading = false;
    };
  };
};

const loading = new Loading();

export default loading;