export const formatPrice = (price: number) => {
  return price.toLocaleString('ko-KR', {style: 'currency', currency: 'KRW'});
}

export const delay = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
