import React, { useEffect, useState } from "react";

function App() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState();
  const [finalAmount, setFinalAmount] = useState(0);
  const [transaction, setTransaction] = useState([]);
  const [baseCurrency, setBaseCurrency] = useState("usd");
  const [currencyType, setCurrencyType] = useState("usd");
  const [currencies, setCurrencies] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [currentExchangeRate, setCurrentExchangeRate] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  

  //handleEdit fonksiyonuna item propu verildi. Bu item transaction mapinden gelen itemla ui tarafinda kullanilirken eslesecek. Transaction'daki degerler propumuzun ozellikleriyle ayarlandi
  const handleEdit = item => {
    setEditId(item.id);
    setDescription(item.description);
    setAmount(item.amount);
    setCurrencyType(item.currencyType);
    setShowModal(true);
  };

  //handleIncome gelir ekleme fonksiyonudur. Kullanicinin edit butonuna basma ihtimalina karsn bir if else olusturdum.
  //Eger editId varsa gecici yeni bir transaction degiskeni olusturdum transaction'i mapledim ve description, amount ve currencyType prop'larini guncelledim.
  // Sonra setTransaction ile transaction state'ini guncelledim ve editId'yi null yaptim.
  //Else islemini daha onceden transactionlari gostermek icin olusturmustum
  const handleIncome = e => {
    e.preventDefault();
    if (editId) {
      const tempTransaction = transaction.map(item => {
        if (item.id === editId) {
          return {
            ...item,
            description: description,
            amount: amount,
            currencyType: currencyType,
          };
        }
        return item;
      });
      setTransaction(tempTransaction);
      setEditId(null);
    } else {
      setAmount("");
      setDescription("");
      if (baseCurrency !== "usd") {
        setFinalAmount(finalAmount + parseFloat(amount) / exchangeRate);
      } else {
        setFinalAmount(finalAmount + parseFloat(amount));
      }
      if (currencyType !== "usd") {
        setFinalAmount(finalAmount + parseFloat(amount) / currentExchangeRate);
      } else {
        setFinalAmount(finalAmount + parseFloat(amount));
      }
      setTransaction([
        ...transaction,
        {
          id: Date.now(),
          description: description,
          amount: amount,
          currencyType: currencyType,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          color: "bg-green-200"
        },
      ]);
    }
  };

  const handleExpense = () => {
    setAmount("");
    setDescription("");
    if (baseCurrency !== "usd") {
      setFinalAmount(finalAmount - parseFloat(amount) / exchangeRate);
    } else {
      setFinalAmount(finalAmount - parseFloat(amount));
    }
    if (currencyType !== "usd") {
      setFinalAmount(finalAmount - parseFloat(amount) / currentExchangeRate);
    } else {
      setFinalAmount(finalAmount - parseFloat(amount));
    }
    setTransaction([
      ...transaction,
      {
        id: Date.now(),
        description: description,
        amount: amount,
        currencyType: currencyType,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        color: "bg-red-200"
      },
    ]);
  };

  useEffect(() => {
    fetch(`https://api.exchangerate.host/latest?base=USD`)
      .then(res => res.json())
      .then(data => {
        setCurrencies(Object.keys(data.rates));
        setExchangeRate(data.rates[baseCurrency.toUpperCase()]);
        setCurrentExchangeRate(data.rates[currencyType.toUpperCase()]);
      });
  }, [currencyType, baseCurrency]);

  console.log("currency type", currencyType);
  console.log("base currency", baseCurrency);
  console.log("exchange rate", exchangeRate);
  console.log("current exchange rate", currentExchangeRate);
  console.log("amount", amount);

  return (
    <div className="bg-slate-200 min-h-screen">
      <h1 className="text-3xl  font-bold text-center pt-6">Finance Tracker</h1>
      <div className="container mt-20 mx-auto ">
        <div className="p-5 bg-gradient-to-r from-indigo-500 rounded-lg shadow-xl">
          <h1 className="text-xl font-bold mb-4">
            Total Amount: {(finalAmount * exchangeRate).toFixed(1)}{" "}
            {baseCurrency.toUpperCase()}
          </h1>
          <h2 className="text-2xl font-bold mb-4">Transactions</h2>
          <div className="mb-4">
            <label htmlFor="currency" className="mr-2">
              Change Base Currency
            </label>
            <select
              id="currency"
              className="w-1/2 p-2 border border-gray-400 rounded shadow"
              onChange={e => setBaseCurrency(e.target.value)}
              value={baseCurrency}
            >
              {currencies.map(item => (
                <option key={item} value={item}>
                  {item.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <table className="w-full table-fixed text-center">
            <thead>
              <tr className="">
                <th>Description</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transaction.map(item => (
                <tr key={item.id} className={item.color}>
                  <td>{item.description}</td>
                  <td>{item.amount}</td>
                  <td>{item.currencyType}</td>
                  <td>{item.date}<br/>{item.time}</td>
                  <td>
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                      onClick={e => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center pt-16">
            <button
              className="bg-gradient-to-r from-red-500 to-red-900 hover:from-red-700 hover:to-rose-500 text-white p-3 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
              type="button"
              onClick={() => setShowModal(true)}
            >
              Add Your Transactions
            </button>
          </div>
          {/* MODAL */}
          {showModal ? (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*body*/}
                    <div className="relative p-6 flex-auto">
                      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 leading-tight">
                        Add Your Transaction
                      </h1>

                      <input
                        type="text"
                        placeholder="Description"
                        className="border border-gray-400 focus:border-blue-500 focus:outline-none p-4 mb-4 rounded-lg w-full transition duration-300 ease-in-out transform hover:scale-105"
                        onChange={e => setDescription(e.target.value)}
                        value={description}
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        className="border border-gray-400 focus:border-blue-500 focus:outline-none p-4 mb-4 rounded-lg w-full transition duration-300 ease-in-out transform hover:scale-105"
                        onChange={e => setAmount(e.target.value)}
                        value={amount}
                      />

                      <select
                        id="currency"
                        value={currencyType}
                        onChange={e => setCurrencyType(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:border-gray-700"
                      >
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>
                            {currency.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/*footer*/}
                    <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b space-x-2">
                      <button
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-900 hover:from-green-700 hover:to-teal-500 text-white p-3 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                        onClick={handleIncome}
                      >
                        Income
                      </button>
                      <button
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-900 hover:from-red-700 hover:to-rose-500 text-white p-3 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                        onClick={handleExpense}
                      >
                        Expense
                      </button>

                      <button
                        className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => setShowModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
