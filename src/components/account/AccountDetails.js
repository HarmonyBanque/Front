import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import Header from "../head_foot/Header";
import { Button } from "flowbite-react";
import Footer from "../head_foot/Footer";
import ConfirmDeactivateModal from "./conFirmeDeactivateModal";
import generatePDF from "../divers/generatePDF";
import {
  fetchAccountDetails,
  fetchTransactions,
  fetchAutomatiqueTransactions,
  cancelAutomatiqueTransaction,
  deactivateAccount,
} from "../divers/accountAPI";
import Graph from "../divers/Graph";

const AccountDetails = () => {
  const { token } = useContext(AuthContext);
  const { accountNumber } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [automatiqueTransactions, setAutomatiqueTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermInt, setSearchTermInt] = useState("");
  const searchTermIntAsNumber = Number(searchTermInt);

  useEffect(() => {
    if (token) {
      fetchAccountDetails(accountNumber, token)
        .then((data) => setAccount(data))
        .catch((error) => console.error(error));

      fetchTransactions(accountNumber, token)
        .then((data) => setTransactions(data))
        .catch((error) => console.error(error));

      fetchAutomatiqueTransactions(accountNumber, token)
        .then((data) => setAutomatiqueTransactions(data))
        .catch((error) => console.error(error));
    }
  }, [token, accountNumber]);

  const handleDeactivateAccount = async (password) => {
    return new Promise((resolve, reject) => {
      deactivateAccount(accountNumber, token)
        .then(() => {
          console.log("Compte désactivé avec succès");
          navigate("/");
          resolve();
        })
        .catch((error) => {
          console.error("Erreur lors de la désactivation du compte :", error);
          reject(new Error("Mot de passe incorrect"));
        });
    });
  };

  const handleCancelAutomatique = async (transactionId) => {
    if (token && transactionId) {
      try {
        const response = await cancelAutomatiqueTransaction(
          transactionId,
          token
        );
        setAutomatiqueTransactions(
          automatiqueTransactions.map((trans) =>
            trans.id === transactionId ? { ...trans, status: 0 } : trans
          )
        );
        console.log(response);
      } catch (error) {
        if (error.response) {
          console.log(error.response.data.detail);
        } else {
          console.log("An error occurred", error.message);
        }
      }
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true;
    else if (filter === "income")
      return (
        transaction.type === "deposit" ||
        transaction.type === "received_transaction"
      );
    else if (filter === "expenses") return transaction.type === "sent_transaction";
    else if (filter === "search" ) {
      if (transaction.description === null){
        return null
      }
      return transaction.description.toLocaleLowerCase().includes(searchTerm.toLowerCase())
    }
    else if (filter === "searchInt"){
      return transaction.amount.toString().includes(searchTermInt.toString())
    }
    return true;
    
  });

  const groupedTransactions = filteredTransactions.reduce(
    (acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString("fr-FR");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    },
    {}
  );

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const translateType = (type) => {
    switch (type) {
      case "deposit":
        return "Dépôt";
      case "received_transaction":
        return "Reçu";
      case "sent_transaction":
        return "Envoi";
      default:
        return type;
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 0:
        return "Annulé";
      case 1:
        return "En cours";
      default:
        return "Inconnu";
    }
  };

  if (!token) return <p>Vous devez être connecté pour voir cette page</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center pt-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center w-full max-w-4xl ">
          {account ? (
            <div className="mb-4 pb-2 rounded-lg shadow-md bg-gray-50">
              <p className="text-md font-semibold">{account.name}</p>
              <p className="text-md">
                Numéro de compte : {account.account_number}
              </p>
              <p className="text-md">
                Date de création : {formatDate(account.creation_date)}
              </p>
              <p className="text-md">Solde : {account.balance} €</p>
              {account.isMain ? null : (
                <button
                  onClick={openModal}
                  className="mt-2 px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 text-sm"
                >
                  Désactiver le compte
                </button>
              )}
            </div>
          ) : (
            <p>Chargement des détails du compte...</p>
          )}
          <div className="mb-4">
            <label htmlFor="search" className="block text-gray-700 mb-2">
                Rechercher une transaction :
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onClick={() => setFilter("")}
              onKeyUp={() => setFilter("search")}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              placeholder="Chercher une transaction"
            />
            <input
            id="searchInt"
            value={searchTermInt}
            onClick={() => setFilter("")}
            onKeyUp={() => setFilter("searchInt")}
            onChange={(e) => setSearchTermInt(e.target.value)}
            type="number"
          />
          </div>
          
          <div className="mb-2 flex justify-center space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-2 py-1 rounded-lg transition-colors duration-300 text-sm ${
                filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter("income")}
              className={`px-2 py-1 rounded-lg transition-colors duration-300 text-sm ${
                filter === "income" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Revenus
            </button>
            <button
              onClick={() => setFilter("expenses")}
              className={`px-2 py-1 rounded-lg transition-colors duration-300 text-sm ${
                filter === "expenses" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Dépenses
            </button>
            <button
              onClick={() => setFilter("automatique")}
              className={`px-2 py-1 rounded-lg transition-colors duration-300 text-sm ${
                filter === "automatique"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Prélèvements
            </button>
          </div>
          <div className="mb-4 overflow-x-auto max-h-[40vh] overflow-auto">
            {filter === "automatique" ? (
              <div className="overflow-x-auto max-h-[40vh] overflow-auto">
                {automatiqueTransactions.length > 0 ? (
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Montant</th>
                        <th className="py-2 px-4 border-b">Description</th>
                        <th className="py-2 px-4 border-b">Occurence</th>
                        <th className="py-2 px-4 border-b">Statut</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {automatiqueTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="py-2 px-4 border-b">
                            {transaction.id}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {transaction.amount} €
                          </td>
                          <td className="py-2 px-4 border-b">
                            {transaction.description}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {transaction.occurence} s
                          </td>
                          <td className="py-2 px-4 border-b">
                            {transaction.status === 2
                              ? "En cours"
                              : transaction.reason}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {transaction.status === 1 && (
                              <Button
                                color="red"
                                onClick={() =>
                                  handleCancelAutomatique(transaction.id)
                                }
                              >
                                Annuler
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-700">
                    Aucun prélèvement automatique trouvé
                  </p>
                )}
              </div>
            ) : (
              <div>
                {Object.keys(groupedTransactions).length > 0 ? (
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Date</th>
                        <th className="py-2 px-4 border-b">Type</th>
                        <th className="py-2 px-4 border-b">Montant</th>
                        <th className="py-2 px-4 border-b">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(groupedTransactions).map((date) =>
                        groupedTransactions[date].map((transaction) => (
                          <tr key={transaction.date} className="bg-white">
                            <td className="py-2 px-4 border-b">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="py-2 px-4 border-b">
                              {translateType(transaction.type)}
                            </td>
                            <td className="py-2 px-4 border-b">
                              {transaction.amount} €
                            </td>
                            <td className="py-2 px-4 border-b">
                              {transaction.description}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-700">Aucune transaction trouvée</p>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() =>
              generatePDF(
                account,
                filter === "automatique"
                  ? automatiqueTransactions
                  : filteredTransactions,
                formatDate,
                translateType
              )
            }
            className="mt-2 px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 text-sm"
          >
            Générer PDF
          </button>
        </div>
        <div className="w-full max-w-4xl mt-4">
          <Graph transactions={transactions} />
        </div>
      </main>
      <Footer />
      <ConfirmDeactivateModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        onConfirm={(password) => handleDeactivateAccount(password)}
        accountNumber={account?.account_number}
      />
    </div>
  );
};

export default AccountDetails;
