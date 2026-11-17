export class DomainError extends Error{
  constructor(message,code, details = {}){
    super(message);
    this.code = code;
    this.name ="DomainError"
    this.details = details;
  }
}
