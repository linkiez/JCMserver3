export class InvalidArgumentError extends Error {
    constructor(mensagem:any) {
      super(mensagem);
      this.name = 'InvalidArgumentError';
    }
  }
  
  export class InternalServerError extends Error {
    constructor(mensagem:any) {
      super(mensagem);
      this.name = 'InternalServerError';
    }
  }
  
  export class InvalidTokenError extends Error {
    constructor(mensagem:any) {
      super(mensagem);
      this.name = 'InvalidTokenError';
    }
  }

