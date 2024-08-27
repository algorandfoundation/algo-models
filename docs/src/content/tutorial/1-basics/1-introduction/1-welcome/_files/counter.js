import {SignTransactionsParams} from "@algorandfoundation/algo-models/provider";

export function setupCounter(element) {
  let counter = 0;
  console.log(SignTransactionsParams)
  const setCounter = (count) => {
    counter = count;
    element.innerHTML = `count is ${counter}`;
  };

  setCounter(0);
}
