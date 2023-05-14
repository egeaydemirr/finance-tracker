import { useEffect, useState } from "react";

function App() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState();
  const [totalAmount, setTotalAmount] = useState(0);
  const [transaction, setTransaction] = useState([]);
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [currencyType, setCurrencyType] = useState("USD");
  const [currencies, setCurrencies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleIncome = () => {
    if (!description || !amount) {
      setShowModal(true);
      return;
    }
    setAmount("");
    setDescription("");
    setTransaction([
      ...transaction,
      {
        id: Date.now(),
        description: description,
        amount: amount,
        currencyType: currencyType,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        type: "Income",
      },
    ]);
  };

  const handleExpense = () => {
    if (!description || !amount) {
      setShowModal(true);
      return;
    }

    setAmount("");
    setDescription("");
    setTransaction([
      ...transaction,
      {
        id: Date.now(),
        description: description,
        amount: amount,
        currencyType: currencyType,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        type: "Expense",
      },
    ]);
  };

  useEffect(() => {
    fetch(`https://api.exchangerate.host/latest?base=${baseCurrency}`)
      .then(res => res.json())
      .then(data => {
        setCurrencies(data.rates);
        // console.log("rate", data.rates[baseCurrency]);
        // console.log("ikicin rate:", currencies[baseCurrency]);
      });
  }, [baseCurrency]);

  useEffect(() => {
    const total = transaction.reduce((toplam, item) => {
      return item.type === "Income"
        ? toplam + parseFloat(item.amount)
        : toplam - parseFloat(item.amount);
    }, 0);

    setTotalAmount(total);
  }, [transaction]);

  useEffect(() => {
    const currentExchangeRate = currencies[baseCurrency];
    const newTransaction = transaction.map(item => {
      return {
        ...item,
        amount: (item.amount * currentExchangeRate).toFixed(2),
        currencyType: baseCurrency,
      };
    });
    setTransaction(newTransaction);
  }, [baseCurrency]);

  useEffect(() => {
    const exchangeRate = currencies[currencyType];
    const newTransaction = transaction.map(item => {
      return {
        ...item,
        amount: (item.amount / exchangeRate).toFixed(2),
        currencyType: currencyType,
      };
    });
    setTransaction(newTransaction);
  }, [currencyType]);

  console.log("currency type", currencyType);
  console.log("base currency", baseCurrency);
  console.log("transaction", transaction);

  // console.log("current exchange rate", currentExchangeRate);
  console.log("amount", amount);

  return (
    <div className="bg-gradient-to-r from-blue-300 to-indigo-500 min-h-screen">
      <h1 className="text-3xl font-bold text-center pt-12">FINANCE TRACKER</h1>
      <div className="container mx-auto mt-20">
        <img
          src="public/logo.png"
          alt="Logo"
          className="w-32 absolute top-10 left-10"
        />

        <div className="p-5  rounded-lg">
          <h2 className="text-lg font-semibold mb-4 ">
            Total Amount:{" "}
            {totalAmount.toLocaleString(undefined, {
              style: "currency",
              currency: baseCurrency,
            })}
          </h2>
          <div className="mb-4  flex flex-row">
            <label htmlFor="currency" className="m-2 rounded-md w ">
              Change Base Currency
            </label>
            <select
              id="currency"
              className="w-70 text-gray-600 px-4 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:border-gray-700"
              onChange={e => setBaseCurrency(e.target.value)}
              value={baseCurrency}
            >
              {Object.keys(currencies).map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <h2 className="text-2xl font-bold mb-4">Transactions</h2>
          <div className="flex justify-between items-center">
            <div className="flex items-center ml-auto">
              <input
                type="text"
                placeholder="Search by description..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-3 py-2 m-2 text-sm border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
              />
            </div>
          </div>
          <table
            id="transactionTable"
            className="w-full table-fixed text-center rounded-lg overflow-hidden"
          >
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-center text-gray-700 font-bold">
                  DESCRIPTION
                </th>
                <th className="px-4 py-2 text-center text-gray-700 font-bold">
                  AMOUNT
                </th>
                <th className="px-4 py-2 text-center text-gray-700 font-bold">
                  CURRENCY
                </th>
                <th className="px-4 py-2 text-center text-gray-700 font-bold">
                  TYPE
                </th>
                <th className="px-4 py-2 text-center text-gray-700 font-bold">
                  DATE / TIME
                </th>
                <th className="px-4 py-2 text-center text-gray-700 font-bold">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {transaction
                .filter(item =>
                  item.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map(item => (
                  <tr
                    key={item.id}
                    className={
                      item.type === "Income" ? "bg-green-300" : "bg-red-300"
                    }
                  >
                    <td className="px-4 py-2  text-gray-700 text-center">
                      {item.description}
                    </td>
                    <td className="px-4 py-2  text-gray-700 text-center">
                      {item.amount}
                    </td>
                    <td className="px-4 py-2  text-gray-700 text-center">
                      {item.currencyType}
                    </td>
                    <td className="px-4 py-2  text-gray-700 text-center">
                      {item.type}
                    </td>
                    <td className="px-4 py-2  text-gray-700 text-center">
                      <div className="text-sm text-gray-500">{item.date}</div>
                      <div className="text-xs text-gray-500">{item.time}</div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="flex-1  bg-gradient-to-r from-red-500 to-red-900 hover:from-red-700 hover:to-rose-500 text-white p-2 mx-2 rounded-md shadow-lg duration-300 hover:-translate-y-1"
                        type="button"
                        // onClick={() => handleDelete(item.id)}
                      >
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
                        {Object.keys(currencies).map(currency => (
                          <option key={currency} value={currency}>
                            {currency}
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
