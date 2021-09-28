/**
 * @description Layout dos componentes
 * @author @GuilhermeSantos001
 * @update 15/09/2021
 * @version 1.0.0
 */

import $ from 'jquery';

// - https://animate.style/#utilities
type AnimationCSSNames =
  "bounce" | "shakeX" | "tada" |
  "flash" | "shakeY" | "wobble" |
  "pulse" | "headShake" | "jello" |
  "rubberBand" | "swing" | "heartBeat"
  ;

type AnimationCSSSpeed = "slower" | "normal" | "faster";

type AnimationCSSRepeat = false | "1" | "2" | "3";

interface IAnimation {
  name: AnimationCSSNames;
  speed: AnimationCSSSpeed;
  repeat: AnimationCSSRepeat;
  element: HTMLDivElement;
};

export default class Layout extends HTMLElement {
  readonly shadow: ShadowRoot;
  private readonly bootstrapCSS: string = `<link rel="stylesheet" type="text/css" href="/stylesheets/layout.min.css">`;
  private readonly bootstrapPopper: string = `<script src="/popper.min.js"></script>`;
  private readonly bootstrapJS: string = `<script src="/bootstrap.min.js"></script>`;
  private readonly animateCSS: string = `<link rel="stylesheet" type="text/css" href="/animate.min.css">`;
  private appendStyles: boolean = false;
  private stylesId: string = "";
  animationCSSQueue: IAnimation[] = [];
  animationCSSQueueListener: any = null;
  animationCSSQueueRunning: boolean = false;
  animationCSSQueueDelay: number = 400;
  interval: any = false;
  timeout: any = false;

  constructor() {
    super();

    // Criação da Shadow DOM
    // Modo open (Permite alterações externas)
    // Modo closed (Bloqueia alterações externas)
    this.shadow = this.attachShadow({ mode: 'open' });

    this.load_bootstrap();
    this.load_animateCSS();
    this.styles_define(`
      .animate__slower {
        --animate-duration: 2s;
      }

      .animate__normal {
        --animate-duration: 800ms;
      }

      .animate__faster {
        --animate-duration: 500ms;
      }
    `);
    setInterval(this.queue_animation.bind(this), this.animationCSSQueueDelay);
  };

  /**
   * @description Carrega o framework (Bootstrap)
   */
  load_bootstrap() {
    this
      .shadow
      .innerHTML += `
      ${this.bootstrapCSS}
      ${this.bootstrapPopper}
      ${this.bootstrapJS}
      `;
  };

  /**
   * @description Carrega o framework (Bootstrap)
   */
  load_animateCSS() {
    this
      .shadow
      .innerHTML += `
      ${this.animateCSS}
      `;
  };

  /**
   * @description Retorna um valor aleatório de 10 dígitos
   */
  index(): string {
    return String(Math.floor(Math.random() * 9e9));
  };

  /**
   * @description Verifica se os estilos já foram definidos
   */
  hasStyles(): boolean {
    return this.appendStyles;
  };

  /**
   * @description Realiza a definição dos estilos
   */
  styles_define(stylesheet: string): void {
    const style = document.createElement('style');

    style.id = `stylesheet-${this.index()}`;

    style.textContent = stylesheet;

    if (!this.hasStyles()) {
      this.appendStyles = true;
      this.stylesId = style.id;
      this.shadow.appendChild(style);
    } else {
      this.styles_update(stylesheet);
    };
  };

  /**
   * @description Realiza a atualização dos estilos
   */
  styles_update(stylesheet: string): void {
    const style = document.getElementById(this.stylesId);

    if (style)
      style.textContent += stylesheet;
  };

  /**
   * @description Adiciona classes a um elemento
   */
  append_class(element: Element | HTMLDivElement | HTMLButtonElement, className: string, separator: string = ' '): void {
    String(className)
      .split(separator)
      .forEach(className => element.classList.add(className));
  };

  /**
   * @description Executa uma varredura por todos os itens de uma coleção
   * atrás de uma classe especifica, após encontrar pega cada item filho
   * desse elemento e adiciona no container de destino
   */
  compose(children: HTMLCollection, container: HTMLDivElement, className: string): void {
    let elements: Element[] = [];

    Array
      .from({ length: children.length }, (_, i) => {
        const item = children.item(i);

        if (item && item.classList.contains(className)) {
          let
            j = 0,
            l = item.children.length;

          for (; j < l; j++) {
            let child = item.children.item(j);

            if (child) elements.push(child);
          };
        };
      });

    elements
      .forEach(element => container.appendChild(element));
  };

  /**
   * @description Cria um intervalo para realização de loops
   */
  create_interval(delay: number, callback: Function): void {
    if (!this.interval)
      this.interval = setInterval(() => callback(), delay);
  };

  /**
   * @description Cancela o interval para realização de loops
   */
  cancel_interval(): void {
    if (this.interval)
      clearInterval(this.interval), this.interval = false;
  };

  /**
   * @description Cria um timeout para chamada de funções depois de um tempo
   */
  create_timeout(delay: number, callback: Function): void {
    if (!this.timeout)
      this.timeout = setTimeout(() => callback(), delay);
  };

  /**
   * @description Cancela o timeout para chamada de funções depois de um tempo
   */
  cancel_timeout(): void {
    if (this.timeout)
      clearTimeout(this.timeout), this.timeout = false;
  };

  /**
   * @description Processa a fila de animações
   */
  queue_animation(): void {
    if (this.animationCSSQueue.length <= 0 || this.animationCSSQueueRunning)
      return;

    const animation = this.animationCSSQueue.at(0);

    if (animation) {
      this.process_animation(animation);
      this.animationCSSQueueRunning = true;
    };
  };

  /**
   * @description Remove a primeira animação da fila
   */
  shift_animation(): void {
    this.animationCSSQueue.shift();
    this.animationCSSQueueRunning = false;
  };

  /**
   * @description Busca por uma animação da fila
   */
  find_animation(name: AnimationCSSNames): IAnimation | undefined {
    return this.animationCSSQueue.find(animation => animation.name === name);
  };

  /**
   * @description Registra uma nova animação na fila
   */
  execute_animation(
    element: HTMLDivElement,
    name: AnimationCSSNames,
    speed: AnimationCSSSpeed,
    repeat: AnimationCSSRepeat
  ): void {
    this.animationCSSQueue.push({
      name,
      speed,
      repeat,
      element
    });
  };

  /**
   * @description Processa a animação da fila
   */
  process_animation(animation: IAnimation): void {
    const {
      name,
      speed,
      repeat,
      element
    } = animation;

    this.animationCSSQueueListener = () => {
      element.classList.remove(
        'animate__animated',
        `animate__${name}`,
        `animate__${speed}`
      );

      if (repeat) {
        element.classList.remove(`animate__repeat-${repeat}`);
      };

      $(element)
        .off("animationend");

      this.shift_animation();
    };

    $(element)
      .on('animationend', this.animationCSSQueueListener.bind(this));

    element.classList.add(
      'animate__animated',
      `animate__${name}`,
      `animate__${speed}`
    );

    if (repeat) {
      element.classList.add(`animate__repeat-${repeat}`);
    };
  };
};