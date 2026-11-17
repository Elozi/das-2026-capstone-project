
class Node{
  constructor(value){
    this.value = value;
    this.next = null;
  }
}
export class  WaitlistQueue{
  #front = null;
  #rear = null;
  #length = 0;

  constructor(){

  }
  enqueue(value){
const newNode = new Node (value)

     if (this.#front === null){
      this.#front = newNode;
      this.#rear = newNode;
     

     } else{
      this.#rear.next = newNode;
      this.#rear =newNode;
     }
this.#length += 1;

 

  }
  dequeue(){
    if (this.#front === null){
      return null}
      else{
        const current = this.#front
        this.#front = this.#front.next
        if(this.#front === null){
      this.#rear = null}
      this.#length -=1
      return current.value}
  }
  peek(){
    if (this.#front === null){
      return  null
    }else
    {
      return this.#front.value
    }
  }
  size()
  {
    return this.#length
  }
}
