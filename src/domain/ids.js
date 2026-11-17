import {randomUUID, randomInt} from 'node:crypto';

export function newId()
{
  let randomnum=randomUUID();
  return randomnum;
}
export function newReference(){
  const characters = "ABCDEFGHIJkLMNPQRSTUVWXYZ123456789";
  let reference = "";
  for (let i = 0; i < 8; i++) {
    reference+= characters[randomInt(0, characters.length)];
  }

  return reference;
}
