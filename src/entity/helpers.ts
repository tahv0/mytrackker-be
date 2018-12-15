
export function randomIntFromInterval(min, max) // min and max included
{
  return Math.floor(Math.random()*(max - min +1 ) + min);
}
export function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
