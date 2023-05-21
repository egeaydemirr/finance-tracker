import { useEffect, useState } from "react";

function App() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState();
  const [totalAmount, setTotalAmount] = useState(0);
  const [baseCurrency, setBaseCurrency] = useState(() => {
    const storedBaseCurrency = localStorage.getItem("baseCurrency");
    return storedBaseCurrency ? storedBaseCurrency : "USD";
  });
  const [currencyType, setCurrencyType] = useState("USD");
  const [currencies, setCurrencies] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionType, setTransactionType] = useState("Income");
  const [transaction, setTransaction] = useState(() => {
    const data = localStorage.getItem("transaction");
    return data ? JSON.parse(data) : [];
  });

  useEffect(() => {
    localStorage.setItem("transaction", JSON.stringify(transaction));
  }, [transaction]);

  useEffect(() => {
    localStorage.setItem("baseCurrency", baseCurrency);
  }, [baseCurrency]);

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

  const handleDelete = id => {
    const newTransaction = transaction.filter(item => item.id !== id);
    setTransaction(newTransaction);
  };

  const handleEdit = id => {
    const newTransaction = transaction.find(item => item.id === id);
    setSelectedTransaction(newTransaction);
    setShowEditModal(true);
    setDescription(newTransaction.description);
    setAmount(newTransaction.amount);
    setCurrencyType(newTransaction.currencyType);
    setTransactionType(newTransaction.type);
  };
  const saveChanges = () => {
    const updatedTransaction = transaction.map(item => {
      if (item.id === selectedTransaction.id) {
        return {
          ...item,
          description,
          amount,
          currencyType,
          type: transactionType,
        };
      }

      return item;
    });
    setTransaction(updatedTransaction);
    setAmount("");
    setDescription("");
    setCurrencyType("USD");
    setTransactionType("Income");
    setSelectedTransaction(null);
    setShowEditModal(false);
  };

  useEffect(() => {
    fetch(`https://api.exchangerate.host/latest?base=${baseCurrency}`)
      .then(res => res.json())
      .then(data => {
        setCurrencies(data.rates);
        setLoading(true);
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
    let total = 0;
    for (const item of transaction) {
      const { amount, currencyType, type } = item;
      const rate = 1 / currencies[currencyType];
      const amountInBaseCurrency = amount * rate;

      if (type === "Income") {
        total += amountInBaseCurrency;
      } else {
        total -= amountInBaseCurrency;
      }
    }
    setTotalAmount(total);
    setLoading(false);
  }, [transaction, currencies]);

  function TransactionModal() {
    return (
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
              <div className="flex justify-between p-6 border-t border-solid border-slate-200 rounded-b space-x-2">
                <select
                  value={transactionType}
                  onChange={e => setTransactionType(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 "
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>

                <button
                  className="flex-shrink-0 bg-gradient-to-r from-green-500 to-green-900 hover:from-green-700 hover:to-teal-500 text-white p-3 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                  onClick={() => {
                    if (transactionType === "Income") {
                      handleIncome();
                    } else if (transactionType === "Expense") {
                      handleExpense();
                    }
                  }}
                >
                  Add Transaction
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
    );
  }

  function EditModal() {
    return (
      <>
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-3xl">
            {/*content*/}
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/*body*/}
              <div className="relative p-6 flex-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 leading-tight">
                  Edit Your Transaction
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
              <div className="flex justify-between p-6 border-t border-solid border-slate-200 rounded-b space-x-2">
                <select
                  value={transactionType}
                  onChange={e => setTransactionType(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 "
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>

                <button
                  className="flex-2 bg-gradient-to-r from-green-500 to-green-900 hover:from-green-700 hover:to-teal-500 text-white p-3 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                  onClick={saveChanges}
                >
                  Save Changes
                </button>

                <button
                  className="text-red-500 font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
      </>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-300 to-indigo-500 min-h-screen">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex flex-row justify-center">
          <img src="logo.png" alt="Logo" className="w-64 pt-2" />
        </div>
        <div className="p-5  rounded-lg">
          <div className="flex flex-row justify-between">
            <h2 className=" text-lg font-semibold mb-4 ">
              Total Amount:{" "}
              {loading ? (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                totalAmount.toLocaleString(undefined, {
                  style: "currency",
                  currency: baseCurrency,
                })
              )}
            </h2>
          </div>
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

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold ">Transactions</h2>
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
                    <td className="flex flex-row px-4 py-2 text-center">
                      <button
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-900 hover:from-green-700 hover:to-green-500 text-white p-2 mx-2 rounded-md shadow-lg duration-300 hover:-translate-y-1"
                        type="button"
                        onClick={() => handleEdit(item.id)}
                      >
                        Edit
                      </button>

                      <button
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-900 hover:from-red-700 hover:to-rose-500 text-white p-2 mx-2 rounded-md shadow-lg duration-300 hover:-translate-y-1"
                        type="button"
                        onClick={() => handleDelete(item.id)}
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
          {showModal ? TransactionModal() : null}
          {/* EDIT MODAL */}
          {showEditModal ? EditModal() : null}
        </div>
      </div>
    </div>
  );
}

export default App;
