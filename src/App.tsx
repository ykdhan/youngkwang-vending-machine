import React, {useMemo, useState} from 'react';
import {delay, formatPrice} from "./utils";
import DATA from "./DATA.json";

enum Status {
  SELECT_ITEMS,
  PAY_WITH_CARD,
  PAY_WITH_CASH,
  PROCESSING_PAYMENT,
  PAYMENT_FAILED,
  PAYMENT_SUCCESS,
  DISPENSE_ITEM,
}

type Product = {
  name: string;
  price: number;
};

const DELAY = 1200;

function App() {
  const [status, setStatus] = useState<Status>(Status.SELECT_ITEMS);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const change = useMemo(() => selectedItem && cashAmount > 0 ? cashAmount - selectedItem.price : 0, [cashAmount, selectedItem]);

  const processPayment = async (success: boolean) => {
    setStatus(Status.PROCESSING_PAYMENT);
    await delay(DELAY);
    setStatus(success ? Status.PAYMENT_SUCCESS : Status.PAYMENT_FAILED);
    await delay(DELAY);
    setStatus(success ? Status.DISPENSE_ITEM : Status.SELECT_ITEMS);
  }

  const onClickItem = (item: Product) => {
    setSelectedItem((prev) => prev?.name === item.name ? null : item);
  }

  const onSelectCard = async (valid: boolean) => {
    processPayment(valid);
  }

  const onTakeItem = () => {
    setSelectedItem(null);
    setCashAmount(0);
    setStatus(Status.SELECT_ITEMS);
  }

  const onChargeCash = async (amount: number) => {
    if (!selectedItem || loading) return;
    setLoading(true);

    const newCashAmount = cashAmount + amount;
    setCashAmount(newCashAmount);

    if (newCashAmount < selectedItem.price) {
      setLoading(false);
      return;
    }

    await delay(DELAY);
    setLoading(false);

    processPayment(true);
  };

  return (
    <div className="flex flex-col max-w-xl p-5 mx-auto">
      <header className="flex flex-row items-center">
        <h1 className="text-2xl font-bold">자판기</h1>
      </header>
      <div className="flex flex-col gap-12 px-5 py-10">
        <div className="flex flex-col gap-4">
          <ul className="flex flex-row flex-wrap gap-4">
            {DATA.products.map((item: Product) => (
              <li className="flex flex-1" key={item.name}>
                <button onClick={() => onClickItem(item)} disabled={status !== Status.SELECT_ITEMS}
                        className={`flex flex-1 flex-col items-center border rounded-xl p-4 gap-2 ${selectedItem?.name === item.name ? 'border-neutral-700' : 'border-neutral-200'}`}>
                  <span className="text-md font-medium">{item.name}</span>
                  <span className="text-md">{formatPrice(item.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {status === Status.SELECT_ITEMS && !selectedItem && (
          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold">상품을 선택해주세요</p>
          </div>
        )}
        {status === Status.SELECT_ITEMS && selectedItem && (
          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold">결제 방법을 선택해주세요</p>
            <ul className="flex flex-row flex-wrap gap-4">
              <li className="flex flex-1">
                <button className="flex flex-1 p-4 border border-neutral-200 rounded-xl justify-center"
                        onClick={() => setStatus(Status.PAY_WITH_CARD)}>
                  <span className="text-md font-medium">카드</span>
                </button>
              </li>
              <li className="flex flex-1">
                <button className="flex flex-1 p-4 border border-neutral-200 rounded-xl justify-center"
                        onClick={() => setStatus(Status.PAY_WITH_CASH)}>
                  <span className="text-md font-medium">현금</span>
                </button>
              </li>
            </ul>
          </div>
        )}
        {status === Status.PAY_WITH_CARD && (
          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold">카드를 넣어주세요</p>
            <ul className="flex flex-row flex-wrap gap-4">
              <li className="flex flex-1">
                <button className="flex flex-1 p-4 border border-neutral-200 rounded-xl justify-center"
                        onClick={() => onSelectCard(true)}>
                  <span className="text-md font-medium">유효한 카드</span>
                </button>
              </li>
              <li className="flex flex-1">
                <button className="flex flex-1 p-4 border border-neutral-200 rounded-xl justify-center"
                        onClick={() => onSelectCard(false)}>
                  <span className="text-md font-medium">유효하지 않은 카드</span>
                </button>
              </li>
            </ul>
          </div>
        )}
        {status === Status.PAY_WITH_CASH && (
          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold">현금을 넣어주세요</p>
            <ul className="flex flex-row flex-wrap gap-4">
              {DATA.cash.map((item: number) => (
                  <li className="flex flex-1" key={item}>
                    <button className="flex flex-1 px-2 py-4 border border-neutral-200 rounded-xl justify-center"
                            onClick={() => onChargeCash(item)}>
                      <span className="text-md font-medium">{formatPrice(item)}</span>
                    </button>
                  </li>
              ))}
            </ul>
            <p className="text-xl font-bold">{formatPrice(cashAmount)}</p>
          </div>
        )}
        {status === Status.PROCESSING_PAYMENT && (
          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold">결제 진행중...</p>
          </div>
        )}
        {status === Status.PAYMENT_SUCCESS && (
          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold text-green-400">결제 성공</p>
          </div>
        )}
        {status === Status.PAYMENT_FAILED && (
          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold text-red-400">결제 실패</p>
          </div>
        )}
        {status === Status.DISPENSE_ITEM && selectedItem && (
          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold">상품이 나왔습니다</p>
            <div className="flex justify-center border border-neutral-200 rounded-xl py-8 px-2">
              <span className="text-lg font-medium">{selectedItem.name}</span>
            </div>
            {change > 0 && (
                <div className="flex justify-center p-4">
                  <span className="text-md font-medium">거스름돈 {formatPrice(change)}</span>
                </div>
            )}
            <button className="flex flex-1 p-4 bg-neutral-700 text-neutral-100 rounded-xl justify-center" onClick={onTakeItem}>
              <span className="text-md font-medium">{change ? '상품, 거스름돈 가져가기' : '상품 가져가기'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
