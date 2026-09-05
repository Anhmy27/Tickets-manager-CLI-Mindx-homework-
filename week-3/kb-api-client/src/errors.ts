export class KBClientValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'KBClientValidationError'
  }
}

export class KBClientNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'KBClientNotFoundError'
  }
}

export class KBClientRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'KBClientRequestError'
  }
}
